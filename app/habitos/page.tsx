"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { HabitosDayProgress } from "@/components/habitos/HabitosDayProgress";
import { HabitosDailyChecklist } from "@/components/habitos/HabitosDailyChecklist";
import { HabitosWeeklyGrid } from "@/components/habitos/HabitosWeeklyGrid";
import { HabitHeatmap } from "@/components/habitos/HabitHeatmap";
import { HabitFrequencyGoals } from "@/components/habitos/HabitFrequencyGoals";
import { HabitAdvancedStats } from "@/components/habitos/HabitAdvancedStats";
import { AddHabitDialog } from "@/components/habitos/AddHabitDialog";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";

export default function HabitosPage() {
  const hydrated = useHydrated();
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("habitosTitle")}</h1>
          <p className="text-sm text-[#6b7280]">{t("habitosDesc")}</p>
        </div>
        <AddHabitDialog />
      </div>

      {hydrated ? (
        <>
          <HabitosDayProgress />
          <HabitosDailyChecklist />
          <HabitFrequencyGoals />
          <HabitosWeeklyGrid />
          <HabitHeatmap />
          <HabitAdvancedStats />
        </>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-16 bg-[#1a1a1a]" />
          <Skeleton className="h-64 bg-[#1a1a1a]" />
          <Skeleton className="h-32 bg-[#1a1a1a]" />
          <Skeleton className="h-48 bg-[#1a1a1a]" />
          <Skeleton className="h-48 bg-[#1a1a1a]" />
        </div>
      )}
    </div>
  );
}
