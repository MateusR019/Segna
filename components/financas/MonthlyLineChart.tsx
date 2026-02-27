"use client";
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MonthlyLineChart() {
  const transactions = useFinancasStore((s) => s.transactions);

  const grouped: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const monthKey = t.date.slice(0, 7);
    if (!grouped[monthKey]) grouped[monthKey] = { income: 0, expenses: 0 };
    if (t.type === "income") grouped[monthKey].income += t.amount;
    else grouped[monthKey].expenses += t.amount;
  });

  const data = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, v]) => ({
      month: format(parseISO(`${key}-01`), "MMM", { locale: ptBR }),
      Receitas: v.income,
      Despesas: v.expenses,
    }));

  if (data.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Receitas vs Despesas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-[#6b7280] text-sm">
          Sem dados suficientes
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Receitas vs Despesas (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
              }
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                color: "#f5f5f5",
              }}
              itemStyle={{ color: "#f5f5f5" }}
              labelStyle={{ color: "#9ca3af" }}
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
    </Card>
  );
}
