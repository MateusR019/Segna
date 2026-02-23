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
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Histórico da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        {habits.length === 0 ? (
          <p className="text-center text-sm text-[#6b7280] py-6">
            Nenhum hábito criado ainda
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: "400px" }}>
              {/* Day labels row */}
              <div
                className="grid mb-3"
                style={{
                  gridTemplateColumns: `140px repeat(7, 1fr)`,
                }}
              >
                <div />
                {days.map((d) => (
                  <div
                    key={d.date}
                    className="text-center text-xs text-[#6b7280] capitalize"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              {/* Habit rows */}
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="grid items-center"
                    style={{ gridTemplateColumns: `140px repeat(7, 1fr)` }}
                  >
                    <span className="text-xs text-[#9ca3af] truncate pr-3">
                      {habit.name}
                    </span>
                    {days.map((day) => {
                      const done = (
                        completions[day.date] ?? []
                      ).includes(habit.id);
                      return (
                        <Tooltip key={day.date}>
                          <TooltipTrigger asChild>
                            <div className="flex justify-center">
                              <div
                                className="w-5 h-5 rounded-sm transition-colors"
                                style={{
                                  background: done ? habit.color : "#2a2a2a",
                                }}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                            {format(parseISO(day.date), "d MMM", {
                              locale: ptBR,
                            })}{" "}
                            — {done ? "completo" : "não realizado"}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
