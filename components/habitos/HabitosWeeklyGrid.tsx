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
      label: format(d, "EEE", { locale: ptBR }),
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
          /* overflow-x-auto: scroll horizontal no mobile */
          <div className="overflow-x-auto -mx-1">
            <div className="space-y-2 min-w-max px-1">
              {/* Day labels row */}
              <div className="flex items-center gap-1.5">
                <div className="w-24 flex-shrink-0" />
                {days.map((d) => {
                  const isToday = d.date === format(new Date(), "yyyy-MM-dd");
                  return (
                    <div
                      key={d.date}
                      className={`w-9 flex-shrink-0 text-center text-[10px] capitalize font-medium ${
                        isToday ? "text-[#a78bfa]" : "text-[#4a4a4a]"
                      }`}
                    >
                      {d.label.slice(0, 3)}
                    </div>
                  );
                })}
              </div>

              {/* Habit rows */}
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center gap-1.5">
                  <div className="w-24 flex-shrink-0 flex items-center gap-1.5 pr-1">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: habit.color }} />
                    <span className="text-xs text-[#9ca3af] truncate">{habit.name}</span>
                  </div>
                  {days.map((day) => {
                    const done = (completions[day.date] ?? []).includes(habit.id);
                    const isToday = day.date === format(new Date(), "yyyy-MM-dd");
                    return (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-9 h-9 flex-shrink-0 rounded-lg transition-all ${
                              isToday ? "ring-1 ring-[#3a3a3a]" : ""
                            }`}
                            style={{
                              background: done ? habit.color : "#1f1f1f",
                              opacity: done ? 1 : 0.7,
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
