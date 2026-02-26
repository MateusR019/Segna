import {
  format,
  subDays,
  startOfWeek,
  startOfMonth,
  isAfter,
  isBefore,
} from "date-fns";

// ─── Public types ─────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  type: "positive" | "warning" | "info" | "negative";
  icon: string;     // emoji
  title: string;
  body: string;
  priority: number; // higher = shown first
}

// ─── Input types ──────────────────────────────────────────────────────────────

// completions: date ("YYYY-MM-DD") → array of completed habit IDs
export type CompletionMap = Record<string, string[]>;

export interface InsightData {
  // Hábitos
  habits: Array<{ id: string; name: string; streak: number; color: string }>;
  completions: CompletionMap;
  // Finanças
  transactions: Array<{
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
  }>;
  budget: { limitAmount: number } | null;
  // Tarefas
  tasks: Array<{ date: string; completed: boolean; priority: string }>;
  // Mood
  moodEntries: Array<{ date: string; mood: number }>; // mood 1-5
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function dateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function monthPrefix(d: Date): string {
  return format(d, "yyyy-MM");
}

/**
 * Calculates completion rate for all habits over the last 7 days (0-100).
 */
function weeklyHabitRate(
  habits: InsightData["habits"],
  completions: CompletionMap
): number {
  if (habits.length === 0) return 0;

  const today = new Date();
  let completed = 0;
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const day = subDays(today, i);
    const key = dateKey(day);
    const doneIds = completions[key] ?? [];
    total += habits.length;
    completed += habits.filter((h) => doneIds.includes(h.id)).length;
  }

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Returns total expense amount for the current calendar month.
 */
function monthlyExpenses(transactions: InsightData["transactions"]): number {
  const prefix = monthPrefix(new Date());
  return transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prefix))
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Returns { category, amount } for the category with most spending this month.
 * Returns null if no expense transactions this month.
 */
function topSpendingCategory(
  transactions: InsightData["transactions"]
): { category: string; amount: number } | null {
  const prefix = monthPrefix(new Date());
  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(prefix)
  );

  if (expenses.length === 0) return null;

  const byCategory: Record<string, number> = {};
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }

  let topCategory = "";
  let topAmount = 0;
  for (const [cat, amt] of Object.entries(byCategory)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  return { category: topCategory, amount: topAmount };
}

/**
 * Average mood value for the last 7 days. Returns null if no entries.
 */
function weeklyAvgMood(
  moodEntries: InsightData["moodEntries"]
): number | null {
  const today = new Date();
  const cutoff = subDays(today, 6);

  const recent = moodEntries.filter((e) => {
    const d = new Date(e.date);
    return (
      (isAfter(d, cutoff) || dateKey(d) === dateKey(cutoff)) &&
      (isBefore(d, today) || dateKey(d) === dateKey(today))
    );
  });

  if (recent.length === 0) return null;
  const avg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Returns true if today is Monday–Friday (weekday).
 */
function isWeekday(): boolean {
  const day = new Date().getDay(); // 0=Sun, 6=Sat
  return day >= 1 && day <= 5;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateInsights(data: InsightData): Insight[] {
  const insights: Insight[] = [];
  const todayKey = dateKey(new Date());

  // ── 1. Streak >= 7 per habit ────────────────────────────────────────────────
  for (const habit of data.habits) {
    if (habit.streak >= 7) {
      insights.push({
        id: `streak-${habit.id}`,
        type: "positive",
        icon: "🔥",
        title: "Streak incrível!",
        body: `${habit.name} está em ${habit.streak} dias de streak!`,
        priority: 10,
      });
      // Only emit one streak insight (the longest) to avoid flooding
      break;
    }
  }

  // ── 2 & 3. Weekly habit completion rate ─────────────────────────────────────
  if (data.habits.length > 0) {
    const rate = weeklyHabitRate(data.habits, data.completions);

    if (rate < 50) {
      insights.push({
        id: "habit-rate-low",
        type: "warning",
        icon: "⚠️",
        title: "Hábitos abaixo de 50% essa semana",
        body: `Você completou apenas ${rate}% dos seus hábitos nos últimos 7 dias.`,
        priority: 8,
      });
    } else if (rate >= 80) {
      insights.push({
        id: "habit-rate-high",
        type: "positive",
        icon: "💪",
        title: "Semana excelente de hábitos!",
        body: `${rate}% dos hábitos concluídos esta semana. Continue assim!`,
        priority: 9,
      });
    }
  }

  // ── 4 & 5. Budget usage ──────────────────────────────────────────────────────
  if (data.budget) {
    const spent = monthlyExpenses(data.transactions);
    const pct = Math.round((spent / data.budget.limitAmount) * 100);

    if (pct > 80) {
      insights.push({
        id: "budget-warning",
        type: "warning",
        icon: "💸",
        title: "Atenção ao orçamento!",
        body: `Você gastou ${pct}% do orçamento mensal.`,
        priority: 9,
      });
    } else if (pct < 60) {
      insights.push({
        id: "budget-ok",
        type: "positive",
        icon: "✅",
        title: "Orçamento saudável",
        body: `${pct}% usado no mês — você está no caminho certo.`,
        priority: 5,
      });
    }
  }

  // ── 6. Today's tasks ─────────────────────────────────────────────────────────
  const todayTasks = data.tasks.filter((t) => t.date === todayKey);

  if (todayTasks.length > 0) {
    const completedCount = todayTasks.filter((t) => t.completed).length;
    const totalCount = todayTasks.length;
    const allDone = completedCount === totalCount;

    insights.push({
      id: "tasks-today",
      type: allDone ? "positive" : "info",
      icon: "📋",
      title: allDone ? "Todas as tarefas concluídas!" : "Tarefas de hoje",
      body: `${completedCount}/${totalCount} tarefas concluídas hoje.`,
      priority: allDone ? 7 : 6,
    });
  } else if (isWeekday()) {
    // ── 10. No tasks today on a weekday ──────────────────────────────────────
    insights.push({
      id: "no-tasks-today",
      type: "info",
      icon: "📝",
      title: "Sem tarefas para hoje",
      body: "Você não tem tarefas para hoje. Que tal planejar seu dia?",
      priority: 3,
    });
  }

  // ── 7 & 8. Weekly mood average ───────────────────────────────────────────────
  const avgMood = weeklyAvgMood(data.moodEntries);

  if (avgMood !== null) {
    if (avgMood >= 4) {
      insights.push({
        id: "mood-high",
        type: "positive",
        icon: "😊",
        title: "Humor ótimo esta semana!",
        body: `Média de humor ${avgMood} esta semana — continue assim!`,
        priority: 7,
      });
    } else if (avgMood <= 2) {
      insights.push({
        id: "mood-low",
        type: "warning",
        icon: "😔",
        title: "Humor baixo esta semana",
        body: "Humor baixo esta semana — cuide-se e descanse bem.",
        priority: 8,
      });
    }
  }

  // ── 9. Top spending category ─────────────────────────────────────────────────
  const top = topSpendingCategory(data.transactions);
  if (top) {
    insights.push({
      id: "top-category",
      type: "info",
      icon: "📊",
      title: "Maior gasto do mês",
      body: `${top.category} — R$${top.amount.toFixed(2).replace(".", ",")}`,
      priority: 4,
    });
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  if (insights.length === 0) {
    insights.push({
      id: "fallback",
      type: "positive",
      icon: "🌟",
      title: "Tudo em ordem!",
      body: "Mantenha o ritmo — você está indo muito bem.",
      priority: 1,
    });
  }

  // Sort by priority descending, return top 5
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
