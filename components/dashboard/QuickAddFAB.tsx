"use client";
import { useState, useRef, useEffect } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { useToast } from "@/hooks/useToast";
import { AnyCategory, ExpenseCategory, IncomeCategory, TransactionType } from "@/types";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "food", label: "Alimentação" },
  { value: "transport", label: "Transporte" },
  { value: "housing", label: "Moradia" },
  { value: "health", label: "Saúde" },
  { value: "entertainment", label: "Lazer" },
  { value: "education", label: "Educação" },
  { value: "shopping", label: "Compras" },
  { value: "investments", label: "Investimentos" },
  { value: "other", label: "Outros" },
];

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "salary", label: "Salário" },
  { value: "freelance", label: "Freelance" },
  { value: "investment_return", label: "Rendimento" },
  { value: "gift", label: "Presente" },
  { value: "other_income", label: "Outros" },
];

export function QuickAddFAB() {
  const addTransaction = useFinancasStore((s) => s.addTransaction);
  const { success } = useToast();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AnyCategory>("food");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const panelRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus amount when opening
  useEffect(() => {
    if (open) setTimeout(() => amountRef.current?.focus(), 80);
  }, [open]);

  // When type changes, reset category to first of that type
  useEffect(() => {
    if (type === "expense") setCategory("food");
    else setCategory("salary");
  }, [type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0 || !description.trim()) return;
    addTransaction({
      type,
      category,
      description: description.trim(),
      amount: parsed,
      date,
    });
    success(
      type === "expense"
        ? `Despesa adicionada: R$ ${parsed.toFixed(2)}`
        : `Receita adicionada: R$ ${parsed.toFixed(2)}`
    );
    // Reset
    setAmount("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setOpen(false);
  }

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Quick add panel */}
      {open && (
        <div className="absolute bottom-14 right-0 w-72 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Lançamento rápido
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  type === "expense"
                    ? "bg-[#ef4444]/20 text-[#ef4444]"
                    : "bg-[#0f0f0f] text-[#6b7280] hover:text-white"
                }`}
              >
                <TrendingDown size={12} />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  type === "income"
                    ? "bg-[#22c55e]/20 text-[#22c55e]"
                    : "bg-[#0f0f0f] text-[#6b7280] hover:text-white"
                }`}
              >
                <TrendingUp size={12} />
                Receita
              </button>
            </div>

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6b7280]">
                R$
              </span>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] transition-colors"
              />
            </div>

            {/* Description */}
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição"
              required
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] transition-colors"
            />

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AnyCategory)}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-[#3a3a3a] transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-[#3a3a3a] transition-colors cursor-pointer"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={!amount || !description}
              className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default ${
                type === "expense"
                  ? "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                  : "bg-[#22c55e] hover:bg-[#16a34a] text-black"
              }`}
            >
              Adicionar
            </button>
          </form>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer ${
          open
            ? "bg-[#2a2a2a] text-[#9ca3af] rotate-45"
            : "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
        }`}
        title="Lançamento rápido"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
