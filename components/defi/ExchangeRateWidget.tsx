"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { useToast } from "@/hooks/useToast";
import { DollarSign, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ExchangeRateWidget() {
  const { exchangeRate, setExchangeRate } = useDefiStore();
  const { success } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function save() {
    const val = parseFloat(draft.replace(",", "."));
    if (!isNaN(val) && val > 0) {
      setExchangeRate(val);
      success("Taxa de câmbio atualizada!");
    }
    setEditing(false);
  }

  const rate = exchangeRate?.usdToBRL;
  const updatedAgo = exchangeRate?.updatedAt
    ? formatDistanceToNow(new Date(exchangeRate.updatedAt), { locale: ptBR, addSuffix: true })
    : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1 text-[#f59e0b]">
        <DollarSign size={11} />
        <span className="font-medium">USD/BRL</span>
      </div>

      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex items-center gap-1">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex: 5.85"
            className="h-6 w-20 text-xs bg-[#0f0f0f] border-[#2a2a2a] px-2"
          />
          <button type="submit" className="text-[#22c55e] hover:text-[#16a34a] cursor-pointer">
            <Check size={12} />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer">
            <X size={12} />
          </button>
        </form>
      ) : rate ? (
        <div className="flex items-center gap-1.5">
          <span className="text-white font-medium">R$ {rate.toFixed(2)}</span>
          {updatedAgo && <span className="text-[#4a4a4a]">· {updatedAgo}</span>}
          <button
            onClick={() => { setDraft(rate.toFixed(2)); setEditing(true); }}
            className="text-[#3a3a3a] hover:text-[#9ca3af] transition-colors cursor-pointer"
          >
            <Pencil size={10} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => { setDraft(""); setEditing(true); }}
          className="text-[#4a4a4a] hover:text-[#f59e0b] transition-colors cursor-pointer"
        >
          + Definir cotação
        </button>
      )}
    </div>
  );
}
