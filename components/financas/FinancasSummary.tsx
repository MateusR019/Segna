"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  useFinancasStore,
  calcBalance,
  calcTotalIncome,
  calcTotalExpenses,
} from "@/store/financasStore";
import { formatBRL } from "@/lib/format";

export function FinancasSummary() {
  const transactions = useFinancasStore((s) => s.transactions);
  const balance = calcBalance(transactions);
  const income = calcTotalIncome(transactions);
  const expenses = calcTotalExpenses(transactions);

  const cards = [
    { label: "Receitas", value: income, color: "#22c55e" },
    { label: "Despesas", value: expenses, color: "#ef4444" },
    {
      label: "Saldo Atual",
      value: balance,
      color: balance >= 0 ? "#22c55e" : "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, value, color }) => (
        <Card key={label} className="bg-[#1a1a1a] border-[#2a2a2a] rounded-lg">
          <CardContent className="p-5">
            <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-2xl font-semibold" style={{ color }}>
              {formatBRL(value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
