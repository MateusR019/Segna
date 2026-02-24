"use client";
import { useFinancasStore } from "@/store/financasStore";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_LABELS: Record<string, string> = {
  // Despesas
  housing: "Moradia",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  entertainment: "Entretenimento",
  education: "Educação",
  shopping: "Compras",
  investments: "Investimentos",
  other: "Outros",
  // Receitas
  salary: "Salário",
  freelance: "Bico / Freelance",
  investment_return: "Rendimento",
  gift: "Presente / Doação",
  other_income: "Outra receita",
};

export function TransactionList() {
  const { transactions, removeTransaction } = useFinancasStore();
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

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
      {sorted.map((t) => {
        const isIncome = t.type === "income";
        return (
          <div key={t.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center gap-3 px-4 py-3 hover:border-[#3a3a3a] transition-colors">
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

            {/* Amount + delete */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-base font-semibold"
                style={{ color: isIncome ? "#22c55e" : "#ef4444" }}
              >
                {isIncome ? "+" : "−"}{formatBRL(t.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTransaction(t.id)}
                className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
