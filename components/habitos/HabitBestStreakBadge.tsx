"use client";
import { calcBestStreak } from "@/store/habitosStore";
import { CompletionMap } from "@/types";
import { Trophy } from "lucide-react";

interface Props {
  habitId: string;
  completions: CompletionMap;
  currentStreak: number;
}

export function HabitBestStreakBadge({ habitId, completions, currentStreak }: Props) {
  const best = calcBestStreak(habitId, completions);
  if (best <= 1) return null;

  const isCurrentBest = currentStreak >= best;

  return (
    <div
      className="flex items-center gap-0.5 text-[10px]"
      title={`Melhor streak: ${best} dias`}
      style={{ color: isCurrentBest ? "#f59e0b" : "#4a4a4a" }}
    >
      <Trophy size={9} />
      <span>{best}</span>
    </div>
  );
}
