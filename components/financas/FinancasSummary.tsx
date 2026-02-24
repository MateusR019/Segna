"use client";
import {
  useFinancasStore,
  calcBalance,
  calcTotalIncome,
  calcTotalExpenses,
} from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FinancasSummary() {
  const transactions = useFinancasStore((s) => s.transactions);
  const thisMonth = format(new Date(), "yyyy-MM");
  const monthTx = transactions.filter((t) => t.date.startsWith(thisMonth));

  const income = calcTotalIncome(monthTx);
  const expenses = calcTotalExpenses(monthTx);
  const balance = calcBalance(monthTx);

  const monthLabel = format(new Date(), "MMMM", { locale: ptBR });

  const cards = [
    { label: "Receitas", sublabel: monthLabel, value: income, color: "#22c55e", icon: ArrowDownLeft },
    { label: "Despesas", sublabel: monthLabel, value: expenses, color: "#ef4444", icon: ArrowUpRight },
    { label: "Saldo", sublabel: monthLabel, value: balance, color: balance >= 0 ? "#22c55e" : "#ef4444", icon: Scale },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(({ label, sublabel, value, color, icon: Icon }) => (
        <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#6b7280] font-medium capitalize">{sublabel}</p>
              <p className="text-[11px] text-[#4a4a4a]">{label}</p>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: color + "18" }}
            >
              <Icon size={14} style={{ color }} />
            </div>
          </div>
          <p className="text-xl font-semibold" style={{ color }}>
            {formatBRL(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
