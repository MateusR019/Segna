"use client";
import { useHabitosStore } from "@/store/habitosStore";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function HabitosDayProgress() {
  const { habits, completions } = useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const completedToday = completions[todayKey]?.length ?? 0;
  const total = habits.length;
  const pct = total === 0 ? 0 : Math.round((completedToday / total) * 100);

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm text-[#9ca3af] capitalize">{todayLabel}</p>
        <span className="text-sm font-medium text-white">
          {completedToday}/{total} hábitos
        </span>
      </div>
      <Progress
        value={pct}
        className="h-1.5 bg-[#2a2a2a] [&>div]:bg-[#22c55e] [&>div]:bar-animated"
      />
      <p className="text-xs text-[#6b7280] mt-2">{pct}% completo hoje</p>
    </div>
  );
}
