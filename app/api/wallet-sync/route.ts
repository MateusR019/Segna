import { NextRequest, NextResponse } from "next/server";

export interface DetectedPool {
  protocol: string;
  tokenA: string;
  tokenB: string;
  network: string;
  chain: string;
  currentValueUSD: number;
  depositedUSD: number;
  rawTokens: { symbol: string; amount: number; priceUSD: number }[];
}

// Zapper public GraphQL API (sem API key necessária)
const ZAPPER_GRAPHQL = "https://public.zapper.xyz/graphql";

// Query usando portfolioV2 + appBalances — schema corrigido (Zapper 2025)
// Diferença crítica:
//   ContractPositionBalance.tokens → array de TokenWithMetaType { metaType, token { ...AbstractToken } }
//   AppTokenPositionBalance.tokens → array de AbstractToken direto (sem wrapper, sem metaType)
const PORTFOLIO_QUERY = `
  query PortfolioV2($addresses: [Address!]!) {
    portfolioV2(addresses: $addresses) {
      appBalances {
        totalBalanceUSD
        byApp(first: 30) {
          edges {
            node {
              app {
                displayName
                slug
              }
              network {
                name
                chainId
              }
              balanceUSD
              positionBalances(first: 20) {
                edges {
                  node {
                    ... on ContractPositionBalance {
                      balanceUSD
                      tokens {
                        metaType
                        token {
                          symbol
                          balance
                          balanceUSD
                          price
                        }
                      }
                    }
                    ... on AppTokenPositionBalance {
                      balanceUSD
                      symbol
                      price
                      balance
                      tokens {
                        symbol
                        balance
                        balanceUSD
                        price
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Endereço de wallet é obrigatório" },
      { status: 400 }
    );
  }

  // Validação básica de endereço EVM
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Endereço inválido. Use um endereço EVM (0x...)" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(ZAPPER_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: PORTFOLIO_QUERY,
        variables: { addresses: [address] },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `API retornou ${res.status}: ${text.slice(0, 200)}` },
        { status: res.status }
      );
    }

    const json = await res.json();

    if (json.errors?.length) {
      return NextResponse.json(
        { error: `Erro da API: ${json.errors[0]?.message ?? "Desconhecido"}` },
        { status: 422 }
      );
    }

    const appEdges: Record<string, unknown>[] =
      json?.data?.portfolioV2?.appBalances?.byApp?.edges ?? [];

    const pools: DetectedPool[] = [];

    for (const edge of appEdges) {
      const node = edge.node as Record<string, unknown>;
      const app = node.app as Record<string, unknown>;
      const network = node.network as Record<string, unknown>;
      const appBalanceUSD = Number(node.balanceUSD ?? 0);
      if (appBalanceUSD <= 0) continue;

      const appName = String(app?.displayName ?? app?.slug ?? "Unknown");
      const networkName = String(network?.name ?? "Unknown");
      const chainId = String(network?.chainId ?? "");

      const posEdges = (node.positionBalances as Record<string, unknown>)
        ?.edges as Record<string, unknown>[] ?? [];

      for (const posEdge of posEdges) {
        const pos = posEdge.node as Record<string, unknown>;
        const posBalance = Number(pos?.balanceUSD ?? 0);
        if (posBalance <= 0) continue;

        // Extrai tokens da posição
        // ContractPositionBalance: tokens = [{ metaType, token: { symbol, balance, ... } }]
        // AppTokenPositionBalance:  tokens = [{ symbol, balance, ... }] (AbstractToken direto)
        const tokenEntries = (pos.tokens as Record<string, unknown>[]) ?? [];

        const rawTokens: { symbol: string; amount: number; priceUSD: number }[] = [];
        for (const entry of tokenEntries) {
          // Se tiver campo "token" dentro, é o wrapper TokenWithMetaType (ContractPosition)
          // Caso contrário é AbstractToken direto (AppToken)
          const t = (entry.token != null ? entry.token : entry) as Record<string, unknown>;
          const sym = String(t?.symbol ?? "?").toUpperCase();
          const balance = Number(t?.balance ?? 0);
          const price = Number(t?.price ?? 0);
          rawTokens.push({ symbol: sym, amount: balance, priceUSD: price });
        }

        const tokenA = rawTokens[0]?.symbol ?? "?";
        const tokenB = rawTokens[1]?.symbol ?? tokenA;

        pools.push({
          protocol: appName,
          tokenA,
          tokenB,
          network: networkName,
          chain: chainId,
          currentValueUSD: posBalance,
          depositedUSD: posBalance,
          rawTokens,
        });
      }

      // Fallback: se não há posições individuais, usa o saldo agregado do app
      if (posEdges.length === 0 && appBalanceUSD > 0) {
        pools.push({
          protocol: appName,
          tokenA: "?",
          tokenB: "?",
          network: networkName,
          chain: chainId,
          currentValueUSD: appBalanceUSD,
          depositedUSD: appBalanceUSD,
          rawTokens: [],
        });
      }
    }

    return NextResponse.json({ pools, total: pools.length });
  } catch (err) {
    return NextResponse.json(
      { error: `Erro de conexão com a API: ${String(err)}` },
      { status: 502 }
    );
  }
}
