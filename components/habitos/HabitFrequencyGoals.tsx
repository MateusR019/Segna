"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subDays, format } from "date-fns";

function getThisWeekDays(): string[] {
  // Monday to today (or full 7 days)
  return Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));
}

const OPTIONS = [2, 3, 4, 5, 6, 7];

export function HabitFrequencyGoals() {
  const { habits, completions, frequencyGoals, setFrequencyGoal, removeFrequencyGoal } =
    useHabitosStore();
  const [setting, setSetting] = useState<string | null>(null); // habitId being configured

  const weekDays = getThisWeekDays();

  if (habits.length === 0) return null;

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Metas semanais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {habits.map((habit) => {
          const goal = frequencyGoals.find((g) => g.habitId === habit.id);
          const doneThisWeek = weekDays.filter((d) =>
            (completions[d] ?? []).includes(habit.id)
          ).length;
          const target = goal?.timesPerWeek ?? null;
          const pct = target ? Math.min((doneThisWeek / target) * 100, 100) : 0;
          const achieved = target !== null && doneThisWeek >= target;

          return (
            <div key={habit.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: habit.color }} />
                  <span className="text-xs text-white">{habit.name}</span>
                </div>

                {setting === habit.id ? (
                  <div className="flex items-center gap-1">
                    {OPTIONS.map((n) => (
                      <button
                        key={n}
                        onClick={() => { setFrequencyGoal(habit.id, n); setSetting(null); }}
                        className="w-6 h-6 text-xs rounded flex items-center justify-center transition-colors cursor-pointer hover:bg-[#2a2a2a] text-[#9ca3af] hover:text-white"
                      >
                        {n}x
                      </button>
                    ))}
                    {goal && (
                      <button
                        onClick={() => { removeFrequencyGoal(habit.id); setSetting(null); }}
                        className="text-xs text-[#ef4444] hover:text-[#dc2626] cursor-pointer px-1"
                      >
                        —
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSetting(habit.id)}
                    className="text-xs cursor-pointer transition-colors"
                    style={{ color: target ? (achieved ? "#22c55e" : "#6b7280") : "#3a3a3a" }}
                  >
                    {target
                      ? `${doneThisWeek}/${target}x semana`
                      : "Definir meta"}
                  </button>
                )}
              </div>

              {target && (
                <div className="h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: achieved ? "#22c55e" : habit.color,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
