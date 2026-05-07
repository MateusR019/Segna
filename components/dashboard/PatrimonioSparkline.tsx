"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { PatrimonioSnapshot } from "@/store/patrimonioStore";
import { formatBRL } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  snapshots: PatrimonioSnapshot[];
}

interface TooltipPayload {
  value: number;
  payload: PatrimonioSnapshot;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const snap = payload[0].payload;
  const dateLabel = format(parseISO(snap.date), "d MMM", { locale: ptBR });
  return (
    <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-2 text-xs space-y-0.5 shadow-lg">
      <p className="text-[#6b7280] text-[10px]">{dateLabel}</p>
      <p className="text-white font-semibold">{formatBRL(snap.total)}</p>
      {snap.financas !== 0 && (
        <p className="text-[#22c55e]">Saldo: {formatBRL(snap.financas)}</p>
      )}
      {snap.cripto > 0 && (
        <p className="text-[#f59e0b]">Cripto: {formatBRL(snap.cripto)}</p>
      )}
      {snap.investimentos > 0 && (
        <p className="text-[#6366f1]">Invest: {formatBRL(snap.investimentos)}</p>
      )}
    </div>
  );
}

export function PatrimonioSparkline({ snapshots }: Props) {
  if (snapshots.length < 2) return (
    <div className="mt-3 h-12 flex items-center justify-center">
      <p className="text-[11px] text-[#3a3a3a]">Adicione mais lançamentos para ver a evolução do patrimônio</p>
    </div>
  );

  const first = snapshots[0].total;
  const last = snapshots[snapshots.length - 1].total;
  const isGrowing = last >= first;
  const lineColor = isGrowing ? "#22c55e" : "#ef4444";

  const data = snapshots.map((s) => ({ ...s, value: s.total }));

  return (
    <div className="mt-3">
      <ResponsiveContainer width="100%" height={48}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#3a3a3a", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: lineColor, stroke: "none" }}
          />
          <ReferenceLine y={first} stroke="#2a2a2a" strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
