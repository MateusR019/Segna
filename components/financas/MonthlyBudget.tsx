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
    const num = parseFloat(draft.replace(/\./g, "").replace(",", "."));
    if (!isNaN(num) && num > 0) setBudget(num);
    setEditing(false);
    setDraft("");
  }

  const limit = budget?.limitAmount ?? 0;
  const pct = limit > 0 ? Math.min((monthExpenses / limit) * 100, 100) : 0;
  const over = limit > 0 && monthExpenses > limit;
  const barColor = over ? "#ef4444" : pct > 80 ? "#f59e0b" : "#22c55e";

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#9ca3af]">Orçamento mensal</span>
        </div>
        <div className="flex items-center gap-1">
          {budget && (
            <>
              <button
                onClick={() => { setDraft(String(limit)); setEditing(true); }}
                className="p-1 text-[#3a3a3a] hover:text-[#9ca3af] transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button onClick={clearBudget} className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer">
                <X size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="flex items-center gap-2">
          <span className="text-xs text-[#6b7280]">R$</span>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex: 3000"
            autoFocus
            className="flex-1 h-8 text-sm bg-[#0f0f0f] border-[#3a3a3a] px-2"
          />
          <button type="submit" className="text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer font-medium">OK</button>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">×</button>
        </form>
      ) : !budget ? (
        <button
          onClick={() => { setDraft(""); setEditing(true); }}
          className="text-xs text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
        >
          + Definir orçamento mensal
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-lg font-semibold" style={{ color: over ? "#ef4444" : "white" }}>
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
          <p className="text-xs" style={{ color: over ? "#ef4444" : "#4a4a4a" }}>
            {over
              ? `Estourado em ${formatBRL(monthExpenses - limit)}`
              : `${(100 - pct).toFixed(0)}% restante do orçamento`}
          </p>
        </div>
      )}
    </div>
  );
}
