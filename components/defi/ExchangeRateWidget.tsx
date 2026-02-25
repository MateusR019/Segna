"use client";
import { useDefiStore } from "@/store/defiStore";
import { DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Exibe a cotação USD/BRL buscada automaticamente. Sem edição manual. */
export function ExchangeRateWidget() {
  const exchangeRate = useDefiStore((s) => s.exchangeRate);

  const rate = exchangeRate?.usdToBRL;
  const updatedAgo = exchangeRate?.updatedAt
    ? formatDistanceToNow(new Date(exchangeRate.updatedAt), {
        locale: ptBR,
        addSuffix: true,
      })
    : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1 text-[#f59e0b]">
        <DollarSign size={11} />
        <span className="font-medium">USD/BRL</span>
      </div>
      {rate ? (
        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium">R$ {rate.toFixed(2)}</span>
          {updatedAgo && <span className="text-[#4a4a4a]">· {updatedAgo}</span>}
          <span className="text-[10px] text-[#3a3a3a] bg-[#1f1f1f] border border-[#2a2a2a] px-1 py-0.5 rounded">
            auto
          </span>
        </div>
      ) : (
        <span className="text-[#4a4a4a] animate-pulse">buscando cotação...</span>
      )}
    </div>
  );
}
