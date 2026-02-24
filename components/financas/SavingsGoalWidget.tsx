"use client";
import { useState } from "react";
import { useFinancasStore, calcTotalExpenses } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { Pencil, X, PiggyBank, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { IncomeCategory } from "@/types";

// Which income categories count as "savings-worthy"
const SAVINGS_INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "salary", label: "Salário" },
  { value: "freelance", label: "Bico / Freelance" },
  { value: "investment_return", label: "Rendimento" },
  { value: "gift", label: "Presente / Doação" },
  { value: "other_income", label: "Outra receita" },
];

export function SavingsGoalWidget() {
  const transactions = useFinancasStore((s) => s.transactions);
  const savingsGoal = useFinancasStore((s) => s.savingsGoal);
  const setSavingsGoal = useFinancasStore((s) => s.setSavingsGoal);
  const clearSavingsGoal = useFinancasStore((s) => s.clearSavingsGoal);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // By default, count ALL income categories
  const [selectedCategories, setSelectedCategories] = useState<IncomeCategory[]>(
    SAVINGS_INCOME_CATEGORIES.map((c) => c.value)
  );
  const [showCatPicker, setShowCatPicker] = useState(false);

  const thisMonth = format(new Date(), "yyyy-MM");
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth));

  // Income = only transactions of type "income" in selected categories
  const income = monthTx
    .filter((t) => t.type === "income" && selectedCategories.includes(t.category as IncomeCategory))
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = calcTotalExpenses(monthTx);
  const saved = Math.max(0, income - expenses);

  function toggleCategory(cat: IncomeCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  }

  function save() {
    const v = parseFloat(draft.replace(",", "."));
    if (!isNaN(v) && v > 0) {
      setSavingsGoal(v);
      setEditing(false);
    }
  }

  const target = savingsGoal?.targetAmount ?? 0;
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  const reached = saved >= target && target > 0;

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PiggyBank size={14} className="text-[#9ca3af]" />
          <span className="text-sm font-medium text-[#9ca3af]">Meta de economia</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Category picker toggle */}
          <button
            onClick={() => setShowCatPicker(!showCatPicker)}
            title="Filtrar categorias de receita"
            className="p-1 text-[#3a3a3a] hover:text-[#9ca3af] transition-colors cursor-pointer"
          >
            <ChevronDown size={12} className={`transition-transform ${showCatPicker ? "rotate-180" : ""}`} />
          </button>
          {savingsGoal && (
            <button
              onClick={() => { clearSavingsGoal(); setEditing(false); }}
              className="p-1 text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => { setDraft(savingsGoal ? String(savingsGoal.targetAmount) : ""); setEditing(true); }}
            className="p-1 text-[#3a3a3a] hover:text-[#9ca3af] transition-colors cursor-pointer"
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* Category filter */}
      {showCatPicker && (
        <div className="mb-3 p-2 bg-[#141414] rounded-lg border border-[#2a2a2a] space-y-1">
          <p className="text-[10px] text-[#4a4a4a] mb-1.5">Contar como economia:</p>
          {SAVINGS_INCOME_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className="flex items-center gap-2 w-full text-left cursor-pointer group"
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedCategories.includes(cat.value)
                  ? "bg-[#6366f1] border-[#6366f1]"
                  : "border-[#3a3a3a]"
              }`}>
                {selectedCategories.includes(cat.value) && (
                  <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-xs ${selectedCategories.includes(cat.value) ? "text-white" : "text-[#6b7280]"}`}>
                {cat.label}
              </span>
            </button>
          ))}
          <p className="text-[10px] text-[#3a3a3a] pt-1 border-t border-[#2a2a2a] mt-1">
            Receitas selecionadas − despesas = economia
          </p>
        </div>
      )}

      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b7280]">R$</span>
          <input
            autoFocus
            type="number"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            placeholder="Ex: 500"
            className="flex-1 bg-[#0f0f0f] border border-[#3a3a3a] rounded px-2 py-1 text-sm text-white outline-none"
          />
          <button onClick={save} className="text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer font-medium">OK</button>
          <button onClick={() => setEditing(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">×</button>
        </div>
      ) : !savingsGoal ? (
        <button
          onClick={() => { setDraft(""); setEditing(true); }}
          className="text-xs text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
        >
          + Definir meta de economia mensal
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold" style={{ color: reached ? "#22c55e" : "white" }}>
                {formatBRL(saved)}
              </p>
              <p className="text-xs text-[#4a4a4a]">de {formatBRL(target)} por mês</p>
            </div>
            {reached && <span className="text-xs text-[#22c55e] font-medium">✓ Meta atingida!</span>}
          </div>
          <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: reached ? "#22c55e" : pct > 70 ? "#22c55e" : pct > 40 ? "#f59e0b" : "#6366f1" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#4a4a4a]">{pct.toFixed(0)}% da meta</p>
            {selectedCategories.length < SAVINGS_INCOME_CATEGORIES.length && (
              <p className="text-[10px] text-[#4a4a4a]">
                {selectedCategories.length} categoria{selectedCategories.length !== 1 ? "s" : ""} ativas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
