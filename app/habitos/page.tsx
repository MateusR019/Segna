"use client";
import { motion } from "framer-motion";
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

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: "easeOut" as const, delay },
});

export default function HabitosPage() {
  const hydrated = useHydrated();
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);

  return (
    <div className="space-y-5">
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("habitosTitle")}</h1>
          <p className="text-sm text-[#6b7280]">{t("habitosDesc")}</p>
        </div>
        <AddHabitDialog />
      </motion.div>

      {hydrated ? (
        <>
          <motion.div {...fade(0.05)}><HabitosDayProgress /></motion.div>
          <motion.div {...fade(0.1)}><HabitosDailyChecklist /></motion.div>
          <motion.div {...fade(0.15)}><HabitFrequencyGoals /></motion.div>
          <motion.div {...fade(0.2)}><HabitosWeeklyGrid /></motion.div>
          <motion.div {...fade(0.25)}><HabitHeatmap /></motion.div>
          <motion.div {...fade(0.3)}><HabitAdvancedStats /></motion.div>
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
