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

// Zerion API v1 — free tier: 300 calls/day
// Docs: https://developers.zerion.io/reference/listwalletpositions
// Auth: Basic com API key (base64 encoded)
const ZERION_BASE = "https://api.zerion.io/v1";

// Mapeia chain_id da Zerion para nome legível
const CHAIN_NAMES: Record<string, string> = {
  ethereum:  "Ethereum",
  polygon:   "Polygon",
  arbitrum:  "Arbitrum",
  optimism:  "Optimism",
  base:      "Base",
  bsc:       "BSC",
  avalanche: "Avalanche",
  fantom:    "Fantom",
  gnosis:    "Gnosis",
  linea:     "Linea",
  scroll:    "Scroll",
  zksync:    "zkSync",
};

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const apiKey  = req.nextUrl.searchParams.get("key");

  if (!address) {
    return NextResponse.json(
      { error: "Endereço de wallet é obrigatório" },
      { status: 400 }
    );
  }
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key da Zerion é obrigatória. Crie uma grátis em dashboard.zerion.io" },
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

  // Basic Auth: base64("apikey:")
  const basicAuth = Buffer.from(`${apiKey}:`).toString("base64");

  try {
    // Busca todas as posições DeFi (deposit, staked, locked, reward)
    // filter[positions]=only_complex traz posições DeFi (não tokens simples)
    const url = new URL(`${ZERION_BASE}/wallets/${address}/positions/`);
    url.searchParams.set("currency", "usd");
    url.searchParams.set("filter[positions]", "only_complex");
    url.searchParams.set("filter[trash]", "only_non_trash");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: "application/json",
      },
      // Sem cache no servidor (dados em tempo real)
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg = res.status === 401
        ? "API key inválida. Verifique sua chave em dashboard.zerion.io"
        : res.status === 429
        ? "Limite de requisições atingido. O plano gratuito permite 300 calls/dia."
        : `Zerion API retornou ${res.status}: ${text.slice(0, 200)}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const json = await res.json() as {
      data?: ZerionPosition[];
      errors?: { title: string }[];
    };

    if (json.errors?.length) {
      return NextResponse.json(
        { error: `Erro da API: ${json.errors[0]?.title ?? "Desconhecido"}` },
        { status: 422 }
      );
    }

    const positions: ZerionPosition[] = json.data ?? [];

    // Agrupa por group_id (posições de LP compartilham o mesmo group_id)
    const groups: Record<string, ZerionPosition[]> = {};
    for (const pos of positions) {
      const gid = pos.attributes.group_id ?? pos.id;
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(pos);
    }

    const pools: DetectedPool[] = [];

    for (const [, group] of Object.entries(groups)) {
      if (group.length === 0) continue;

      // Valor total do grupo (soma de todas as posições)
      const totalUSD = group.reduce((s, p) => s + (p.attributes.value ?? 0), 0);
      if (totalUSD <= 0) continue;

      // Protocolo e chain da primeira posição do grupo
      const first    = group[0];
      const protocol = first.attributes.app_id ?? first.attributes.protocol ?? "DeFi";
      const chainId  = first.relationships?.chain?.data?.id ?? "";
      const network  = CHAIN_NAMES[chainId] ?? chainId ?? "Unknown";

      const rawTokens: DetectedPool["rawTokens"] = group.map((p) => ({
        symbol:   (p.attributes.fungible_info?.symbol ?? p.attributes.name ?? "?").toUpperCase(),
        amount:   p.attributes.quantity?.float ?? 0,
        priceUSD: p.attributes.price ?? 0,
      }));

      const tokenA = rawTokens[0]?.symbol ?? "?";
      const tokenB = rawTokens[1]?.symbol ?? tokenA;

      pools.push({
        protocol: capitalizeProtocol(protocol),
        tokenA,
        tokenB,
        network,
        chain: chainId,
        currentValueUSD: totalUSD,
        depositedUSD:    totalUSD,
        rawTokens,
      });
    }

    return NextResponse.json({ pools, total: pools.length });
  } catch (err) {
    return NextResponse.json(
      { error: `Erro de conexão: ${String(err)}` },
      { status: 502 }
    );
  }
}

// ─── Tipos Zerion ──────────────────────────────────────────────────────────────

interface ZerionPosition {
  id: string;
  attributes: {
    name:      string;
    group_id?: string;
    protocol?: string;
    app_id?:   string;
    position_type: string;
    value?:  number;
    price?:  number;
    quantity?: { float: number; decimals: number };
    fungible_info?: { symbol?: string; name?: string };
  };
  relationships?: {
    chain?: { data?: { id: string } };
  };
}

function capitalizeProtocol(s: string): string {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
