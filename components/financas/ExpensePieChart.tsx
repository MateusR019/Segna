"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
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

  const entries = Object.entries(grouped);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (entries.length === 0) {
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

  const COLORS = entries.map(([key]) => CATEGORY_COLORS[key] ?? "#6b7280");

  const data = entries.map(([key, value]) => ({
    name: CATEGORY_LABELS[key] ?? key,
    value,
  }));

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={COLORS[i]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                color: "#f5f5f5",
                fontSize: "12px",
              }}
              formatter={(value: number | undefined) => [
                formatBRL(value ?? 0),
                "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom legend abaixo do gráfico */}
        <div className="space-y-1.5 mt-4 pt-3 border-t border-[#2a2a2a]">
          {data.map((entry, i) => {
            const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
            return (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ background: COLORS[i] }}
                  />
                  <span className="text-xs text-[#9ca3af] truncate">{entry.name}</span>
                  <span className="text-xs text-[#4a4a4a] flex-shrink-0">{pct}%</span>
                </div>
                <span className="text-xs text-white font-medium flex-shrink-0 ml-3">
                  {formatBRL(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
