"use client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useHabitosStore } from "@/store/habitosStore";
import { useFinancasStore, calcTotalExpenses } from "@/store/financasStore";
import { useTarefasStore, getTodayTasks } from "@/store/tarefasStore";
import { useMoodStore } from "@/store/moodStore";
import { calcDailyScore, getScoreColor, getScoreLabel } from "@/lib/score";

// ─── Circular ring SVG ────────────────────────────────────────────────────────

interface RingProps {
  score: number;
  color: string;
  size?: number;
  stroke?: number;
}

function ScoreRing({ score, color, size = 72, stroke = 6 }: RingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = ((score / 100) * circumference);
  const gap = circumference - filled;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2a2a2a"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={circumference / 4}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      {/* Score label */}
      <text
        x={size / 2}
        y={size / 2 - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="16"
        fontWeight="700"
        fontFamily="inherit"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 11}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#6b7280"
        fontSize="8"
        fontFamily="inherit"
      >
        {getScoreLabel(score)}
      </text>
    </svg>
  );
}

// ─── Breakdown bar row ────────────────────────────────────────────────────────

interface BreakdownRowProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function BreakdownRow({ label, value, max, color }: BreakdownRowProps) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[11px] text-[#6b7280] flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-6 text-right text-[11px] font-medium text-[#9ca3af] flex-shrink-0">
        {value}
      </span>
    </div>
  );
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export function DailyScore() {
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const thisMonth = format(today, "yyyy-MM");
  const todayLabel = format(today, "d MMM", { locale: ptBR });

  // Habits
  const { habits, completions } = useHabitosStore();
  const activeHabits = habits.filter((h) => !h.paused);
  const habitsCompletedToday = (completions[todayKey] ?? []).filter((id) =>
    activeHabits.some((h) => h.id === id)
  ).length;
  const habitsTotalToday = activeHabits.length;

  // Tasks
  const allTasks = useTarefasStore((s) => s.tasks);
  const todayTasks = getTodayTasks(allTasks);
  const tasksCompletedToday = todayTasks.filter((t) => t.completed).length;
  const tasksTotalToday = todayTasks.length;

  // Finances
  const transactions = useFinancasStore((s) => s.transactions);
  const budget = useFinancasStore((s) => s.budget);
  const monthTransactions = transactions.filter((t) => t.date.startsWith(thisMonth));
  const monthExpenses = calcTotalExpenses(monthTransactions);
  const budgetLimit = budget?.limitAmount ?? null;

  // Mood
  const getMoodForDate = useMoodStore((s) => s.getMoodForDate);
  const moodEntry = getMoodForDate(todayKey);
  const moodToday = moodEntry?.mood ?? null;

  // Score
  const breakdown = calcDailyScore({
    habitsCompletedToday,
    habitsTotalToday,
    tasksCompletedToday,
    tasksTotalToday,
    monthExpenses,
    budgetLimit,
    moodToday,
  });

  const scoreColor = getScoreColor(breakdown.total);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Score Diário</span>
        <span className="text-[11px] text-[#4a4a4a] capitalize">{todayLabel}</span>
      </div>

      {/* Ring + breakdown */}
      <div className="flex items-center gap-4">
        <ScoreRing score={breakdown.total} color={scoreColor} />

        <div className="flex-1 space-y-2">
          <BreakdownRow label="Hábitos" value={breakdown.habits} max={40} color="#6366f1" />
          <BreakdownRow label="Tarefas" value={breakdown.tasks} max={25} color="#06b6d4" />
          <BreakdownRow label="Orçamento" value={breakdown.budget} max={20} color="#22c55e" />
          <BreakdownRow label="Humor" value={breakdown.mood} max={15} color="#f59e0b" />
        </div>
      </div>

      {/* Total row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
        <span className="text-[11px] text-[#4a4a4a]">Pontuação total</span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: scoreColor }}
        >
          {breakdown.total}
          <span className="text-[#4a4a4a] font-normal">/100</span>
        </span>
      </div>
    </div>
  );
}
