"use client";
import { useState, useRef } from "react";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { HabitNoteInline } from "./HabitNoteInline";
import { HabitBestStreakBadge } from "./HabitBestStreakBadge";

export function HabitosDailyChecklist() {
  const { habits, completions, toggleCompletion, removeHabit, reorderHabits } =
    useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const completedIds = completions[todayKey] ?? [];

  // Drag-and-drop state
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sorted = [...habits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function onDragStart(id: string) { dragId.current = id; }
  function onDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOverId(id);
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) { setDragOverId(null); return; }
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
  function onDragEnd() { setDragOverId(null); dragId.current = null; }

  if (habits.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center space-y-2">
        <p className="text-sm text-[#4a4a4a]">Nenhum hábito criado ainda</p>
        <p className="text-xs text-[#3a3a3a]">Clique em "Novo hábito" para começar a rastrear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((habit) => {
        const done = completedIds.includes(habit.id);
        const streak = calcStreak(habit.id, completions);
        const isDragTarget = dragOverId === habit.id;

        return (
          <div
            key={habit.id}
            draggable
            onDragStart={() => onDragStart(habit.id)}
            onDragOver={(e) => onDragOver(e, habit.id)}
            onDrop={(e) => onDrop(e, habit.id)}
            onDragEnd={onDragEnd}
            onClick={() => toggleCompletion(habit.id, todayKey)}
            className={`relative bg-[#1a1a1a] border rounded-xl overflow-hidden transition-all cursor-pointer select-none ${
              done
                ? "border-[#22c55e]/25 bg-[#22c55e]/5"
                : isDragTarget
                ? "border-[#6366f1]/60"
                : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1d1d1d]"
            }`}
          >
            {/* Habit color left accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
              style={{ background: done ? "#22c55e" : habit.color }}
            />

            <div className="flex items-center justify-between px-3 py-3 gap-2 pl-4">
              {/* Drag handle */}
              <div
                className="flex-shrink-0 text-[#2a2a2a] hover:text-[#4a4a4a] cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={14} />
              </div>

              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  done ? "border-[#22c55e] bg-[#22c55e]" : "border-[#3a3a3a]"
                }`}
              >
                {done && (
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Name + note */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${done ? "text-[#6b7280] line-through" : "text-white"}`}>
                    {habit.name}
                  </span>
                  {habit.tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2a2a2a] text-[#6b7280] capitalize">
                      {habit.tag}
                    </span>
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <HabitNoteInline habitId={habit.id} />
                </div>
              </div>

              {/* Streak + best + delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {streak > 0 && (
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-0.5 text-xs text-[#f59e0b] font-semibold">
                      <Flame size={12} />
                      <span>{streak}</span>
                    </div>
                    <HabitBestStreakBadge habitId={habit.id} completions={completions} currentStreak={streak} />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }}
                  className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
