"use client";
import { useParams, useRouter } from "next/navigation";
import { useHabitosStore, calcStreak, calcBestStreak } from "@/store/habitosStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowLeft, Flame, Trophy } from "lucide-react";
import { TemplatePills } from "@/components/habitos/detail/TemplatePills";
import { HabitDetailDefault } from "@/components/habitos/detail/HabitDetailDefault";
import { WorkoutSchedule } from "@/components/habitos/detail/WorkoutSchedule";
import { BookTracker } from "@/components/habitos/detail/BookTracker";
import { HabitTemplate } from "@/types";

export default function HabitoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useHydrated();
  const { habits, completions, toggleCompletion, setTemplate } = useHabitosStore();

  const habit = habits.find((h) => h.id === id);
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const streak = habit ? calcStreak(id, completions) : 0;
  const bestStreak = habit ? calcBestStreak(id, completions) : 0;
  const doneToday = (completions[todayKey] ?? []).includes(id);
  const template: HabitTemplate = habit?.template ?? "default";

  if (!hydrated) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-10 w-full bg-[#1a1a1a]" />
        <Skeleton className="h-9 w-48 bg-[#1a1a1a]" />
        <Skeleton className="h-64 w-full bg-[#1a1a1a]" />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-[#6b7280]">Hábito não encontrado.</p>
        <button
          onClick={() => router.push("/habitos")}
          className="text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors cursor-pointer"
        >
          ← Voltar para Hábitos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/habitos")}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#222] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
        </button>

        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: habit.color }}
        />

        <h1 className="text-xl font-semibold text-white flex-1 truncate">
          {habit.name}
        </h1>

        {/* Streak */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-[#f59e0b]">
              <Flame size={14} />
              <span className="text-sm font-semibold">{streak}</span>
            </div>
          )}
          {bestStreak > 1 && streak < bestStreak && (
            <div className="flex items-center gap-1 text-[10px] text-[#4a4a4a]" title={`Melhor: ${bestStreak} dias`}>
              <Trophy size={11} />
              <span>{bestStreak}</span>
            </div>
          )}

          {/* Toggle done today */}
          <button
            onClick={() => toggleCompletion(id, todayKey)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium"
            style={
              doneToday
                ? { background: "#22c55e22", color: "#22c55e", borderColor: "#22c55e44" }
                : { background: "transparent", color: "#6b7280", borderColor: "#2a2a2a" }
            }
          >
            {doneToday ? "✓ Feito hoje" : "Marcar hoje"}
          </button>
        </div>
      </div>

      {/* Template selector */}
      <TemplatePills
        value={template}
        onChange={(t: HabitTemplate) => setTemplate(id, t)}
      />

      {/* Template content */}
      {template === "default" && (
        <HabitDetailDefault habitId={id} habit={habit} />
      )}
      {template === "workout" && (
        <WorkoutSchedule habitId={id} weekDays={habit.weekDays} color={habit.color} />
      )}
      {template === "reading" && (
        <BookTracker habitId={id} />
      )}
    </div>
  );
}
