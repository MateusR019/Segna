"use client";
import { useHabitosStore } from "@/store/habitosStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { subDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function getLast90Days() {
  return Array.from({ length: 90 }, (_, i) => {
    const d = subDays(new Date(), 89 - i);
    return format(d, "yyyy-MM-dd");
  });
}

export function HabitHeatmap() {
  const { habits, completions } = useHabitosStore();
  const days = getLast90Days();

  if (habits.length === 0) return null;

  // Group days into weeks of 7
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Heatmap — últimos 90 dias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: habit.color }} />
              <span className="text-xs text-[#9ca3af]">{habit.name}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const done = (completions[day] ?? []).includes(habit.id);
                    const label = format(parseISO(day), "d MMM", { locale: ptBR });
                    return (
                      <Tooltip key={day}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-3 h-3 rounded-sm cursor-default transition-opacity"
                            style={{
                              background: done ? habit.color : "#2a2a2a",
                              opacity: done ? 1 : 0.5,
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                          {label} — {done ? "✓ feito" : "não feito"}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
