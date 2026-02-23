"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDefiStore } from "@/store/defiStore";
import { SYMBOL_TO_ID } from "@/lib/cryptoSymbols";

export function CryptoRefreshButton() {
  const { tokens, updatePrice } = useDefiStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    const idMap: Record<string, string> = {}; // geckoId -> tokenId
    tokens.forEach((t) => {
      const geckoId = SYMBOL_TO_ID[t.symbol.toUpperCase()];
      if (geckoId) idMap[geckoId] = t.id;
    });

    const geckoIds = Object.keys(idMap);

    if (geckoIds.length === 0) {
      if (!silent) {
        const unknowns = tokens.map((t) => t.symbol.toUpperCase()).join(", ");
        setError(`Símbolo não mapeado: ${unknowns}`);
        setLoading(false);
      }
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
      geckoIds.forEach((geckoId) => {
        const price = data[geckoId]?.brl;
        const tokenId = idMap[geckoId];
        if (price && tokenId) {
          updatePrice(tokenId, price);
          updated++;
        }
      });

      if (updated > 0) {
        setLastUpdated(
          new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        );
      } else {
        setError("Nenhum preço retornado pela API");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "rate_limit") {
        setError("Rate limit — aguarde 1 min");
      } else if (!silent) {
        setError("Falha ao buscar preços");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tokens, updatePrice]);

  // Auto-fetch silently on mount if there are tokens
  useEffect(() => {
    if (tokens.length > 0) fetchPrices(true);
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
        disabled={loading || tokens.length === 0}
        className="h-8 text-xs border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:text-white hover:border-[#3a3a3a] cursor-pointer"
      >
        <RefreshCw size={12} className={`mr-1.5 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Buscando..." : "Atualizar"}
      </Button>
    </div>
  );
}
