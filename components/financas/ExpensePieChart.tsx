"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancasStore } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  housing: "#6366f1",
  food: "#22c55e",
  transport: "#f59e0b",
  health: "#ec4899",
  entertainment: "#8b5cf6",
  education: "#06b6d4",
  shopping: "#f97316",
  investments: "#14b8a6",
  other: "#6b7280",
};

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
};

export function ExpensePieChart() {
  const transactions = useFinancasStore((s) => s.transactions);

  const grouped = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(grouped).map(([name, value]) => ({
    name: CATEGORY_LABELS[name] ?? name,
    value,
    color: CATEGORY_COLORS[name] ?? "#6b7280",
  }));

  if (data.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-[#6b7280] text-sm">
          Nenhuma despesa registrada
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                color: "#f5f5f5",
              }}
              formatter={(value: number | undefined) => [formatBRL(value ?? 0), ""]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
