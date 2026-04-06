"use client";
import { useState, useRef } from "react";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { Button } from "@/components/ui/button";
import { Flame, Trash2, GripVertical, Check, X, Ban, Minus, Plus, Pencil } from "lucide-react";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/useToast";
import { HabitNoteInline } from "./HabitNoteInline";
import { HabitBestStreakBadge } from "./HabitBestStreakBadge";
import { EditHabitDialog } from "./EditHabitDialog";
import Link from "next/link";
import { Habit } from "@/types";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );
}

export function HabitosDailyChecklist() {
  const {
    habits,
    completions,
    counts,
    frequencyGoals,
    toggleCompletion,
    removeHabit,
    reorderHabits,
    incrementCount,
    decrementCount,
  } = useHabitosStore();
  const last7Days = getLast7Days();
  const { success } = useToast();
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const completedIds = completions[todayKey] ?? [];

  // Drag-and-drop state
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Bounce animation trigger
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  // Edit habit dialog
  const [editHabit, setEditHabit] = useState<Habit | null>(null);

  // Filter: skip paused; filter by weekDay
  const todayWeekDay = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const sorted = [...habits]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((h) => !h.paused)
    .filter(
      (h) =>
        !h.weekDays || h.weekDays.length === 0 || h.weekDays.includes(todayWeekDay)
    );

  function onDragStart(id: string) {
    dragId.current = id;
  }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }
    const ids = sorted.map((h) => h.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(targetId);
    const newIds = [...ids];
    newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, fromId);
    reorderHabits(newIds);
    setDragOverId(null);
    dragId.current = null;
  }
  function onDragEnd() {
    setDragOverId(null);
    dragId.current = null;
  }

  if (habits.filter((h) => !h.paused).length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center space-y-2">
        <p className="text-sm text-[#4a4a4a]">{t("noHabitsCreated")}</p>
        <p className="text-xs text-[#3a3a3a]">{t("clickNewHabitHint")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {sorted.map((habit, idx) => {
          const done = completedIds.includes(habit.id);
          const streak = calcStreak(habit.id, completions);
          const isDragTarget = dragOverId === habit.id;
          const isCounter = (habit.targetCount ?? 1) > 1;
          const isNegative = habit.negative ?? false;
          const currentCount = counts[todayKey]?.[habit.id] ?? 0;
          const target = habit.targetCount ?? 1;
          // Weekly goal badge
          const freqGoal = frequencyGoals.find((g) => g.habitId === habit.id);
          const doneThisWeek = freqGoal
            ? last7Days.filter((d) => (completions[d] ?? []).includes(habit.id)).length
            : 0;
          const weekGoalAchieved = freqGoal ? doneThisWeek >= freqGoal.timesPerWeek : false;

          // Card border / background
          let cardClass =
            "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1f1f1f]";
          if (isDragTarget) cardClass = "border-[#6366f1]/60";
          else if (done) cardClass = "border-[#22c55e]/25 bg-[#22c55e]/5";
          else if (isNegative)
            cardClass = "border-[#ef4444]/25 hover:border-[#ef4444]/45";

          return (
            <div
              key={habit.id}
              draggable
              onDragStart={() => onDragStart(habit.id)}
              onDragOver={(e) => onDragOver(e, habit.id)}
              onDrop={(e) => onDrop(e, habit.id)}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (isCounter) {
                  if (currentCount < target) {
                    incrementCount(habit.id, todayKey);
                    const next = currentCount + 1;
                    if (next >= target) {
                      success(`${habit.name} ✓`);
                      setBouncingId(habit.id);
                      setTimeout(() => setBouncingId(null), 320);
                    } else {
                      success(`${habit.name}: ${next}/${target}`);
                    }
                  }
                  return;
                }
                const wasDone = completedIds.includes(habit.id);
                toggleCompletion(habit.id, todayKey);
                if (isNegative) {
                  success(wasDone ? "Hábito desmarcado" : `${habit.name} — evitado! ✓`);
                } else {
                  success(wasDone ? "Hábito desmarcado" : `${habit.name} ✓`);
                }
                setBouncingId(habit.id);
                setTimeout(() => setBouncingId(null), 320);
              }}
              className={`list-item relative bg-[#1a1a1a] border rounded-xl overflow-hidden transition-all cursor-pointer select-none ${cardClass}`}
              style={{ animationDelay: `${Math.min(idx * 35, 280)}ms` }}
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                style={{
                  background:
                    done
                      ? "#22c55e"
                      : isNegative && !done
                      ? "#ef4444"
                      : habit.color,
                }}
              />

              <div className="flex items-center justify-between px-3 py-3 gap-2 pl-4">
                {/* Drag handle */}
                <div
                  className="flex-shrink-0 text-[#2a2a2a] hover:text-[#4a4a4a] cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={14} />
                </div>

                {/* Checkbox OR Counter */}
                {isCounter ? (
                  <div
                    className="flex items-center gap-1 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => decrementCount(habit.id, todayKey)}
                      disabled={currentCount <= 0}
                      aria-label="Decrementar contagem"
                      className="w-5 h-5 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-20 transition-colors cursor-pointer"
                    >
                      <Minus size={10} />
                    </button>
                    <span
                      className={`text-xs font-semibold w-10 text-center tabular-nums ${
                        done ? "text-[#22c55e]" : "text-[#9ca3af]"
                      } ${bouncingId === habit.id ? "check-bounce" : ""}`}
                    >
                      {currentCount}/{target}
                    </span>
                    <button
                      onClick={() => {
                        incrementCount(habit.id, todayKey);
                        const next = currentCount + 1;
                        if (next >= target) {
                          success(`${habit.name} ✓`);
                          setBouncingId(habit.id);
                          setTimeout(() => setBouncingId(null), 320);
                        }
                      }}
                      disabled={currentCount >= target}
                      aria-label="Incrementar contagem"
                      className="w-5 h-5 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-20 transition-colors cursor-pointer"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      done
                        ? "border-[#22c55e] bg-[#22c55e]"
                        : isNegative
                        ? "border-[#ef4444]/50"
                        : "border-[#3a3a3a]"
                    } ${bouncingId === habit.id ? "check-bounce" : ""}`}
                  >
                    {done && (
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {!done && isNegative && (
                      <div className="w-2 h-2 rounded-full bg-[#ef4444]/50" />
                    )}
                  </div>
                )}

                {/* Name + tag + note */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isNegative && (
                      <Ban
                        size={11}
                        className={
                          done ? "text-[#22c55e]" : "text-[#ef4444]/70"
                        }
                      />
                    )}
                    <Link
                      href={`/habitos/${habit.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-sm font-medium transition-colors hover:underline underline-offset-2 ${
                        done
                          ? "text-[#6b7280] line-through"
                          : "text-white hover:text-[#a78bfa]"
                      }`}
                    >
                      {habit.name}
                    </Link>
                    {habit.tag && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2a2a2a] text-[#6b7280] capitalize">
                        {habit.tag}
                      </span>
                    )}
                    {freqGoal && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums"
                        style={{
                          background: weekGoalAchieved ? "#22c55e18" : "#2a2a2a",
                          color: weekGoalAchieved ? "#22c55e" : "#6b7280",
                        }}
                      >
                        {doneThisWeek}/{freqGoal.timesPerWeek}x
                      </span>
                    )}
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <HabitNoteInline habitId={habit.id} />
                  </div>
                </div>

                {/* Right: streak + edit + delete */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {streak > 0 && confirmDeleteId !== habit.id && (() => {
                    const streakAtRisk = !done && !isNegative;
                    return (
                      <div className="flex flex-col items-center gap-0.5 mr-1">
                        <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                          streakAtRisk ? "text-[#f97316] animate-pulse" : "text-[#f59e0b]"
                        }`}>
                          <Flame size={12} />
                          <span>{streak}</span>
                        </div>
                        {streakAtRisk ? (
                          <span className="text-[9px] text-[#f97316] font-medium leading-none">
                            em risco
                          </span>
                        ) : (
                          <HabitBestStreakBadge
                            habitId={habit.id}
                            completions={completions}
                            currentStreak={streak}
                          />
                        )}
                      </div>
                    );
                  })()}

                  {confirmDeleteId === habit.id ? (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-[#ef4444] mr-1">Excluir?</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHabit(habit.id);
                          success("Hábito removido");
                        }}
                        className="h-7 w-7 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer"
                      >
                        <Check size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 w-7 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
                      >
                        <X size={13} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditHabit(habit);
                        }}
                        className="h-8 w-8 text-[#3a3a3a] hover:text-[#a78bfa] hover:bg-transparent cursor-pointer"
                      >
                        <Pencil size={12} />
                      </Button>
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(habit.id);
                        }}
                        className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit dialog */}
      {editHabit && (
        <EditHabitDialog
          habit={editHabit}
          open={!!editHabit}
          onClose={() => setEditHabit(null)}
        />
      )}
    </>
  );
}
