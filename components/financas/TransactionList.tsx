"use client";
import { useState } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowDownLeft, ArrowUpRight, Pencil, Check, X, AlertTriangle } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/useToast";

const EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "housing", label: "Moradia" },
  { value: "food", label: "Alimentação" },
  { value: "transport", label: "Transporte" },
  { value: "health", label: "Saúde" },
  { value: "entertainment", label: "Entretenimento" },
  { value: "education", label: "Educação" },
  { value: "shopping", label: "Compras" },
  { value: "investments", label: "Investimentos" },
  { value: "other", label: "Outros" },
];

const INCOME_CATEGORIES: { value: string; label: string }[] = [
  { value: "salary", label: "Salário" },
  { value: "freelance", label: "Bico / Freelance" },
  { value: "investment_return", label: "Rendimento" },
  { value: "gift", label: "Presente / Doação" },
  { value: "other_income", label: "Outra receita" },
];

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Moradia",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  entertainment: "Entretenimento",
  education: "Educação",
  shopping: "Compras",
  investments: "Investimentos",
  other: "Outros",
  salary: "Salário",
  freelance: "Bico / Freelance",
  investment_return: "Rendimento",
  gift: "Presente / Doação",
  other_income: "Outra receita",
};

interface EditDraft {
  description: string;
  amount: string;
  date: string;
  category: string;
}

export function TransactionList() {
  const { transactions, removeTransaction, editTransaction,
          customExpenseCategories, customIncomeCategories } = useFinancasStore();
  const { success } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({ description: "", amount: "", date: "", category: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  function startEdit(t: typeof sorted[0]) {
    setEditingId(t.id);
    setDraft({
      description: t.description,
      amount: String(t.amount),
      date: t.date,
      category: t.category,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function confirmEdit(id: string) {
    const amount = parseFloat(draft.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;
    editTransaction(id, {
      description: draft.description.trim(),
      amount,
      date: draft.date,
      category: draft.category,
    });
    setEditingId(null);
    success("Transação atualizada!");
  }

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <p className="text-sm text-[#4a4a4a]">Nenhuma transação ainda</p>
        <p className="text-xs text-[#3a3a3a]">Clique em "Adicionar" para registrar sua primeira receita ou despesa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((t, idx) => {
        const isIncome = t.type === "income";
        const isEditing = editingId === t.id;
        const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        const customCats = isIncome ? customIncomeCategories : customExpenseCategories;
        const delay = `${Math.min(idx * 30, 300)}ms`;

        if (isEditing) {
          return (
            <div
              key={t.id}
              className="list-item bg-[#1a1a1a] border border-[#6366f1]/40 rounded-xl px-4 py-3 space-y-3"
              style={{ animationDelay: delay }}
            >
              {/* Row 1: description + amount */}
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isIncome ? "#22c55e18" : "#ef444418" }}
                >
                  {isIncome
                    ? <ArrowDownLeft size={16} className="text-[#22c55e]" />
                    : <ArrowUpRight size={16} className="text-[#ef4444]" />
                  }
                </div>
                <input
                  autoFocus
                  type="text"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Descrição"
                  className="flex-1 min-w-0 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#6366f1]/60"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-[#6b7280]">R$</span>
                  <input
                    type="number"
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                    placeholder="0,00"
                    className="w-24 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#6366f1]/60"
                  />
                </div>
              </div>

              {/* Row 2: date + category + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]/60 cursor-pointer"
                />
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="flex-1 min-w-0 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]/60 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                  {customCats.length > 0 && (
                    <optgroup label="── Personalizadas ──" style={{ color: "#a78bfa" }}>
                      {customCats.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => confirmEdit(t.id)}
                    className="h-8 w-8 text-[#22c55e] hover:text-[#16a34a] hover:bg-transparent cursor-pointer"
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={cancelEdit}
                    className="h-8 w-8 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div key={t.id} className="list-item bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center gap-3 px-4 py-3 hover:border-[#3a3a3a] transition-colors group" style={{ animationDelay: delay }}>
            {/* Type icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: isIncome ? "#22c55e18" : "#ef444418" }}
            >
              {isIncome
                ? <ArrowDownLeft size={16} className="text-[#22c55e]" />
                : <ArrowUpRight size={16} className="text-[#ef4444]" />
              }
            </div>

            {/* Description + date */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-none truncate">
                {t.description || "Sem descrição"}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-xs text-[#4a4a4a]">
                  {format(parseISO(t.date), "d MMM yyyy", { locale: ptBR })}
                </p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2a2a2a] text-[#6b7280]">
                  {CATEGORY_LABELS[t.category] ?? t.category}
                </span>
                {t.recurring && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#6366f1]/15 text-[#a78bfa]">
                    recorrente
                  </span>
                )}
              </div>
            </div>

            {/* Amount + edit + delete */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span
                className="text-base font-semibold mr-1"
                style={{ color: isIncome ? "#22c55e" : "#ef4444" }}
              >
                {isIncome ? "+" : "−"}{formatBRL(t.amount)}
              </span>
              {confirmDeleteId === t.id ? (
                <>
                  <span className="text-xs text-[#ef4444] mr-0.5">Excluir?</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { removeTransaction(t.id); setConfirmDeleteId(null); success("Transação excluída"); }}
                    className="h-8 w-8 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer"
                  >
                    <Check size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDeleteId(null)}
                    className="h-8 w-8 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
                  >
                    <X size={13} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(t)}
                    className="h-8 w-8 text-[#3a3a3a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer transition-colors"
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDeleteId(t.id)}
                    className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer transition-colors"
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
