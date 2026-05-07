"use client";
import { useDefiStore } from "@/store/defiStore";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PortfolioChart() {
  const { tokens, snapshots, saveSnapshot } = useDefiStore();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const tooltipStyle = {
    background: isLight ? "#ffffff" : "#1a1a1a",
    border: `1px solid ${isLight ? "#d1d5db" : "#2a2a2a"}`,
    borderRadius: "6px",
    fontSize: "12px",
    color: isLight ? "#111111" : "#f5f5f5",
  };

  // Save a snapshot every time this component mounts (once per session)
  useEffect(() => {
    if (tokens.length > 0) saveSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (snapshots.length < 2) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Evolução do portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-xs text-[#4a4a4a] text-center">
          Histórico disponível após 2+ dias de uso
        </CardContent>
      </Card>
    );
  }

  const data = snapshots.map((s) => ({
    date: s.date,
    label: format(parseISO(s.date), "d MMM", { locale: ptBR }),
    value: s.totalBRL,
  }));

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const diff = last - first;
  const diffPct = first > 0 ? ((diff / first) * 100).toFixed(1) : "0";
  const positive = diff >= 0;

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-[#9ca3af]">
            Evolução do portfolio
          </CardTitle>
          <span className="text-xs font-medium" style={{ color: positive ? "#22c55e" : "#ef4444" }}>
            {positive ? "+" : ""}{diffPct}% ({formatBRL(Math.abs(diff))})
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity={0.2} />
                <stop offset="95%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: isLight ? "#111111" : "#f5f5f5" }}
              labelStyle={{ color: isLight ? "#374151" : "#9ca3af" }}
              formatter={(value: number | undefined) => [formatBRL(value ?? 0), "Portfolio"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={positive ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
