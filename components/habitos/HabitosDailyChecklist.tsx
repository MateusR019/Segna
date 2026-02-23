"use client";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function HabitosDailyChecklist() {
  const { habits, completions, toggleCompletion, removeHabit } =
    useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const completedIds = completions[todayKey] ?? [];

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 text-[#6b7280] text-sm">
        Nenhum hábito criado ainda. Crie seu primeiro hábito!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => {
        const done = completedIds.includes(habit.id);
        const streak = calcStreak(habit.id, completions);

        return (
          <Card
            key={habit.id}
            className={`bg-[#1a1a1a] border transition-colors cursor-pointer select-none ${
              done ? "border-[#22c55e]/30" : "border-[#2a2a2a] hover:border-[#3a3a3a]"
            }`}
            onClick={() => toggleCompletion(habit.id, todayKey)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    done
                      ? "border-[#22c55e] bg-[#22c55e]"
                      : "border-[#3a3a3a]"
                  }`}
                >
                  {done && (
                    <svg
                      viewBox="0 0 12 12"
                      width="10"
                      height="10"
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
                    done ? "text-[#6b7280] line-through" : "text-white"
                  }`}
                >
                  {habit.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[#f59e0b]">
                    <Flame size={12} />
                    <span>{streak}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeHabit(habit.id);
                  }}
                  className="h-7 w-7 text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
