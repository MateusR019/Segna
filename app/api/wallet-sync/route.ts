import { NextRequest, NextResponse } from "next/server";

const CHAIN_MAP: Record<string, string> = {
  eth: "Ethereum",
  bsc: "BSC",
  matic: "Polygon",
  arb: "Arbitrum",
  op: "Optimism",
  avax: "Avalanche",
  sol: "Solana",
  base: "Base",
  ftm: "Fantom",
  xdai: "Gnosis",
  cro: "Cronos",
  klay: "Klaytn",
  hmy: "Harmony",
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

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const apiKey = req.nextUrl.searchParams.get("key");

  if (!address || !apiKey) {
    return NextResponse.json(
      { error: "Endereço de wallet e API key são obrigatórios" },
      { status: 400 }
    );
  }

  let data: Record<string, unknown>[];
  try {
    const res = await fetch(
      `https://pro-openapi.debank.com/v1/user/complex_protocol_list?id=${encodeURIComponent(address)}`,
      {
        headers: {
          AccessKey: apiKey,
          accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `DeBank retornou ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    data = await res.json();
  } catch (err) {
    return NextResponse.json(
      { error: `Erro de conexão: ${String(err)}` },
      { status: 502 }
    );
  }

  const pools: DetectedPool[] = [];

  for (const protocol of data) {
    const network =
      CHAIN_MAP[protocol.chain as string] ?? String(protocol.chain).toUpperCase();
    const protocolName = String(protocol.name ?? protocol.id ?? "Unknown");

    for (const item of (protocol.portfolio_item_list as Record<string, unknown>[]) ?? []) {
      // Only LP positions
      if (item.name !== "Liquidity Pool") continue;

      const detail = item.detail as Record<string, unknown> | undefined;
      const tokens = (detail?.supply_token_list as Record<string, unknown>[]) ?? [];
      if (tokens.length < 1) continue;

      const stats = item.stats as Record<string, number> | undefined;
      const value = stats?.net_usd_value ?? 0;
      if (value <= 0) continue;

      const tokenA = String(tokens[0]?.symbol ?? "?").toUpperCase();
      const tokenB = tokens[1]
        ? String(tokens[1].symbol ?? "?").toUpperCase()
        : tokenA;

      pools.push({
        protocol: protocolName,
        tokenA,
        tokenB,
        network,
        chain: String(protocol.chain),
        currentValueUSD: value,
        depositedUSD: value,
        rawTokens: tokens.map((t) => ({
          symbol: String(t.symbol ?? "").toUpperCase(),
          amount: Number(t.amount ?? 0),
          priceUSD: Number(t.price ?? 0),
        })),
      });
    }
  }

  return NextResponse.json({ pools, total: pools.length });
}
