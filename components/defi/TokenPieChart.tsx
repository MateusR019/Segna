"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDefiStore } from "@/store/defiStore";
import { formatBRL } from "@/lib/format";

export function TokenPieChart() {
  const tokens = useDefiStore((s) => s.tokens);
  const total = tokens.reduce((acc, t) => acc + t.quantity * t.priceInBRL, 0);

  const data = tokens.map((t) => ({
    name: t.symbol,
    value: t.quantity * t.priceInBRL,
    color: t.color,
  }));

  if (data.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-[#6b7280] text-sm">
          Sem dados
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Distribuição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "6px",
                color: "#f5f5f5",
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                formatBRL(value ?? 0),
                name ?? "",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom legend */}
        <div className="space-y-1.5 mt-4 pt-3 border-t border-[#2a2a2a]">
          {data.map((d) => {
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-xs text-[#9ca3af]">{d.name}</span>
                  <span className="text-xs text-[#4a4a4a]">{pct}%</span>
                </div>
                <span className="text-xs text-white font-medium">
                  {formatBRL(d.value)}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a] mt-1">
            <span className="text-xs text-[#6b7280]">Total</span>
            <span className="text-xs font-semibold text-white">{formatBRL(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
