"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ClipboardList,
  TrendingUp,
  Smile,
} from "lucide-react";
import { useHabitosStore } from "@/store/habitosStore";
import { useTarefasStore } from "@/store/tarefasStore";
import {
  useFinancasStore,
  calcTotalIncome,
  calcTotalExpenses,
} from "@/store/financasStore";
import {
  useMoodStore,
  MOOD_EMOJIS,
  MOOD_COLORS,
  MOOD_LABELS,
} from "@/store/moodStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/format";
import type { MoodLevel } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekDays(weekOffset: number) {
  const base = addWeeks(new Date(), weekOffset);
  const start = startOfWeek(base, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(base, { weekStartsOn: 1 });
  return { start, end, days: eachDayOfInterval({ start, end }) };
}

// ─── Hábitos Grid ─────────────────────────────────────────────────────────────

function HabitsGrid({
  habits,
  completions,
  days,
}: {
  habits: Array<{ id: string; name: string; color: string }>;
  completions: Record<string, string[]>;
  days: Date[];
}) {
  if (habits.length === 0) {
    return (
      <p className="text-sm text-[#4a4a4a] text-center py-4">
        Nenhum hábito cadastrado
      </p>
    );
  }

  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-[#4a4a4a] font-medium pb-2 pr-4 min-w-[110px]">
              Hábito
            </th>
            {days.map((day) => (
              <th
                key={day.toISOString()}
                className="text-center text-[#4a4a4a] font-medium pb-2 px-1.5 w-8"
              >
                {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
              </th>
            ))}
            <th className="text-center text-[#4a4a4a] font-medium pb-2 pl-3 w-10">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const weekCount = days.filter((day) => {
              const key = format(day, "yyyy-MM-dd");
              return (completions[key] ?? []).includes(habit.id);
            }).length;
            const pct = Math.round((weekCount / days.length) * 100);

            return (
              <tr key={habit.id} className="border-t border-[#1f1f1f]">
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: habit.color }}
                    />
                    <span className="text-[#d1d5db] truncate max-w-[90px]">
                      {habit.name}
                    </span>
                  </div>
                </td>
                {days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const done = (completions[key] ?? []).includes(habit.id);
                  const isFuture = day > today;
                  return (
                    <td key={day.toISOString()} className="text-center px-1.5">
                      {isFuture ? (
                        <span className="text-[#1f1f1f]">·</span>
                      ) : done ? (
                        <span style={{ color: habit.color }}>✓</span>
                      ) : (
                        <span className="text-[#3a3a3a]">○</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center pl-3">
                  <span
                    className="font-semibold"
                    style={{
                      color:
                        pct === 100
                          ? "#22c55e"
                          : pct >= 70
                          ? "#6366f1"
                          : pct >= 40
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  >
                    {pct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mood Bar Chart ───────────────────────────────────────────────────────────

function MoodChart({
  moodEntries,
  days,
}: {
  moodEntries: Array<{ date: string; mood: number }>;
  days: Date[];
}) {
  const entriesMap = Object.fromEntries(
    moodEntries.map((e) => [e.date, e.mood])
  );
  const today = new Date();

  return (
    <div className="flex items-end gap-2 justify-between">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const mood = entriesMap[key] as MoodLevel | undefined;
        const isFuture = day > today;
        const height = mood ? `${(mood / 5) * 48}px` : "4px";
        const color = mood ? MOOD_COLORS[mood] : "#2a2a2a";

        return (
          <div
            key={day.toISOString()}
            className="flex flex-col items-center gap-1 flex-1"
          >
            <div className="h-12 flex items-end justify-center w-full">
              <div
                className="w-full max-w-[20px] rounded-t-sm transition-all"
                style={{ height, background: isFuture ? "#1f1f1f" : color }}
              />
            </div>
            {mood && !isFuture ? (
              <span className="text-[11px]">{MOOD_EMOJIS[mood]}</span>
            ) : (
              <span className="text-[11px] text-[#2a2a2a]">·</span>
            )}
            <span className="text-[10px] text-[#4a4a4a]">
              {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RevisaoPage() {
  const hydrated = useHydrated();
  const [weekOffset, setWeekOffset] = useState(0);

  const { habits, completions } = useHabitosStore();
  const { tasks } = useTarefasStore();
  const { transactions } = useFinancasStore();
  const { entries: moodEntries } = useMoodStore();

  const { start, end, days } = useMemo(
    () => getWeekDays(weekOffset),
    [weekOffset]
  );

  const weekLabel = useMemo(() => {
    const s = format(start, "d 'de' MMM", { locale: ptBR });
    const e = format(end, "d 'de' MMM yyyy", { locale: ptBR });
    return `${s} — ${e}`;
  }, [start, end]);

  const isCurrentWeek = weekOffset === 0;
  const weekKeys = days.map((d) => format(d, "yyyy-MM-dd"));

  // Habits stats
  const activeHabits = habits.filter((h) => !h.paused);
  const habitCompletions = weekKeys.reduce((sum, key) => {
    return (
      sum +
      (completions[key]?.filter((id) =>
        activeHabits.some((h) => h.id === id)
      ).length ?? 0)
    );
  }, 0);
  const habitTotal = activeHabits.length * days.length;
  const habitPct =
    habitTotal === 0 ? 0 : Math.round((habitCompletions / habitTotal) * 100);

  // Tasks stats
  const weekTasks = tasks.filter((t) => weekKeys.includes(t.date));
  const weekTasksDone = weekTasks.filter((t) => t.completed).length;
  const weekTaskPct =
    weekTasks.length === 0
      ? 0
      : Math.round((weekTasksDone / weekTasks.length) * 100);

  // Finance stats
  const weekTransactions = transactions.filter((t) => weekKeys.includes(t.date));
  const weekIncome = calcTotalIncome(weekTransactions);
  const weekExpenses = calcTotalExpenses(weekTransactions);
  const weekBalance = weekIncome - weekExpenses;

  // Mood stats
  const weekMoodEntries = moodEntries.filter((e) => weekKeys.includes(e.date));
  const avgMood =
    weekMoodEntries.length > 0
      ? weekMoodEntries.reduce((sum, e) => sum + e.mood, 0) /
        weekMoodEntries.length
      : null;
  const avgMoodRounded = avgMood
    ? (Math.round(avgMood) as MoodLevel)
    : null;

  // Task per-day breakdown
  const hasTasks = weekTasks.length > 0;

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-56 bg-[#1a1a1a]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-[#1a1a1a]" />
          ))}
        </div>
        <Skeleton className="h-48 bg-[#1a1a1a]" />
        <Skeleton className="h-32 bg-[#1a1a1a]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Revisão Semanal</h1>
          <p className="text-sm text-[#6b7280]">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors cursor-pointer"
            >
              Atual
            </button>
          )}
          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={isCurrentWeek}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Habits */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center mb-2">
            <CheckSquare size={13} className="text-[#a78bfa]" />
          </div>
          <p className="text-lg font-semibold text-white">{habitPct}%</p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Hábitos concluídos</p>
          <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${habitPct}%`,
                background: habitPct === 100 ? "#22c55e" : "#6366f1",
              }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center mb-2">
            <ClipboardList size={13} className="text-[#f59e0b]" />
          </div>
          <p className="text-lg font-semibold text-white">
            {weekTasksDone}
            <span className="text-sm font-normal text-[#4a4a4a]">
              /{weekTasks.length}
            </span>
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Tarefas concluídas</p>
          {weekTasks.length > 0 && (
            <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${weekTaskPct}%`,
                  background: weekTaskPct === 100 ? "#22c55e" : "#f59e0b",
                }}
              />
            </div>
          )}
        </div>

        {/* Finance */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center mb-2">
            <TrendingUp size={13} className="text-[#22c55e]" />
          </div>
          <p
            className="text-lg font-semibold truncate"
            style={{ color: weekBalance >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {formatBRL(weekBalance)}
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Saldo da semana</p>
        </div>

        {/* Mood */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <div className="w-7 h-7 rounded-lg bg-[#ec4899]/10 flex items-center justify-center mb-2">
            <Smile size={13} className="text-[#ec4899]" />
          </div>
          <p className="text-lg font-semibold text-white">
            {avgMoodRounded ? (
              <>
                {MOOD_EMOJIS[avgMoodRounded]}{" "}
                <span className="text-sm text-[#9ca3af]">
                  {(avgMood as number).toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-[#4a4a4a]">—</span>
            )}
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Humor médio</p>
        </div>
      </div>

      {/* Hábitos da semana */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare size={14} className="text-[#a78bfa]" />
          <span className="text-sm font-medium text-white">
            Hábitos da semana
          </span>
          {activeHabits.length > 0 && (
            <span className="text-xs text-[#4a4a4a]">
              {habitCompletions}/{habitTotal} concluídos
            </span>
          )}
        </div>
        <HabitsGrid
          habits={activeHabits}
          completions={completions}
          days={days}
        />
      </div>

      {/* Humor da semana */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smile size={14} className="text-[#ec4899]" />
          <span className="text-sm font-medium text-white">
            Humor da semana
          </span>
          {avgMood !== null && avgMoodRounded && (
            <span className="text-xs text-[#4a4a4a]">
              média {avgMood.toFixed(1)} —{" "}
              {MOOD_LABELS[avgMoodRounded]}
            </span>
          )}
        </div>
        <MoodChart moodEntries={moodEntries} days={days} />
      </div>

      {/* Finanças da semana */}
      {(weekIncome > 0 || weekExpenses > 0) && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[#22c55e]" />
            <span className="text-sm font-medium text-white">
              Finanças da semana
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-base font-semibold text-[#22c55e]">
                {formatBRL(weekIncome)}
              </p>
              <p className="text-[11px] text-[#4a4a4a] mt-0.5">Receitas</p>
            </div>
            <div>
              <p className="text-base font-semibold text-[#ef4444]">
                {formatBRL(weekExpenses)}
              </p>
              <p className="text-[11px] text-[#4a4a4a] mt-0.5">Despesas</p>
            </div>
            <div>
              <p
                className="text-base font-semibold"
                style={{ color: weekBalance >= 0 ? "#22c55e" : "#ef4444" }}
              >
                {formatBRL(weekBalance)}
              </p>
              <p className="text-[11px] text-[#4a4a4a] mt-0.5">Saldo</p>
            </div>
          </div>

          {/* Bar visualization */}
          {(() => {
            const maxVal = Math.max(weekIncome, weekExpenses, 0.01);
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#4a4a4a] w-16 flex-shrink-0">
                    Receita
                  </span>
                  <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(weekIncome / maxVal) * 100}%`,
                        background: "#22c55e",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#4a4a4a] w-16 flex-shrink-0">
                    Despesa
                  </span>
                  <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(weekExpenses / maxVal) * 100}%`,
                        background: "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tarefas por dia */}
      {hasTasks && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-medium text-white">
              Tarefas por dia
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasks.filter((t) => t.date === key);
              const done = dayTasks.filter((t) => t.completed).length;
              const total = dayTasks.length;
              const pct =
                total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <div
                  key={day.toISOString()}
                  className="text-center space-y-1.5"
                >
                  <div className="h-12 flex items-end justify-center">
                    {total > 0 ? (
                      <div
                        className="w-6 bg-[#2a2a2a] rounded-t-sm overflow-hidden"
                        style={{ height: "48px" }}
                      >
                        <div
                          className="w-full rounded-t-sm transition-all"
                          style={{
                            height: `${pct}%`,
                            background:
                              pct === 100 ? "#22c55e" : "#f59e0b",
                            marginTop: `${100 - pct}%`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-1 bg-[#1f1f1f] rounded-full" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#4a4a4a]">
                    {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
                  </p>
                  {total > 0 && (
                    <p className="text-[10px] text-[#6b7280]">
                      {done}/{total}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
