"use client";
import { useDefiStore } from "@/store/defiStore";
import { formatUSD } from "@/lib/format";
import { Droplets, TrendingUp, TrendingDown, Coins } from "lucide-react";

export function PoolSummary() {
  const pools = useDefiStore((s) => s.pools);

  if (pools.length === 0) return null;

  const activePools = pools.filter((p) => p.status === "active");

  const totalLiquidity = activePools.reduce((sum, p) => sum + p.currentValueUSD, 0);
  const totalPnl = pools.reduce((sum, p) => sum + (p.currentValueUSD - p.depositedUSD), 0);
  const totalFees = pools.reduce(
    (sum, p) => sum + (p.feesEarnedUSD ?? 0),
    0
  );

  const pnlPositive = totalPnl >= 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Liquidez ativa */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#06b6d4]/10 flex items-center justify-center">
            <Droplets size={12} className="text-[#06b6d4]" />
          </div>
          <span className="text-[11px] text-[#4a4a4a]">Liquidez ativa</span>
        </div>
        <p className="text-base font-bold text-white truncate">
          {formatUSD(totalLiquidity)}
        </p>
        <p className="text-[10px] text-[#4a4a4a] mt-0.5">
          {activePools.length} {activePools.length === 1 ? "pool" : "pools"}
        </p>
      </div>

      {/* P&L total */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: pnlPositive ? "#22c55e18" : "#ef444418",
            }}
          >
            {pnlPositive ? (
              <TrendingUp size={12} className="text-[#22c55e]" />
            ) : (
              <TrendingDown size={12} className="text-[#ef4444]" />
            )}
          </div>
          <span className="text-[11px] text-[#4a4a4a]">P&L total</span>
        </div>
        <p
          className="text-base font-bold truncate"
          style={{ color: pnlPositive ? "#22c55e" : "#ef4444" }}
        >
          {pnlPositive ? "+" : ""}
          {formatUSD(totalPnl)}
        </p>
        <p className="text-[10px] text-[#4a4a4a] mt-0.5">todas as pools</p>
      </div>

      {/* Fees totais */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#f59e0b]/10 flex items-center justify-center">
            <Coins size={12} className="text-[#f59e0b]" />
          </div>
          <span className="text-[11px] text-[#4a4a4a]">Fees ganhas</span>
        </div>
        <p className="text-base font-bold text-[#f59e0b] truncate">
          {totalFees > 0 ? formatUSD(totalFees) : "—"}
        </p>
        <p className="text-[10px] text-[#4a4a4a] mt-0.5">acumulado</p>
      </div>
    </div>
  );
}
