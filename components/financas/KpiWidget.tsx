"use client";

import { endOfMonth, differenceInCalendarDays, subMonths, parseISO } from "date-fns";
import type { Transaction } from "@/types";
import { calcTotalIncome, calcTotalExpenses } from "@/store/financasStore";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  transactions: Transaction[];
  selectedMonth: string; // "yyyy-MM"
}

// ─── Labels amigáveis para categorias ────────────────────────────────────────

const CAT_LABEL: Record<string, string> = {
  housing:          "Moradia",
  food:             "Alimentação",
  transport:        "Transporte",
  fuel:             "Combustível",
  health:           "Saúde",
  gym:              "Academia",
  supplements:      "Suplementos",
  entertainment:    "Entretenimento",
  education:        "Educação",
  shopping:         "Compras",
  investments:      "Investimentos",
  other:            "Outros",
  salary:           "Salário",
  freelance:        "Freelance",
  gig:              "Gig",
  investment_return:"Rendimento",
  gift:             "Presente",
  other_income:     "Outra receita",
};

function catLabel(cat: string): string {
  return CAT_LABEL[cat] ?? cat;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KpiWidget({ transactions, selectedMonth }: Props) {
  const monthTx = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Mês anterior
  const prevMonthStr = (() => {
    const prev = subMonths(parseISO(selectedMonth + "-01"), 1);
    return prev.toISOString().slice(0, 7);
  })();
  const prevMonthTx = transactions.filter((t) => t.date.startsWith(prevMonthStr));

  // KPIs
  const income      = calcTotalIncome(monthTx);
  const expenses    = calcTotalExpenses(monthTx);
  const prevExpenses = calcTotalExpenses(prevMonthTx);

  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const momChange   = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;
  const hasPrevData = prevExpenses > 0;

  // Maior categoria de despesa
  const catMap = monthTx
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});
  const topCatEntry = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0];
  const topCatName  = topCatEntry ? catLabel(topCatEntry[0]) : "—";
  const topCatValue = topCatEntry ? `R$\u00a0${topCatEntry[1].toFixed(0)}` : "—";

  // Dias restantes no mês
  const today    = new Date();
  const daysLeft = differenceInCalendarDays(endOfMonth(today), today) + 1;

  const kpis = [
    {
      label: "Taxa de poupança",
      value: `${savingsRate.toFixed(1)}%`,
      sub:   income > 0 ? `R$\u00a0${(income - expenses).toFixed(0)} economizados` : "sem receita",
      color: savingsRate >= 20 ? "#22c55e" : savingsRate >= 0 ? "#f59e0b" : "#ef4444",
    },
    {
      label: "Var. despesas",
      value: hasPrevData ? `${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}%` : "—",
      sub:   hasPrevData ? "vs mês anterior" : "sem dados ant.",
      color: hasPrevData
        ? momChange > 15 ? "#ef4444" : momChange > 0 ? "#f59e0b" : "#22c55e"
        : "#4a4a4a",
    },
    {
      label: "Top categoria",
      value: topCatName,
      sub:   topCatValue,
      color: "#9ca3af",
    },
    {
      label: "Dias restantes",
      value: String(daysLeft),
      sub:   "no mês",
      color: daysLeft <= 5 ? "#f97316" : daysLeft <= 10 ? "#f59e0b" : "#6b7280",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map(({ label, value, sub, color }) => (
        <div
          key={label}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-0.5"
        >
          <p className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide leading-tight">
            {label}
          </p>
          <p className="text-lg font-bold leading-tight truncate" style={{ color }}>
            {value}
          </p>
          <p className="text-[10px] text-[#4a4a4a] leading-snug truncate">{sub}</p>
        </div>
      ))}
    </div>
  );
}
