"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { formatUSD } from "@/lib/format";
import { Pencil, X } from "lucide-react";

interface Props {
  tokenId: string;
  symbol: string;
  currentPriceUSD: number | null;   // preço atual em USD
  avgCostUSD?: number;              // PM em USD
  avgCostBRL?: number;              // PM em BRL (legado, fallback)
}

export function TokenAvgCost({
  tokenId,
  symbol,
  currentPriceUSD,
  avgCostUSD,
  avgCostBRL,
}: Props) {
  const { setAvgCostUSD, exchangeRate } = useDefiStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // Deriva custo médio em USD: usa avgCostUSD direto, ou converte avgCostBRL
  const effectiveAvgUSD =
    avgCostUSD ??
    (avgCostBRL && exchangeRate?.usdToBRL
      ? avgCostBRL / exchangeRate.usdToBRL
      : undefined);

  const pnl =
    effectiveAvgUSD && currentPriceUSD
      ? ((currentPriceUSD - effectiveAvgUSD) / effectiveAvgUSD) * 100
      : null;
  const positive = pnl !== null && pnl >= 0;

  function save() {
    const v = parseFloat(draft.replace(",", "."));
    if (!isNaN(v) && v > 0) {
      setAvgCostUSD(tokenId, v);
      setEditing(false);
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {editing ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[#6b7280]">PM $</span>
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-20 bg-[#0f0f0f] border border-[#3a3a3a] rounded px-1.5 py-0.5 text-white outline-none text-xs"
            placeholder="0.00"
          />
          <button onClick={save} className="text-[#22c55e] cursor-pointer">
            OK
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[#4a4a4a] cursor-pointer"
          >
            <X size={10} />
          </button>
        </div>
      ) : effectiveAvgUSD ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[#4a4a4a]">PM {formatUSD(effectiveAvgUSD)}</span>
          {pnl !== null && (
            <span
              className="font-medium"
              style={{ color: positive ? "#22c55e" : "#ef4444" }}
            >
              {positive ? "+" : ""}
              {pnl.toFixed(1)}% P&L
            </span>
          )}
          <button
            onClick={() => {
              setDraft(String(effectiveAvgUSD.toFixed(4)));
              setEditing(true);
            }}
            className="text-[#3a3a3a] hover:text-[#9ca3af] cursor-pointer"
          >
            <Pencil size={9} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          className="text-[#3a3a3a] hover:text-[#6b7280] transition-colors cursor-pointer"
        >
          + preço médio
        </button>
      )}
    </div>
  );
}
