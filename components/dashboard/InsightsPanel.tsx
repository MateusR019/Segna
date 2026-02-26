"use client";

import { useMemo, useState } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useTarefasStore } from "@/store/tarefasStore";
import { useMoodStore } from "@/store/moodStore";
import { generateInsights, type Insight } from "@/lib/insights";

// ─── Colour helpers ───────────────────────────────────────────────────────────

const barColor: Record<Insight["type"], string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  negative: "bg-red-500",
  info: "bg-blue-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsightsPanel() {
  const [tick, setTick] = useState(0);

  // ── Store data ───────────────────────────────────────────────────────────────
  const { transactions, budget } = useFinancasStore();
  const { habits, completions } = useHabitosStore();
  const { tasks } = useTarefasStore();
  const { entries: moodEntries } = useMoodStore();

  // ── Build habits with streak ─────────────────────────────────────────────────
  const habitsWithStreak = useMemo(
    () =>
      habits.map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        streak: calcStreak(h.id, completions),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits, completions, tick]
  );

  // ── Generate insights ────────────────────────────────────────────────────────
  const insights = useMemo(() => {
    return generateInsights({
      habits: habitsWithStreak,
      completions,
      transactions: transactions.map((t) => ({
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
      budget,
      tasks: tasks.map((t) => ({
        date: t.date,
        completed: t.completed,
        priority: t.priority,
      })),
      moodEntries: moodEntries.map((e) => ({
        date: e.date,
        mood: e.mood,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitsWithStreak, completions, transactions, budget, tasks, moodEntries, tick]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          {/* Lightbulb icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.9 10 18.9 8 19 6a7 7 0 1 0-13.4 2.3C6.4 9.8 7.1 11 8.5 12.5c.8.8 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <h2 className="text-sm font-semibold text-white">Insights</h2>
          <span className="text-[10px] text-white/30 leading-none pt-px">
            Atualizado agora
          </span>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => setTick((n) => n + 1)}
          title="Atualizar insights"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          atualizar
        </button>
      </div>

      {/* Cards */}
      <ul className="flex flex-col gap-2">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </ul>
    </section>
  );
}

// ─── Individual card ──────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <li className="group bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 flex gap-3 hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors cursor-default">
      {/* Left colour bar */}
      <div
        className={`shrink-0 w-1 rounded-full self-stretch ${barColor[insight.type]}`}
        aria-hidden="true"
      />

      {/* Icon + text */}
      <div className="flex gap-2.5 items-start min-w-0">
        <span className="text-base leading-none mt-0.5 shrink-0" role="img" aria-label="">
          {insight.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white leading-snug">
            {insight.title}
          </p>
          <p className="text-[11px] text-white/50 leading-snug mt-0.5">
            {insight.body}
          </p>
        </div>
      </div>
    </li>
  );
}
