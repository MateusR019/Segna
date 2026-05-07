"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancasStore } from "@/store/financasStore";
import { format, parseISO, subDays, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Period = "daily" | "weekly" | "monthly";

export function MonthlyLineChart() {
  const transactions = useFinancasStore((s) => s.transactions);
  const [period, setPeriod] = useState<Period>("monthly");
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const tooltipStyle = {
    background: isLight ? "#ffffff" : "#1a1a1a",
    border: `1px solid ${isLight ? "#d1d5db" : "#2a2a2a"}`,
    borderRadius: "6px",
    color: isLight ? "#111111" : "#f5f5f5",
  };

  function getChartData() {
    if (period === "monthly") {
      const grouped: Record<string, { income: number; expenses: number }> = {};
      transactions.forEach((t) => {
        const monthKey = t.date.slice(0, 7);
        if (!grouped[monthKey]) grouped[monthKey] = { income: 0, expenses: 0 };
        if (t.type === "income") grouped[monthKey].income += t.amount;
        else grouped[monthKey].expenses += t.amount;
      });
      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, v]) => ({
          label: format(parseISO(`${key}-01`), "MMM", { locale: ptBR }),
          Receitas: v.income,
          Despesas: v.expenses,
        }));
    }

    if (period === "weekly") {
      // Last 12 weeks — each week starts on Monday
      const today = new Date();
      const weeks: { start: string; label: string }[] = [];
      for (let i = 11; i >= 0; i--) {
        const anchor = subDays(today, i * 7);
        const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
        weeks.push({
          start: format(weekStart, "yyyy-MM-dd"),
          label: format(weekStart, "d/M"),
        });
      }
      return weeks.map(({ start, label }) => {
        const end = format(addDays(parseISO(start), 7), "yyyy-MM-dd");
        const weekTxs = transactions.filter((t) => t.date >= start && t.date < end);
        return {
          label,
          Receitas: weekTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          Despesas: weekTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    }

    // Daily — last 30 days
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const day = format(subDays(today, 29 - i), "yyyy-MM-dd");
      const dayTxs = transactions.filter((t) => t.date === day);
      return {
        label: format(parseISO(day), "d/M"),
        Receitas: dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Despesas: dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }

  const data = getChartData();
  const hasData = data.some((d) => d.Receitas > 0 || d.Despesas > 0);

  const periodLabels: Record<Period, string> = {
    daily:   "Diário",
    weekly:  "Semanal",
    monthly: "Mensal",
  };

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Receitas vs Despesas
          </CardTitle>
          <div className="flex items-center gap-1 bg-[#0f0f0f] rounded-lg p-0.5 border border-[#2a2a2a]">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                  period === p
                    ? "bg-[#6366f1] text-white"
                    : "text-[#6b7280] hover:text-[#9ca3af]"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {!hasData ? (
        <CardContent className="flex flex-col items-center justify-center h-48 gap-1">
          <p className="text-sm text-[#4a4a4a]">Nenhuma transação no período</p>
          <p className="text-xs text-[#3a3a3a]">Adicione receitas ou despesas para ver o gráfico.</p>
        </CardContent>
      ) : (
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={period === "daily" ? 4 : 0}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) =>
                  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
                }
              />
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: isLight ? "#111111" : "#f5f5f5" }}
                labelStyle={{ color: isLight ? "#374151" : "#9ca3af" }}
                formatter={(value: number | undefined, name: string | undefined) => [
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value ?? 0),
                  name ?? "",
                ]}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="Receitas"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="Despesas"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}
