"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancasStore } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";

/* Tooltip sem o ":" do Recharts padrão */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }}>
      <p style={{ color: "#9ca3af", marginBottom: "3px" }}>{payload[0].name}</p>
      <p style={{ color: "#f5f5f5", fontWeight: 600 }}>{formatBRL(payload[0].value)}</p>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  housing:      "#6366f1",
  food:         "#22c55e",
  transport:    "#f59e0b",
  fuel:         "#fb923c",
  health:       "#ec4899",
  gym:          "#ef4444",
  supplements:  "#a3e635",
  entertainment:"#8b5cf6",
  education:    "#06b6d4",
  shopping:     "#f97316",
  investments:  "#14b8a6",
  other:        "#6b7280",
};

/* Paleta para categorias personalizadas */
const CUSTOM_PALETTE = ["#f43f5e","#fb923c","#facc15","#a3e635","#34d399","#22d3ee","#818cf8","#e879f9","#fb7185","#38bdf8"];
function customColor(name: string, index: number): string {
  return CUSTOM_PALETTE[index % CUSTOM_PALETTE.length];
}

const CATEGORY_LABELS: Record<string, string> = {
  housing:      "Moradia",
  food:         "Alimentação",
  transport:    "Transporte",
  fuel:         "Combustível",
  health:       "Saúde",
  gym:          "Academia / Treino",
  supplements:  "Suplementos",
  entertainment:"Entretenimento",
  education:    "Educação",
  shopping:     "Compras",
  investments:  "Investimentos",
  other:        "Outros",
};

export function ExpensePieChart() {
  const transactions = useFinancasStore((s) => s.transactions);
  const customExpenseCategories = useFinancasStore((s) => s.customExpenseCategories);

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
        <CardContent className="flex flex-col items-center justify-center h-48 gap-1">
          <p className="text-sm text-[#4a4a4a]">Nenhuma despesa registrada</p>
          <p className="text-xs text-[#3a3a3a]">Adicione uma transação do tipo despesa para ver a distribuição.</p>
        </CardContent>
      </Card>
    );
  }

  /* Monta mapa de cor para categorias custom (por ordem de criação) */
  const customColorMap: Record<string, string> = {};
  customExpenseCategories.forEach((name, i) => {
    customColorMap[name] = customColor(name, i);
  });

  const COLORS = entries.map(([key]) => CATEGORY_COLORS[key] ?? customColorMap[key] ?? "#6b7280");

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
            <Tooltip content={<CustomTooltip />} />
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
                  <span className="text-xs text-[#6b7280] flex-shrink-0">{pct}%</span>
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
