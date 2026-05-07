"use client";
import { useHabitosStore, calcBestStreak } from "@/store/habitosStore";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart2, Award, Zap, PauseCircle } from "lucide-react";
import Link from "next/link";

const WEEK_DAYS_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function HabitAdvancedStats() {
  const { habits, completions } = useHabitosStore();

  if (habits.length === 0) return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center">
      <BarChart2 size={24} className="text-[#2a2a2a] mx-auto mb-2" />
      <p className="text-xs text-[#4a4a4a]">
        Estatísticas aparecem conforme você cria e registra hábitos.
      </p>
    </div>
  );

  // ── Total completions all time ──────────────────────────────
  const totalCompletions = Object.values(completions).reduce(
    (sum, ids) => sum + (ids?.length ?? 0),
    0
  );

  // ── Best day of week (last 90 days) ────────────────────────
  const dayCount: number[] = [0, 0, 0, 0, 0, 0, 0]; // index = getDay()
  const daySample: Record<number, number> = {}; // how many mondays, tuesdays, etc.
  for (let i = 0; i < 90; i++) {
    const d = subDays(new Date(), i);
    const key = format(d, "yyyy-MM-dd");
    const dow = d.getDay();
    daySample[dow] = (daySample[dow] ?? 0) + 1;
    dayCount[dow] += completions[key]?.length ?? 0;
  }
  // Normalize by number of occurrences of that weekday in the window
  const normalized = dayCount.map((c, i) => (daySample[i] ? c / daySample[i] : 0));
  const bestDowIdx = normalized.indexOf(Math.max(...normalized));
  const bestDowLabel = WEEK_DAYS_LABELS[bestDowIdx];
  const bestDowAvg = normalized[bestDowIdx];

  // ── Consistency last 30 days ───────────────────────────────
  let daysWithAny = 0;
  for (let i = 0; i < 30; i++) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    if ((completions[key]?.length ?? 0) > 0) daysWithAny++;
  }
  const consistencyPct = Math.round((daysWithAny / 30) * 100);

  // ── Best streak habit ──────────────────────────────────────
  const bestStreakHabit = habits
    .map((h) => ({ ...h, best: calcBestStreak(h.id, completions) }))
    .filter((h) => h.best > 0)
    .sort((a, b) => b.best - a.best)[0];

  // ── Active vs paused ───────────────────────────────────────
  const pausedCount = habits.filter((h) => h.paused).length;
  const activeCount = habits.length - pausedCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart2 size={14} className="text-[#6366f1]" />
        <span className="text-sm font-medium text-white">Estatísticas avançadas</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total completions */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-1">
          <div className="w-6 h-6 rounded-md bg-[#6366f1]/10 flex items-center justify-center mb-1.5">
            <Zap size={12} className="text-[#a78bfa]" />
          </div>
          <p className="text-xl font-bold text-white">{totalCompletions}</p>
          <p className="text-[11px] text-[#4a4a4a]">conclusões no total</p>
        </div>

        {/* Consistency */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-1">
          <div className="w-6 h-6 rounded-md bg-[#22c55e]/10 flex items-center justify-center mb-1.5">
            <BarChart2 size={12} className="text-[#22c55e]" />
          </div>
          <p className="text-xl font-bold text-white">{consistencyPct}%</p>
          <p className="text-[11px] text-[#4a4a4a]">consistência (30 dias)</p>
          <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${consistencyPct}%`,
                background:
                  consistencyPct >= 80
                    ? "#22c55e"
                    : consistencyPct >= 50
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Best day */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-1">
          <div className="w-6 h-6 rounded-md bg-[#f59e0b]/10 flex items-center justify-center mb-1.5">
            <Award size={12} className="text-[#f59e0b]" />
          </div>
          <p className="text-xl font-bold text-white">
            {bestDowAvg > 0 ? bestDowLabel : "—"}
          </p>
          <p className="text-[11px] text-[#4a4a4a]">
            {bestDowAvg > 0
              ? `melhor dia (≈${bestDowAvg.toFixed(1)} hab/dia)`
              : "melhor dia da semana"}
          </p>
        </div>

        {/* Active / paused */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-1">
          <div className="w-6 h-6 rounded-md bg-[#06b6d4]/10 flex items-center justify-center mb-1.5">
            <PauseCircle size={12} className="text-[#06b6d4]" />
          </div>
          <p className="text-xl font-bold text-white">{activeCount}</p>
          <p className="text-[11px] text-[#4a4a4a]">
            ativos
            {pausedCount > 0 && (
              <span className="text-[#f59e0b]"> · {pausedCount} pausados</span>
            )}
          </p>
        </div>
      </div>

      {/* Best streak highlight */}
      {bestStreakHabit && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: bestStreakHabit.color + "25" }}
          >
            <Award size={15} style={{ color: bestStreakHabit.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#4a4a4a]">Maior streak histórico</p>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: bestStreakHabit.color }}
              />
              <Link
                href={`/habitos/${bestStreakHabit.id}`}
                className="text-sm font-semibold text-white hover:text-[#a78bfa] transition-colors truncate"
              >
                {bestStreakHabit.name}
              </Link>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p
              className="text-xl font-bold"
              style={{ color: bestStreakHabit.color }}
            >
              {bestStreakHabit.best}
            </p>
            <p className="text-[10px] text-[#4a4a4a]">dias</p>
          </div>
        </div>
      )}

      {/* Paused habits list */}
      {pausedCount > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-2">
          <p className="text-xs text-[#6b7280] font-medium flex items-center gap-1.5">
            <PauseCircle size={12} className="text-[#f59e0b]" />
            Hábitos pausados
          </p>
          <div className="flex flex-wrap gap-2">
            {habits
              .filter((h) => h.paused)
              .map((h) => (
                <Link
                  key={h.id}
                  href={`/habitos/${h.id}`}
                  className="flex items-center gap-1.5 bg-[#141414] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-xs text-[#6b7280] hover:text-white hover:border-[#3a3a3a] transition-colors"
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: h.color }}
                  />
                  {h.name}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
