"use client";
import { useFinancasStore, calcTotalExpenses } from "@/store/financasStore";
import { format } from "date-fns";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { formatBRL } from "@/lib/format";

export function BudgetAlertBanner() {
  const { transactions, budget } = useFinancasStore();
  const [dismissed, setDismissed] = useState(false);

  const thisMonth = format(new Date(), "yyyy-MM");
  const monthExpenses = calcTotalExpenses(
    transactions.filter((t) => t.date.startsWith(thisMonth))
  );

  if (!budget || dismissed) return null;

  const pct = (monthExpenses / budget.limitAmount) * 100;
  const over = monthExpenses > budget.limitAmount;
  const warn = pct >= 80 && !over;

  if (!warn && !over) return null;

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm ${
      over
        ? "bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]"
        : "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
    }`}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="flex-shrink-0" />
        <span>
          {over
            ? `Orçamento estourado em ${formatBRL(monthExpenses - budget.limitAmount)} este mês`
            : `Você usou ${pct.toFixed(0)}% do orçamento mensal (${formatBRL(monthExpenses)} de ${formatBRL(budget.limitAmount)})`
          }
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  );
}
