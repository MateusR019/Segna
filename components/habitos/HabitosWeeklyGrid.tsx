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
          <div className="space-y-2">
            {/* Day labels row */}
            <div className="grid" style={{ gridTemplateColumns: "1fr repeat(7, 32px)", gap: "4px" }}>
              <div />
              {days.map((d) => (
                <div
                  key={d.date}
                  className="text-center text-[10px] text-[#6b7280] capitalize w-8"
                >
                  {d.label.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            {/* Habit rows */}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="grid items-center"
                style={{ gridTemplateColumns: "1fr repeat(7, 32px)", gap: "4px" }}
              >
                <span className="text-xs text-[#9ca3af] truncate pr-2 min-w-0">
                  {habit.name}
                </span>
                {days.map((day) => {
                  const done = (completions[day.date] ?? []).includes(habit.id);
                  return (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div className="flex justify-center">
                          <div
                            className="w-7 h-7 rounded-md transition-colors"
                            style={{
                              background: done ? habit.color : "#2a2a2a",
                            }}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                        {format(parseISO(day.date), "d MMM", { locale: ptBR })}
                        {" "}— {done ? "completo" : "não realizado"}
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
