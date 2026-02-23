"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { formatBRL } from "@/lib/format";
import { Pencil, X } from "lucide-react";

interface Props {
  tokenId: string;
  symbol: string;
  currentPrice: number;
  avgCost?: number;
}

export function TokenAvgCost({ tokenId, symbol, currentPrice, avgCost }: Props) {
  const setAvgCost = useDefiStore((s) => s.setAvgCost);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(avgCost ? String(avgCost) : "");

  const pnl = avgCost ? ((currentPrice - avgCost) / avgCost) * 100 : null;
  const positive = pnl !== null && pnl >= 0;

  function save() {
    const v = parseFloat(draft.replace(",", "."));
    if (!isNaN(v) && v > 0) {
      setAvgCost(tokenId, v);
      setEditing(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {editing ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[#6b7280]">PM R$</span>
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            className="w-20 bg-[#0f0f0f] border border-[#3a3a3a] rounded px-1.5 py-0.5 text-white outline-none text-xs"
            placeholder="0.00"
          />
          <button onClick={save} className="text-[#22c55e] cursor-pointer">OK</button>
          <button onClick={() => setEditing(false)} className="text-[#4a4a4a] cursor-pointer"><X size={10} /></button>
        </div>
      ) : avgCost ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[#4a4a4a]">PM {formatBRL(avgCost)}</span>
          <span
            className="font-medium"
            style={{ color: positive ? "#22c55e" : "#ef4444" }}
          >
            {positive ? "+" : ""}{pnl!.toFixed(1)}% P&L
          </span>
          <button onClick={() => { setDraft(String(avgCost)); setEditing(true); }} className="text-[#3a3a3a] hover:text-[#9ca3af] cursor-pointer">
            <Pencil size={9} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(""); setEditing(true); }}
          className="text-[#3a3a3a] hover:text-[#6b7280] transition-colors cursor-pointer"
        >
          + preço médio
        </button>
      )}
    </div>
  );
}
