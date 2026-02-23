"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { formatBRL } from "@/lib/format";
import { Plus, Trash2, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseISO } from "date-fns";

interface Props {
  tokenId: string;
  symbol: string;
}

export function PriceHistoryPanel({ tokenId, symbol }: Props) {
  const priceHistory = useDefiStore((s) => s.priceHistory);
  const addPriceEntry = useDefiStore((s) => s.addPriceEntry);
  const removePriceEntry = useDefiStore((s) => s.removePriceEntry);

  const entries = priceHistory.filter((e) => e.tokenId === tokenId);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [price, setPrice] = useState("");

  function add() {
    const v = parseFloat(price.replace(",", "."));
    if (!isNaN(v) && v > 0 && date) {
      addPriceEntry(tokenId, date, v);
      setPrice("");
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer"
      >
        <History size={11} />
        {entries.length > 0 ? `${entries.length} registros` : "histórico de preços"}
      </button>

      {open && (
        <div className="mt-2 space-y-2 pl-2 border-l border-[#2a2a2a]">
          {/* Add row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#0f0f0f] border border-[#3a3a3a] rounded px-1.5 py-0.5 text-xs text-white outline-none"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="R$ preço"
              className="w-24 bg-[#0f0f0f] border border-[#3a3a3a] rounded px-1.5 py-0.5 text-xs text-white outline-none"
            />
            <button
              onClick={add}
              className="flex items-center gap-0.5 text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer"
            >
              <Plus size={11} /> Add
            </button>
          </div>

          {/* Entries list */}
          {entries.length === 0 ? (
            <p className="text-xs text-[#3a3a3a]">Nenhum registro ainda</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-xs">
                  <span className="text-[#6b7280]">
                    {format(parseISO(e.date), "d MMM yyyy", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{formatBRL(e.priceBRL)}</span>
                    <button
                      onClick={() => removePriceEntry(e.id)}
                      className="text-[#3a3a3a] hover:text-[#ef4444] cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
