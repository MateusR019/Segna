import { NextRequest, NextResponse } from "next/server";

const CHAIN_MAP: Record<string, string> = {
  ethereum: "Ethereum",
  "binance-smart-chain": "BSC",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  avalanche: "Avalanche",
  base: "Base",
  fantom: "Fantom",
  gnosis: "Gnosis",
};

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

const PORTFOLIO_QUERY = `
  query Portfolio($addresses: [Address!]!) {
    portfolio(addresses: $addresses) {
      appTokenPositions {
        appName
        network
        balanceUSD
        tokens {
          symbol
          balance
          price
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

    const positions: Record<string, unknown>[] =
      json?.data?.portfolio?.appTokenPositions ?? [];

    const pools: DetectedPool[] = [];

    for (const pos of positions) {
      const balanceUSD = Number(pos.balanceUSD ?? 0);
      if (balanceUSD <= 0) continue;

      const tokens = (pos.tokens as Record<string, unknown>[]) ?? [];
      if (tokens.length < 2) continue;

      const tokenA = String(tokens[0]?.symbol ?? "?").toUpperCase();
      const tokenB = String(tokens[1]?.symbol ?? "?").toUpperCase();
      const chainKey = String(pos.network ?? "").toLowerCase();
      const network = CHAIN_MAP[chainKey] ?? String(pos.network ?? "Unknown");

      pools.push({
        protocol: String(pos.appName ?? "Unknown"),
        tokenA,
        tokenB,
        network,
        chain: chainKey,
        currentValueUSD: balanceUSD,
        depositedUSD: balanceUSD,
        rawTokens: tokens.map((t) => ({
          symbol: String(t.symbol ?? "").toUpperCase(),
          amount: Number(t.balance ?? 0),
          priceUSD: Number(t.price ?? 0),
        })),
      });
    }

    return NextResponse.json({ pools, total: pools.length });
  } catch (err) {
    return NextResponse.json(
      { error: `Erro de conexão com a API: ${String(err)}` },
      { status: 502 }
    );
  }
}
