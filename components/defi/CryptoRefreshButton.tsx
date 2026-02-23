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
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=brl`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erro na API");
      const data = await res.json();

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
    } catch {
      setError("Falha ao buscar preços. Tente novamente.");
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
