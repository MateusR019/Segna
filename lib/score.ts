// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreInput {
  habitsCompletedToday: number;
  habitsTotalToday: number;
  tasksCompletedToday: number;
  tasksTotalToday: number;
  monthExpenses: number;
  budgetLimit: number | null;
  moodToday: number | null;
}

export interface ScoreBreakdown {
  habits: number;
  tasks: number;
  budget: number;
  mood: number;
  total: number;
}

// ─── Core calculation ─────────────────────────────────────────────────────────

export function calcDailyScore(input: ScoreInput): ScoreBreakdown {
  const {
    habitsCompletedToday,
    habitsTotalToday,
    tasksCompletedToday,
    tasksTotalToday,
    monthExpenses,
    budgetLimit,
    moodToday,
  } = input;

  // Habits: 40 pts
  const habits =
    habitsTotalToday === 0
      ? 40
      : Math.round((habitsCompletedToday / habitsTotalToday) * 40);

  // Tasks: 25 pts
  const tasks =
    tasksTotalToday === 0
      ? 25
      : Math.round((tasksCompletedToday / tasksTotalToday) * 25);

  // Budget: 20 pts
  let budget: number;
  if (budgetLimit === null || budgetLimit <= 0) {
    budget = 20;
  } else {
    const ratio = monthExpenses / budgetLimit;
    if (ratio <= 0.8) {
      budget = 20;
    } else if (ratio <= 1.0) {
      budget = 10;
    } else {
      budget = 0;
    }
  }

  // Mood: 15 pts
  const mood =
    moodToday === null
      ? 7.5
      : Math.round(((moodToday - 1) / 4) * 15);

  const total = Math.round(habits + tasks + budget + mood);

  return { habits, tasks, budget, mood: Math.round(mood), total };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getScoreColor(score: number): string {
  if (score <= 40) return "#ef4444";
  if (score <= 60) return "#f59e0b";
  if (score <= 80) return "#6366f1";
  return "#22c55e";
}

export function getScoreLabel(score: number): string {
  if (score <= 40) return "Fraco";
  if (score <= 60) return "Regular";
  if (score <= 80) return "Bom";
  return "Excelente";
}

