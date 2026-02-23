"use client";
import Link from "next/link";
import { useHydrated } from "@/hooks/useHydrated";
import { useFinancasStore, calcBalance, calcTotalIncome, calcTotalExpenses } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useDefiStore } from "@/store/defiStore";
import { useNotasStore } from "@/store/notasStore";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, CheckSquare, Coins, StickyNote, ArrowRight, Flame } from "lucide-react";

export default function DashboardPage() {
  const hydrated = useHydrated();

  const transactions = useFinancasStore((s) => s.transactions);
  const budget = useFinancasStore((s) => s.budget);
  const { habits, completions } = useHabitosStore();
  const tokens = useDefiStore((s) => s.tokens);
  const { notes, tags } = useNotasStore();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const thisMonth = format(new Date(), "yyyy-MM");
  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Finance data (this month only)
  const monthTransactions = transactions.filter((t) => t.date.startsWith(thisMonth));
  const monthIncome = calcTotalIncome(monthTransactions);
  const monthExpenses = calcTotalExpenses(monthTransactions);
  const monthBalance = calcBalance(monthTransactions);

  // Habits data
  const completedToday = completions[todayKey]?.length ?? 0;
  const habitTotal = habits.length;
  const habitPct = habitTotal === 0 ? 0 : Math.round((completedToday / habitTotal) * 100);

  // DeFi data
  const portfolioTotal = tokens.reduce((acc, t) => acc + t.quantity * t.priceInBRL, 0);

  // Recent notes (last 3)
  const recentNotes = notes.slice(0, 3);
  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  // Top streaks
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
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-20 bg-[#1a1a1a]" />)}
        </div>
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
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-[#6b7280] capitalize">{todayLabel}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Balance */}
        <Link href="/financas" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 md:p-4 hover:border-[#3a3a3a] transition-colors">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">Saldo mês</p>
          <p className="text-lg font-semibold truncate" style={{ color: monthBalance >= 0 ? "#22c55e" : "#ef4444" }}>
            {formatBRL(monthBalance)}
          </p>
          <p className="text-xs text-[#4a4a4a] mt-1 flex items-center gap-1 truncate">
            {monthBalance >= 0 ? <TrendingUp size={10} className="flex-shrink-0" /> : <TrendingDown size={10} className="flex-shrink-0" />}
            <span className="truncate">{formatBRL(monthIncome)} · {formatBRL(monthExpenses)}</span>
          </p>
          {budget && (() => {
            const bPct = Math.min((monthExpenses / budget.limitAmount) * 100, 100);
            const over = monthExpenses > budget.limitAmount;
            return (
              <div className="mt-2 h-1 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${bPct}%`, background: over ? "#ef4444" : bPct > 80 ? "#f59e0b" : "#22c55e" }} />
              </div>
            );
          })()}
        </Link>

        {/* Habits */}
        <Link href="/habitos" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 md:p-4 hover:border-[#3a3a3a] transition-colors">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">Hábitos hoje</p>
          <p className="text-lg font-semibold text-white">{completedToday}<span className="text-sm text-[#4a4a4a]">/{habitTotal}</span></p>
          <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${habitPct}%` }} />
          </div>
        </Link>

        {/* DeFi */}
        <Link href="/defi" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 md:p-4 hover:border-[#3a3a3a] transition-colors">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">Portfolio</p>
          <p className="text-lg font-semibold text-white truncate">{formatBRL(portfolioTotal)}</p>
          <p className="text-xs text-[#4a4a4a] mt-1">{tokens.length} {tokens.length === 1 ? "ativo" : "ativos"}</p>
        </Link>

        {/* Notes */}
        <Link href="/notas" className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 md:p-4 hover:border-[#3a3a3a] transition-colors">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">Notas</p>
          <p className="text-lg font-semibold text-white">{notes.length}</p>
          <p className="text-xs text-[#4a4a4a] mt-1">{tags.length} {tags.length === 1 ? "tag" : "tags"}</p>
        </Link>
      </div>

      {/* Lower sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Habits checklist today */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare size={14} className="text-[#9ca3af]" />
              <span className="text-sm font-medium text-[#9ca3af]">Hábitos de hoje</span>
            </div>
            <Link href="/habitos" className="text-xs text-[#4a4a4a] hover:text-[#9ca3af] flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>
          {habits.length === 0 ? (
            <p className="text-xs text-[#4a4a4a] py-4 text-center">Nenhum hábito cadastrado</p>
          ) : (
            <div className="space-y-1.5">
              {habits.slice(0, 5).map((habit) => {
                const done = (completions[todayKey] ?? []).includes(habit.id);
                const streak = calcStreak(habit.id, completions);
                return (
                  <div key={habit.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${done ? "bg-[#22c55e] border-[#22c55e]" : "border-[#3a3a3a]"}`}>
                        {done && <svg viewBox="0 0 12 12" width="8" height="8" fill="none"><path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: habit.color }} />
                      <span className={`text-xs ${done ? "text-[#4a4a4a] line-through" : "text-white"}`}>{habit.name}</span>
                    </div>
                    {streak > 0 && (
                      <span className="text-xs text-[#f59e0b] flex items-center gap-0.5">
                        <Flame size={10} />{streak}
                      </span>
                    )}
                  </div>
                );
              })}
              {habits.length > 5 && (
                <p className="text-xs text-[#4a4a4a] pt-1">+{habits.length - 5} mais</p>
              )}
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote size={14} className="text-[#9ca3af]" />
              <span className="text-sm font-medium text-[#9ca3af]">Notas recentes</span>
            </div>
            <Link href="/notas" className="text-xs text-[#4a4a4a] hover:text-[#9ca3af] flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight size={10} />
            </Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-xs text-[#4a4a4a] py-4 text-center">Nenhuma nota ainda</p>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => {
                const tag = note.tagId ? tagMap[note.tagId] : undefined;
                return (
                  <div key={note.id} className="border-b border-[#2a2a2a] pb-2 last:border-0 last:pb-0">
                    {tag && (
                      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded mb-1" style={{ background: tag.color + "22", color: tag.color }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: tag.color }} />
                        {tag.label}
                      </span>
                    )}
                    <p className="text-xs text-white line-clamp-2 leading-relaxed">{note.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Streaks */}
      {topStreaks.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-[#f59e0b]" />
            <span className="text-sm font-medium text-[#9ca3af]">Maiores streaks</span>
          </div>
          <div className="flex gap-4">
            {topStreaks.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                <span className="text-xs text-white">{h.name}</span>
                <span className="text-xs font-medium text-[#f59e0b] flex items-center gap-0.5">
                  <Flame size={10} />{h.streak}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
