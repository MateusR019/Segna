"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDefiStore } from "@/store/defiStore";
import { SYMBOL_TO_ID } from "@/lib/cryptoSymbols";

export function CryptoRefreshButton() {
  const { tokens, updatePrice, updatePriceUSD, setExchangeRate } = useDefiStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Busca cotação USD/BRL independentemente (sem precisar de tokens) */
  const fetchExchangeRate = useCallback(async () => {
    try {
      const res = await fetch("/api/exchange-rate", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.usdToBRL) setExchangeRate(data.usdToBRL);
    } catch {
      // silencioso
    }
  }, [setExchangeRate]);

  const fetchPrices = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);

      const idMap: Record<string, string> = {};
      tokens.forEach((t) => {
        const geckoId = SYMBOL_TO_ID[t.symbol.toUpperCase()];
        if (geckoId) idMap[geckoId] = t.id;
      });

      const geckoIds = Object.keys(idMap);

      if (geckoIds.length === 0) {
        // Sem tokens: só busca cotação
        await fetchExchangeRate();
        if (!silent) setLoading(false);
        return;
      }

      try {
        const url = `/api/crypto-prices?ids=${geckoIds.join(",")}`;
        const res = await fetch(url, { cache: "no-store" });

        if (res.status === 429) throw new Error("rate_limit");
        if (!res.ok) throw new Error("upstream");

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        let updated = 0;
        let derivedRate: number | null = null;

        geckoIds.forEach((geckoId) => {
          const brl: number | undefined = data[geckoId]?.brl;
          const usd: number | undefined = data[geckoId]?.usd;
          const tokenId = idMap[geckoId];

          if (brl && tokenId) { updatePrice(tokenId, brl); updated++; }
          if (usd && tokenId) { updatePriceUSD(tokenId, usd); }
          // Deriva cotação a partir do ratio BRL/USD
          if (brl && usd && !derivedRate) derivedRate = brl / usd;
        });

        if (derivedRate) {
          setExchangeRate(derivedRate);
        } else {
          await fetchExchangeRate();
        }

        if (updated > 0) {
          setLastUpdated(
            new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          );
        } else if (!silent) {
          setError("Nenhum preço retornado pela API");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "rate_limit") setError("Rate limit — aguarde 1 min");
        else if (!silent) setError("Falha ao buscar preços");
        await fetchExchangeRate();
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tokens, updatePrice, updatePriceUSD, setExchangeRate, fetchExchangeRate]
  );

  // Auto-fetch silencioso ao montar (sempre — mesmo sem tokens)
  useEffect(() => {
    fetchPrices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && !error && (
        <span className="text-xs text-[#6b7280]">Atualizado {lastUpdated}</span>
      )}
      {error && <span className="text-xs text-[#ef4444]">{error}</span>}
      <Button
        size="sm"
        variant="outline"
        onClick={() => fetchPrices(false)}
        disabled={loading}
        className="h-8 text-xs border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:text-white hover:border-[#3a3a3a] cursor-pointer"
      >
        <RefreshCw size={12} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Buscando..." : "Atualizar preços"}
      </Button>
    </div>
  );
}
