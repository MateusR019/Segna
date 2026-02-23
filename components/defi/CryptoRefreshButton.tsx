"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDefiStore } from "@/store/defiStore";

// CoinGecko ID mapping for common symbols
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  USDT: "tether",
  USDC: "usd-coin",
  ADA: "cardano",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  XRP: "ripple",
  DOGE: "dogecoin",
  LTC: "litecoin",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
};

export function CryptoRefreshButton() {
  const { tokens, updatePrice } = useDefiStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrices() {
    setLoading(true);
    setError(null);

    const ids = tokens
      .map((t) => SYMBOL_TO_ID[t.symbol.toUpperCase()])
      .filter(Boolean);

    if (ids.length === 0) {
      setError("Nenhum token com cotação automática disponível");
      setLoading(false);
      return;
    }

    try {
      // Use internal proxy to avoid CORS issues with CoinGecko free tier
      const url = `/api/crypto-prices?ids=${ids.join(",")}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 429) throw new Error("rate_limit");
      if (!res.ok) throw new Error("upstream");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let updated = 0;
      tokens.forEach((token) => {
        const id = SYMBOL_TO_ID[token.symbol.toUpperCase()];
        if (id && data[id]?.brl) {
          updatePrice(token.id, data[id].brl);
          updated++;
        }
      });

      setLastUpdated(
        new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      if (updated === 0) {
        setError("Nenhum token atualizado (símbolo não reconhecido)");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "rate_limit") {
        setError("Limite de requisições atingido. Aguarde 1 min.");
      } else {
        setError("Falha ao buscar preços. Verifique o console.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && !error && (
        <span className="text-xs text-[#6b7280]">
          Atualizado às {lastUpdated}
        </span>
      )}
      {error && <span className="text-xs text-[#ef4444]">{error}</span>}
      <Button
        size="sm"
        variant="outline"
        onClick={fetchPrices}
        disabled={loading || tokens.length === 0}
        className="h-8 text-xs border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:text-white hover:border-[#3a3a3a] cursor-pointer"
      >
        <RefreshCw
          size={12}
          className={`mr-1.5 ${loading ? "animate-spin" : ""}`}
        />
        {loading ? "Buscando..." : "Atualizar Preços"}
      </Button>
    </div>
  );
}
