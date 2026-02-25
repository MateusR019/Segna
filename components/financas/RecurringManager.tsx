"use client";
import { useState } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { Transaction } from "@/types";
import { RefreshCw, Trash2, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";

const CATEGORY_LABEL: Record<string, string> = {
  housing: "Moradia", food: "Alimentação", transport: "Transporte",
  health: "Saúde", entertainment: "Lazer", education: "Educação",
  shopping: "Compras", investments: "Investimentos", other: "Outro",
  salary: "Salário", freelance: "Freelance", investment_return: "Retorno",
  gift: "Presente", other_income: "Outra receita",
};

export function RecurringManager() {
  const { transactions, removeTransaction, editTransaction, generateRecurring } = useFinancasStore();
  const { success } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const recurring = transactions
    .filter((t) => t.recurring)
    // Deduplicate by description+amount+category - keep most recent
    .reduce<Transaction[]>((acc, t) => {
      const key = `${t.description}|${t.amount}|${t.category}|${t.type}`;
      const existing = acc.findIndex(
        (x) => `${x.description}|${x.amount}|${x.category}|${x.type}` === key
      );
      if (existing === -1) return [...acc, t];
      // Keep the more recent one
      if (t.date > acc[existing].date) {
        const next = [...acc];
        next[existing] = t;
        return next;
      }
      return acc;
    }, [])
    .sort((a, b) => {
      // expenses first, then income; then alphabetical
      if (a.type !== b.type) return a.type === "expense" ? -1 : 1;
      return a.description.localeCompare(b.description);
    });

  function handleGenerate() {
    generateRecurring();
    success("Lançamentos recorrentes gerados para este mês!");
  }

  function removeAllOccurrences(t: Transaction) {
    const toRemove = transactions.filter(
      (x) =>
        x.recurring &&
        x.description === t.description &&
        x.amount === t.amount &&
        x.category === t.category &&
        x.type === t.type
    );
    toRemove.forEach((x) => removeTransaction(x.id));
    success(`"${t.description}" removido de recorrentes`);
    setConfirmId(null);
  }

  function toggleRecurring(t: Transaction) {
    editTransaction(t.id, { recurring: false });
    success(`"${t.description}" não é mais recorrente`);
  }

  if (recurring.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 flex items-center justify-center mx-auto">
          <RefreshCw size={18} className="text-[#a78bfa]" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-[#6b7280]">Nenhum lançamento recorrente</p>
          <p className="text-xs text-[#3a3a3a]">
            Marque &quot;Recorrente&quot; ao adicionar um lançamento para que ele apareça aqui
          </p>
        </div>
        <p className="text-[10px] text-[#2a2a2a] bg-[#141414] border border-[#1f1f1f] rounded-lg px-3 py-2">
          Dica: lançamentos recorrentes são copiados automaticamente todo mês
        </p>
      </div>
    );
  }

  const monthExpenses = recurring
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const monthIncome = recurring
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-3">
      {/* Summary + Generate button */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <p className="text-[10px] text-[#4a4a4a]">Fixas/mês</p>
            <p className="text-[#ef4444] font-medium">{formatBRL(monthExpenses)}</p>
          </div>
          {monthIncome > 0 && (
            <div>
              <p className="text-[10px] text-[#4a4a4a]">Entradas fixas</p>
              <p className="text-[#22c55e] font-medium">{formatBRL(monthIncome)}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-[#4a4a4a]">Líquido fixo</p>
            <p
              className="font-medium"
              style={{ color: monthIncome - monthExpenses >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {formatBRL(monthIncome - monthExpenses)}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleGenerate}
          className="h-7 px-2.5 text-[10px] bg-[#6366f1]/10 hover:bg-[#6366f1]/20 text-[#a78bfa] border border-[#6366f1]/20 cursor-pointer gap-1"
        >
          <Plus size={10} />
          Gerar este mês
        </Button>
      </div>

      {/* Recurring list */}
      <div className="space-y-1.5">
        {recurring.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 hover:border-[#3a3a3a] transition-colors"
          >
            {/* Type indicator */}
            <div
              className="w-1.5 h-8 rounded-full flex-shrink-0"
              style={{ background: t.type === "income" ? "#22c55e" : "#ef4444" }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{t.description}</p>
              <p className="text-[10px] text-[#4a4a4a]">
                {CATEGORY_LABEL[t.category] ?? t.category} · todo mês
              </p>
            </div>

            {/* Amount */}
            <span
              className="text-sm font-medium flex-shrink-0"
              style={{ color: t.type === "income" ? "#22c55e" : "white" }}
            >
              {t.type === "income" ? "+" : "-"}{formatBRL(t.amount)}
            </span>

            {/* Actions */}
            {confirmId === t.id ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-[10px] text-[#ef4444]">Remover todas?</span>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 text-[#ef4444] hover:bg-transparent cursor-pointer"
                  onClick={() => removeAllOccurrences(t)}
                >
                  <Check size={11} />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 text-[#4a4a4a] hover:bg-transparent cursor-pointer"
                  onClick={() => setConfirmId(null)}
                >
                  <X size={11} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost" size="icon"
                  title="Desmarcar como recorrente"
                  className="h-7 w-7 text-[#3a3a3a] hover:text-[#f59e0b] hover:bg-transparent cursor-pointer"
                  onClick={() => toggleRecurring(t)}
                >
                  <RefreshCw size={12} />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  title="Remover todas as ocorrências"
                  className="h-7 w-7 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                  onClick={() => setConfirmId(t.id)}
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#3a3a3a] text-center">
        Lançamentos recorrentes são copiados automaticamente quando você abre Finanças no início de cada mês
      </p>
    </div>
  );
}
