"use client";
import { useState } from "react";
import { useFinancasStore, calcTotalExpenses } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check, Pencil } from "lucide-react";

export function MonthlyBudget() {
  const { transactions, budget, setBudget, clearBudget } = useFinancasStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const thisMonth = format(new Date(), "yyyy-MM");
  const monthExpenses = calcTotalExpenses(
    transactions.filter((t) => t.date.startsWith(thisMonth))
  );

  function save() {
    const val = parseFloat(draft.replace(",", ".").replace(".", "").replace(",", "."));
    const num = parseFloat(draft.replace(/\./g, "").replace(",", "."));
    if (!isNaN(num) && num > 0) setBudget(num);
    setEditing(false);
    setDraft("");
  }

  if (!budget && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
      >
        + Definir orçamento mensal
      </button>
    );
  }

  if (editing) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); save(); }}
        className="flex items-center gap-2"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ex: 3000"
          autoFocus
          className="h-7 w-32 text-xs bg-[#0f0f0f] border-[#2a2a2a] px-2"
        />
        <button type="submit" className="text-[#22c55e] hover:text-[#16a34a] cursor-pointer">
          <Check size={13} />
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">
          <X size={13} />
        </button>
      </form>
    );
  }

  const limit = budget!.limitAmount;
  const pct = Math.min((monthExpenses / limit) * 100, 100);
  const over = monthExpenses > limit;
  const barColor = over ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e";

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6b7280] uppercase tracking-wider">Orçamento mensal</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDraft(String(limit)); setEditing(true); }}
            className="text-[#3a3a3a] hover:text-[#6b7280] cursor-pointer"
          >
            <Pencil size={11} />
          </button>
          <button onClick={clearBudget} className="text-[#3a3a3a] hover:text-[#ef4444] cursor-pointer">
            <X size={11} />
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-sm font-medium" style={{ color: barColor }}>
          {formatBRL(monthExpenses)}
        </span>
        <span className="text-xs text-[#4a4a4a]">de {formatBRL(limit)}</span>
      </div>
      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {over && (
        <p className="text-xs text-[#ef4444]">
          Orçamento estourado em {formatBRL(monthExpenses - limit)}
        </p>
      )}
    </div>
  );
}
