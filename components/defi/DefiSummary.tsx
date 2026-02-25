"use client";
import { useDefiStore } from "@/store/defiStore";
import { formatUSD } from "@/lib/format";
import { Coins, BarChart2 } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

export function DefiSummary() {
  const tokens = useDefiStore((s) => s.tokens);
  const exchangeRate = useDefiStore((s) => s.exchangeRate);
  const count = tokens.length;

  // Total em USD (usa priceInUSD se disponível, senão converte BRL)
  const total = tokens.reduce((acc, t) => {
    if (t.priceInUSD) return acc + t.quantity * t.priceInUSD;
    if (exchangeRate?.usdToBRL)
      return acc + (t.quantity * t.priceInBRL) / exchangeRate.usdToBRL;
    return acc;
  }, 0);

  // P&L em USD (avgCostUSD preferencial; fallback: avgCostBRL / taxa)
  const invested = tokens.reduce((acc, t) => {
    if (t.avgCostUSD) return acc + t.avgCostUSD * t.quantity;
    if (t.avgCostBRL && exchangeRate?.usdToBRL)
      return acc + (t.avgCostBRL / exchangeRate.usdToBRL) * t.quantity;
    return acc;
  }, 0);

  const pnl = invested > 0 ? total - invested : null;
  const pnlPct = invested > 0 ? ((total - invested) / invested) * 100 : null;

  const animatedTotal = useAnimatedNumber(total);
  const animatedCount = useAnimatedNumber(count);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 card-hover">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#6b7280] font-medium">Portfólio</p>
            <p className="text-[11px] text-[#4a4a4a]">Total em USD</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center">
            <Coins size={14} className="text-[#f59e0b]" />
          </div>
        </div>
        <p className="text-xl font-semibold text-white">
          {formatUSD(animatedTotal)}
        </p>
        {pnl !== null && (
          <p
            className="text-xs mt-1"
            style={{ color: pnl >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {pnl >= 0 ? "+" : ""}
            {formatUSD(pnl)} (
            {pnlPct !== null
              ? (pnlPct >= 0 ? "+" : "") + pnlPct.toFixed(1) + "%"
              : ""}
            )
          </p>
        )}
      </div>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 card-hover">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#6b7280] font-medium">Ativos</p>
            <p className="text-[11px] text-[#4a4a4a]">Tokens rastreados</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#6366f1]/15 flex items-center justify-center">
            <BarChart2 size={14} className="text-[#a78bfa]" />
          </div>
        </div>
        <p className="text-xl font-semibold text-white">
          {Math.round(animatedCount)}
        </p>
        <p className="text-xs text-[#4a4a4a] mt-1">
          {count === 0
            ? "Adicione seu primeiro token"
            : count === 1
            ? "token no portfolio"
            : "tokens no portfolio"}
        </p>
      </div>
    </div>
  );
}
