"use client";

import { useMemo, useState, useCallback } from "react";
import { useFinancasStore, calcTotalIncome, calcTotalExpenses } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useTarefasStore } from "@/store/tarefasStore";
import { useMoodStore } from "@/store/moodStore";
import { generateInsights, type Insight } from "@/lib/insights";
import { format, subDays } from "date-fns";
import { Sparkles } from "lucide-react";

// ─── Colour helpers ───────────────────────────────────────────────────────────

const barColor: Record<Insight["type"], string> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  negative: "bg-red-500",
  info: "bg-blue-500",
};

// ─── AI cache key ─────────────────────────────────────────────────────────────

const AI_CACHE_KEY = "ai_insights_v1";

interface AiCacheEntry {
  date: string;
  insights: Insight[];
}

function loadAiCache(): Insight[] | null {
  try {
    const raw = localStorage.getItem(AI_CACHE_KEY);
    if (!raw) return null;
    const entry: AiCacheEntry = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (entry.date !== today) return null;
    return entry.insights;
  } catch {
    return null;
  }
}

function saveAiCache(insights: Insight[]) {
  try {
    const entry: AiCacheEntry = {
      date: new Date().toISOString().slice(0, 10),
      insights,
    };
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(entry));
  } catch { /* ignore */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsightsPanel() {
  const [tick, setTick] = useState(0);
  const [aiInsights, setAiInsights] = useState<Insight[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiUsed, setAiUsed] = useState(false);

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

  // ── Generate rule-based insights ─────────────────────────────────────────────
  const ruleInsights = useMemo(() => {
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

  const displayInsights = aiInsights ?? ruleInsights;

  // ── AI analysis ──────────────────────────────────────────────────────────────
  const handleAiAnalysis = useCallback(async () => {
    // Try cache first
    const cached = loadAiCache();
    if (cached && !aiUsed) {
      setAiInsights(cached);
      setAiUsed(true);
      return;
    }

    setAiLoading(true);
    setAiError(null);

    // Build summary payload
    const today = new Date();
    const thisMonth = format(today, "yyyy-MM");
    const monthTransactions = transactions.filter((t) => t.date.startsWith(thisMonth));
    const monthIncome = calcTotalIncome(monthTransactions);
    const monthExpenses = calcTotalExpenses(monthTransactions);

    // Top category
    const expensesByCategory: Record<string, number> = {};
    monthTransactions.filter((t) => t.type === "expense").forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] ?? 0) + t.amount;
    });
    const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

    const budgetPct = budget ? Math.round((monthExpenses / budget.limitAmount) * 100) : null;

    // Habit week rates
    const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd"));
    const habitsPayload = habits.slice(0, 5).map((h) => {
      const weekDone = last7.filter((d) => (completions[d] ?? []).includes(h.id)).length;
      return {
        name: h.name,
        streak: calcStreak(h.id, completions),
        weekRate: Math.round((weekDone / 7) * 100),
      };
    });

    // Tasks today
    const todayKey = format(today, "yyyy-MM-dd");
    const todayTasks = tasks.filter((t) => t.date === todayKey);
    const overdueCt = tasks.filter((t) => !t.completed && t.date < todayKey).length;

    // Mood week avg
    const weekMoods = moodEntries.filter((e) => last7.includes(e.date));
    const avgMood = weekMoods.length > 0
      ? weekMoods.reduce((s, e) => s + e.mood, 0) / weekMoods.length
      : null;

    try {
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habits: habitsPayload,
          finance: { monthExpenses, monthIncome, topCategory, budgetPct },
          tasks: { doneToday: todayTasks.filter((t) => t.completed).length, totalToday: todayTasks.length, overdueCt },
          mood: { avgWeek: avgMood },
        }),
      });

      if (res.status === 503) {
        setAiError("Configure ANTHROPIC_API_KEY para usar IA");
        return;
      }

      if (!res.ok) throw new Error("api_error");

      const data = await res.json();
      if (data.insights && Array.isArray(data.insights)) {
        const insights = data.insights as Insight[];
        setAiInsights(insights);
        setAiUsed(true);
        saveAiCache(insights);
      }
    } catch {
      setAiError("Não foi possível gerar análise com IA");
    } finally {
      setAiLoading(false);
    }
  }, [habits, completions, transactions, budget, tasks, moodEntries, aiUsed]);

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
          {aiUsed && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-[#a78bfa]/15 text-[#a78bfa]">
              IA
            </span>
          )}
          {!aiUsed && (
            <span className="text-[10px] text-white/30 leading-none pt-px">
              Atualizado agora
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* AI button */}
          <button
            onClick={handleAiAnalysis}
            disabled={aiLoading}
            title="Analisar com IA"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#a78bfa]/60 hover:text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Sparkles size={11} className={aiLoading ? "animate-pulse" : ""} />
            {aiLoading ? "analisando…" : "analisar com IA"}
          </button>

          {/* Refresh button */}
          <button
            onClick={() => { setTick((n) => n + 1); setAiInsights(null); setAiUsed(false); setAiError(null); }}
            title="Atualizar insights"
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
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
      </div>

      {/* AI error */}
      {aiError && (
        <p className="text-[11px] text-[#ef4444]/70 px-0.5">{aiError}</p>
      )}

      {/* AI loading skeleton */}
      {aiLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 h-14 animate-pulse" />
          ))}
        </div>
      )}

      {/* Cards */}
      {!aiLoading && (
        <ul className="flex flex-col gap-2">
          {displayInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} isAi={aiUsed} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Individual card ──────────────────────────────────────────────────────────

function InsightCard({ insight, isAi }: { insight: Insight; isAi?: boolean }) {
  return (
    <li className="group bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 flex gap-3 hover:border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors cursor-default">
      {/* Left colour bar */}
      <div
        className={`shrink-0 w-1 rounded-full self-stretch ${barColor[insight.type]}`}
        aria-hidden="true"
      />

      {/* Icon + text */}
      <div className="flex gap-2.5 items-start min-w-0 flex-1">
        <span className="text-base leading-none mt-0.5 shrink-0" role="img" aria-label="">
          {insight.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold text-white leading-snug">
              {insight.title}
            </p>
            {isAi && (
              <span className="text-[8px] text-[#a78bfa]/50 font-medium shrink-0">✨</span>
            )}
          </div>
          <p className="text-[11px] text-white/50 leading-snug mt-0.5">
            {insight.body}
          </p>
        </div>
      </div>
    </li>
  );
}
