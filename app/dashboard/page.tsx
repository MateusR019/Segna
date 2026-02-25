"use client";
import Link from "next/link";
import { useHydrated } from "@/hooks/useHydrated";
import { useFinancasStore, calcBalance, calcTotalIncome, calcTotalExpenses } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useDefiStore } from "@/store/defiStore";
import { useNotasStore } from "@/store/notasStore";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { format, getDaysInMonth, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp, TrendingDown, CheckSquare, Coins, StickyNote,
  ArrowRight, Flame, Wallet, CalendarDays, Target,
} from "lucide-react";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { BudgetAlertBanner } from "@/components/BudgetAlertBanner";
import { ExportDataButton } from "@/components/ExportDataButton";
import { QuickAddFAB } from "@/components/dashboard/QuickAddFAB";

/** Strip checklist markdown syntax from note preview */
function stripChecklist(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^\[[ xX]\]\s*/, ""))
    .join("\n")
    .trim();
}

export default function DashboardPage() {
  const hydrated = useHydrated();

  const transactions = useFinancasStore((s) => s.transactions);
  const budget = useFinancasStore((s) => s.budget);
  const { habits, completions, toggleCompletion } = useHabitosStore();
  const tokens = useDefiStore((s) => s.tokens);
  const { notes, tags } = useNotasStore();

  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const thisMonth = format(today, "yyyy-MM");
  const todayLabel = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });

  // ── Finance data (this month) ────────────────────────────────
  const monthTransactions = transactions.filter((t) => t.date.startsWith(thisMonth));
  const monthIncome = calcTotalIncome(monthTransactions);
  const monthExpenses = calcTotalExpenses(monthTransactions);
  const monthBalance = calcBalance(monthTransactions);

  // Projected end-of-month balance
  const dayOfMonth = today.getDate();
  const totalDays = getDaysInMonth(today);
  const remainingDays = totalDays - dayOfMonth;
  const avgDailyExpense = dayOfMonth > 0 ? monthExpenses / dayOfMonth : 0;
  const projectedExpenses = monthExpenses + avgDailyExpense * remainingDays;
  const projectedBalance = monthIncome - projectedExpenses;
  const showProjection = dayOfMonth < totalDays && dayOfMonth >= 3;

  // Last 7 days expenses
  const last7Keys = Array.from({ length: 7 }, (_, i) =>
    format(subDays(today, i), "yyyy-MM-dd")
  );
  const weekExpenses = transactions
    .filter((t) => t.type === "expense" && last7Keys.includes(t.date))
    .reduce((sum, t) => sum + t.amount, 0);

  // ── Habits data ──────────────────────────────────────────────
  const activeHabits = habits.filter((h) => !h.paused);
  const completedToday = (completions[todayKey] ?? []).filter((id) =>
    activeHabits.some((h) => h.id === id)
  ).length;
  const habitTotal = activeHabits.length;
  const habitPct = habitTotal === 0 ? 0 : Math.round((completedToday / habitTotal) * 100);

  // Weekly habit completions (last 7 days)
  const weekHabitCompletions = last7Keys.reduce(
    (sum, d) => sum + (completions[d]?.length ?? 0),
    0
  );

  // Best habit this week (most completions in last 7 days)
  const bestHabitThisWeek = habits
    .map((h) => ({
      ...h,
      weekCount: last7Keys.filter((d) =>
        (completions[d] ?? []).includes(h.id)
      ).length,
    }))
    .filter((h) => h.weekCount > 0)
    .sort((a, b) => b.weekCount - a.weekCount)[0];

  // ── DeFi data ────────────────────────────────────────────────
  const portfolioTotal = tokens.reduce(
    (acc, t) => acc + t.quantity * t.priceInBRL,
    0
  );

  // ── Notes ────────────────────────────────────────────────────
  const recentNotes = notes.slice(0, 3);
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  // ── Top streaks ──────────────────────────────────────────────
  const topStreaks = habits
    .map((h) => ({ ...h, streak: calcStreak(h.id, completions) }))
    .filter((h) => h.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-7 w-48 bg-[#1a1a1a]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-[#1a1a1a]" />
          ))}
        </div>
        <Skeleton className="h-16 bg-[#1a1a1a]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 bg-[#1a1a1a]" />
          <Skeleton className="h-48 bg-[#1a1a1a]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-[#6b7280] capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDataButton />
          <WeatherWidget />
        </div>
      </div>

      {/* Budget Alert */}
      <BudgetAlertBanner />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Balance */}
        <Link
          href="/financas"
          className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4 card-hover"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
              <Wallet size={13} className="text-[#22c55e]" />
            </div>
            <ArrowRight
              size={12}
              className="text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors"
            />
          </div>
          <p
            className="text-lg font-semibold truncate"
            style={{ color: monthBalance >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {formatBRL(monthBalance)}
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Saldo do mês</p>
          {showProjection && (
            <p
              className="text-[10px] mt-0.5"
              style={{
                color: projectedBalance >= 0 ? "#16a34a80" : "#ef444480",
              }}
            >
              Projeção: {formatBRL(projectedBalance)}
            </p>
          )}
          {budget &&
            (() => {
              const bPct = Math.min(
                (monthExpenses / budget.limitAmount) * 100,
                100
              );
              const over = monthExpenses > budget.limitAmount;
              return (
                <div className="mt-2 h-1 rounded-full bg-[#2a2a2a] overflow-hidden">
                  <div
                    className="h-full rounded-full bar-animated"
                    style={{
                      width: `${bPct}%`,
                      background: over
                        ? "#ef4444"
                        : bPct > 80
                        ? "#f59e0b"
                        : "#22c55e",
                    }}
                  />
                </div>
              );
            })()}
        </Link>

        {/* Habits */}
        <Link
          href="/habitos"
          className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4 card-hover"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
              <CheckSquare size={13} className="text-[#a78bfa]" />
            </div>
            <ArrowRight
              size={12}
              className="text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors"
            />
          </div>
          <p className="text-lg font-semibold text-white">
            {completedToday}
            <span className="text-sm font-normal text-[#4a4a4a]">
              /{habitTotal}
            </span>
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">Hábitos hoje</p>
          <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bar-animated"
              style={{
                width: `${habitPct}%`,
                background: habitPct === 100 ? "#22c55e" : "#6366f1",
              }}
            />
          </div>
        </Link>

        {/* DeFi */}
        <Link
          href="/defi"
          className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4 card-hover"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
              <Coins size={13} className="text-[#f59e0b]" />
            </div>
            <ArrowRight
              size={12}
              className="text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors"
            />
          </div>
          <p className="text-lg font-semibold text-white truncate">
            {formatBRL(portfolioTotal)}
          </p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">
            {tokens.length} {tokens.length === 1 ? "ativo" : "ativos"}
          </p>
        </Link>

        {/* Notes */}
        <Link
          href="/notas"
          className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 md:p-4 card-hover"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
              <StickyNote size={13} className="text-[#06b6d4]" />
            </div>
            <ArrowRight
              size={12}
              className="text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors"
            />
          </div>
          <p className="text-lg font-semibold text-white">{notes.length}</p>
          <p className="text-[11px] text-[#4a4a4a] mt-0.5">
            {tags.length} {tags.length === 1 ? "tag" : "tags"}
          </p>
        </Link>
      </div>

      {/* Weekly summary */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={14} className="text-[#6366f1]" />
          <span className="text-sm font-medium text-white">Últimos 7 dias</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Habit completions this week */}
          <div className="text-center space-y-0.5">
            <p className="text-xl font-bold text-[#a78bfa]">{weekHabitCompletions}</p>
            <p className="text-[11px] text-[#4a4a4a]">conclusões de hábitos</p>
          </div>
          {/* Best habit */}
          <div className="text-center space-y-0.5">
            {bestHabitThisWeek ? (
              <>
                <div className="flex items-center justify-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: bestHabitThisWeek.color }}
                  />
                  <p className="text-xs font-semibold text-white truncate max-w-[80px]">
                    {bestHabitThisWeek.name}
                  </p>
                </div>
                <p className="text-[11px] text-[#4a4a4a]">
                  {bestHabitThisWeek.weekCount}× — melhor hábito
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-[#3a3a3a]">—</p>
                <p className="text-[11px] text-[#3a3a3a]">melhor hábito</p>
              </>
            )}
          </div>
          {/* Week expenses */}
          <div className="text-center space-y-0.5">
            <p
              className="text-xl font-bold truncate"
              style={{ color: weekExpenses > 0 ? "#f59e0b" : "#3a3a3a" }}
            >
              {weekExpenses > 0 ? formatBRL(weekExpenses) : "—"}
            </p>
            <p className="text-[11px] text-[#4a4a4a]">em despesas</p>
          </div>
        </div>
      </div>

      {/* Lower sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Habits checklist today */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare size={14} className="text-[#a78bfa]" />
              <span className="text-sm font-medium text-white">
                Hábitos de hoje
              </span>
            </div>
            <Link
              href="/habitos"
              className="text-xs text-[#4a4a4a] hover:text-[#9ca3af] flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>
          {activeHabits.length === 0 ? (
            <div className="py-6 text-center space-y-1.5">
              <p className="text-sm text-[#4a4a4a]">Nenhum hábito cadastrado</p>
              <Link
                href="/habitos"
                className="text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors"
              >
                Criar meu primeiro hábito →
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {activeHabits.slice(0, 5).map((habit) => {
                const done = (completions[todayKey] ?? []).includes(habit.id);
                const streak = calcStreak(habit.id, completions);
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleCompletion(habit.id, todayKey)}
                    className="w-full flex items-center justify-between py-1.5 border-b border-[#1f1f1f] last:border-0 cursor-pointer group text-left transition-opacity hover:opacity-80"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          done
                            ? "bg-[#22c55e] border-[#22c55e]"
                            : "border-[#2a2a2a] group-hover:border-[#4a4a4a]"
                        }`}
                      >
                        {done && (
                          <svg
                            viewBox="0 0 12 12"
                            width="8"
                            height="8"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="black"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: habit.color }}
                      />
                      <span
                        className={`text-sm ${
                          done
                            ? "text-[#4a4a4a] line-through"
                            : "text-[#e5e5e5]"
                        }`}
                      >
                        {habit.name}
                      </span>
                    </div>
                    {streak > 0 && (
                      <span className="text-xs text-[#f59e0b] flex items-center gap-0.5 font-medium">
                        <Flame size={10} />
                        {streak}
                      </span>
                    )}
                  </button>
                );
              })}
              {activeHabits.length > 5 && (
                <p className="text-xs text-[#4a4a4a] pt-1.5">
                  +{activeHabits.length - 5} mais hábitos
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote size={14} className="text-[#06b6d4]" />
              <span className="text-sm font-medium text-white">
                Notas recentes
              </span>
            </div>
            <Link
              href="/notas"
              className="text-xs text-[#4a4a4a] hover:text-[#9ca3af] flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight size={10} />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="py-6 text-center space-y-1.5">
              <p className="text-sm text-[#4a4a4a]">Nenhuma nota ainda</p>
              <Link
                href="/notas"
                className="text-xs text-[#06b6d4] hover:text-[#22d3ee] transition-colors"
              >
                Criar primeira nota →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => {
                const tag = note.tagId ? tagMap[note.tagId] : undefined;
                return (
                  <div
                    key={note.id}
                    className="border-b border-[#1f1f1f] pb-2 last:border-0 last:pb-0"
                  >
                    {tag && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md mb-1 font-medium"
                        style={{
                          background: tag.color + "20",
                          color: tag.color,
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: tag.color }}
                        />
                        {tag.label}
                      </span>
                    )}
                    <p className="text-xs text-[#d1d5db] line-clamp-2 leading-relaxed">
                      {stripChecklist(note.content)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Streaks */}
      {topStreaks.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-medium text-white">
              Maiores streaks
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {topStreaks.map((h) => (
              <Link
                key={h.id}
                href={`/habitos/${h.id}`}
                className="flex items-center gap-2 bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 hover:border-[#3a3a3a] transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: h.color }}
                />
                <span className="text-sm text-white">{h.name}</span>
                <span className="text-sm font-semibold text-[#f59e0b] flex items-center gap-0.5">
                  <Flame size={11} />
                  {h.streak}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add FAB */}
      <QuickAddFAB />
    </div>
  );
}
