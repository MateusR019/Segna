"use client";
import { useHabitosStore } from "@/store/habitosStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { subDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, "yyyy-MM-dd"),
      // single uppercase letter: S T Q Q S S D
      label: format(d, "EEEEE", { locale: ptBR }).toUpperCase(),
    };
  });
}

export function HabitosWeeklyGrid() {
  const { habits, completions } = useHabitosStore();
  const days = getLast7Days();

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Histórico da Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {habits.length === 0 ? (
          <p className="text-center text-sm text-[#6b7280] py-6">
            Nenhum hábito criado ainda
          </p>
        ) : (
          <div className="space-y-1.5">
            {/* Day labels row */}
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0" />
              {days.map((d) => {
                const isToday = d.date === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={d.date}
                    className={`w-7 flex-shrink-0 text-center text-[10px] font-semibold ${
                      isToday ? "text-[#a78bfa]" : "text-[#4a4a4a]"
                    }`}
                  >
                    {d.label}
                  </div>
                );
              })}
            </div>

            {/* Habit rows */}
            {habits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-1">
                {/* Habit name — truncates to fill remaining space */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5 pr-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: habit.color }}
                  />
                  <span className="text-xs text-[#9ca3af] truncate">{habit.name}</span>
                </div>

                {/* Day squares */}
                {days.map((day) => {
                  const done = (completions[day.date] ?? []).includes(habit.id);
                  const isToday = day.date === format(new Date(), "yyyy-MM-dd");
                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-7 h-7 flex-shrink-0 rounded-md transition-all ${
                            isToday ? "ring-1 ring-[#3a3a3a]" : ""
                          }`}
                          style={{
                            background: done ? habit.color : "#1f1f1f",
                            opacity: done ? 1 : 0.6,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                        {format(parseISO(day.date), "EEE, d MMM", { locale: ptBR })}
                        {" — "}{done ? "✓ completo" : "não realizado"}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
