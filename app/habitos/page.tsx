"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitosDayProgress } from "@/components/habitos/HabitosDayProgress";
import { HabitosDailyChecklist } from "@/components/habitos/HabitosDailyChecklist";
import { HabitosWeeklyGrid } from "@/components/habitos/HabitosWeeklyGrid";
import { AddHabitDialog } from "@/components/habitos/AddHabitDialog";
import { useHydrated } from "@/hooks/useHydrated";

export default function HabitosPage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Hábitos</h1>
          <p className="text-sm text-[#6b7280]">Rastreamento diário de hábitos</p>
        </div>
        <AddHabitDialog />
      </div>

      {hydrated ? (
        <>
          <HabitosDayProgress />
          <HabitosDailyChecklist />
          <HabitosWeeklyGrid />
        </>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-16 bg-[#1a1a1a]" />
          <Skeleton className="h-64 bg-[#1a1a1a]" />
          <Skeleton className="h-48 bg-[#1a1a1a]" />
        </div>
      )}
    </div>
  );
}
