"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancasStore } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { Transaction } from "@/types";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function getMonthData(transactions: Transaction[], monthKey: string) {
  const filtered = transactions.filter((t) => t.date.startsWith(monthKey));
  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const expenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export function MonthlyReport() {
  const { transactions } = useFinancasStore();
  const thisMonth = format(new Date(), "yyyy-MM");
  const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM");

  const current = getMonthData(transactions, thisMonth);
  const previous = getMonthData(transactions, lastMonth);

  const thisMonthLabel = format(new Date(), "MMMM yyyy", { locale: ptBR });
  const lastMonthLabel = format(subMonths(new Date(), 1), "MMM", { locale: ptBR });

  function diff(curr: number, prev: number) {
    if (prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  }

  function DiffBadge({ value }: { value: number | null }) {
    if (value === null) return null;
    const positive = value >= 0;
    const Icon = value === 0 ? Minus : positive ? TrendingUp : TrendingDown;
    return (
      <span
        className={`flex items-center gap-0.5 text-xs ${positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}
      >
        <Icon size={10} />
        {Math.abs(value).toFixed(0)}% vs {lastMonthLabel}
      </span>
    );
  }

  const rows = [
    {
      label: "Receitas",
      current: current.income,
      delta: diff(current.income, previous.income),
      color: "#22c55e",
    },
    {
      label: "Despesas",
      current: current.expenses,
      delta: diff(current.expenses, previous.expenses),
      // for expenses, going up is bad
      color: "#ef4444",
    },
    {
      label: "Saldo",
      current: current.balance,
      delta: diff(current.balance, previous.balance),
      color: current.balance >= 0 ? "#22c55e" : "#ef4444",
    },
  ];

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#9ca3af] capitalize">
          Relatório — {thisMonthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0"
          >
            <span className="text-xs text-[#9ca3af]">{row.label}</span>
            <div className="flex items-center gap-3">
              <DiffBadge value={row.delta} />
              <span className="text-sm font-medium" style={{ color: row.color }}>
                {formatBRL(row.current)}
              </span>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-xs text-[#6b7280] text-center py-2">
            Sem dados para este mês
          </p>
        )}
      </CardContent>
    </Card>
  );
}
