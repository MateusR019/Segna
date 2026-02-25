import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subDays, format } from "date-fns";
import { Habit, CompletionMap, HabitFrequencyGoal, HabitNote, HabitTemplate, HabitAnnotation, WeekDayIndex } from "@/types";

// counts[date][habitId] = count (for targetCount > 1 habits)
type CountMap = Record<string, Record<string, number>>;

interface HabitosState {
  habits: Habit[];
  completions: CompletionMap;
  counts: CountMap;
  frequencyGoals: HabitFrequencyGoal[];
  habitNotes: HabitNote[];
  workoutSchedule: Record<string, Partial<Record<WeekDayIndex, string>>>;
  annotations: Record<string, HabitAnnotation[]>;

  addHabit: (h: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>) => void;
  removeHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  incrementCount: (habitId: string, date: string) => void;
  decrementCount: (habitId: string, date: string) => void;
  setFrequencyGoal: (habitId: string, timesPerWeek: number) => void;
  removeFrequencyGoal: (habitId: string) => void;
  setHabitNote: (habitId: string, date: string, text: string) => void;
  removeHabitNote: (habitId: string, date: string) => void;
  // Habit detail actions
  setTemplate: (habitId: string, template: HabitTemplate) => void;
  setWorkoutDay: (habitId: string, day: WeekDayIndex, text: string) => void;
  addAnnotation: (habitId: string, annotation: Omit<HabitAnnotation, "id" | "createdAt">) => void;
  removeAnnotation: (habitId: string, annotationId: string) => void;
}

export const useHabitosStore = create<HabitosState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      counts: {},
      frequencyGoals: [],
      habitNotes: [],
      workoutSchedule: {},
      annotations: {},

      addHabit: (h) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...h,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              order: state.habits.length,
            },
          ],
        })),

      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),

      removeHabit: (id) =>
        set((state) => {
          const { [id]: _ws, ...restWs } = state.workoutSchedule;
          const { [id]: _an, ...restAn } = state.annotations;
          // remove counts for this habit in all dates
          const newCounts: CountMap = {};
          for (const [date, dayMap] of Object.entries(state.counts)) {
            const { [id]: _c, ...restC } = dayMap;
            newCounts[date] = restC;
          }
          return {
            habits: state.habits.filter((h) => h.id !== id),
            completions: Object.fromEntries(
              Object.entries(state.completions).map(([date, ids]) => [
                date,
                ids.filter((hId) => hId !== id),
              ])
            ),
            counts: newCounts,
            habitNotes: state.habitNotes.filter((n) => n.habitId !== id),
            workoutSchedule: restWs,
            annotations: restAn,
          };
        }),

      reorderHabits: (orderedIds) =>
        set((state) => ({
          habits: orderedIds
            .map((id, index) => {
              const h = state.habits.find((h) => h.id === id);
              return h ? { ...h, order: index } : null;
            })
            .filter(Boolean) as Habit[],
        })),

      toggleCompletion: (habitId, date) =>
        set((state) => {
          const current = state.completions[date] ?? [];
          const updated = current.includes(habitId)
            ? current.filter((id) => id !== habitId)
            : [...current, habitId];
          return { completions: { ...state.completions, [date]: updated } };
        }),

      incrementCount: (habitId, date) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === habitId);
          const target = habit?.targetCount ?? 1;
          const existing = state.counts[date]?.[habitId] ?? 0;
          const newCount = existing + 1;
          const newCounts: CountMap = {
            ...state.counts,
            [date]: { ...(state.counts[date] ?? {}), [habitId]: newCount },
          };
          // auto-complete when count reaches target
          let newCompletions = state.completions;
          if (newCount >= target) {
            const current = state.completions[date] ?? [];
            if (!current.includes(habitId)) {
              newCompletions = { ...state.completions, [date]: [...current, habitId] };
            }
          }
          return { counts: newCounts, completions: newCompletions };
        }),

      decrementCount: (habitId, date) =>
        set((state) => {
          const habit = state.habits.find((h) => h.id === habitId);
          const target = habit?.targetCount ?? 1;
          const existing = state.counts[date]?.[habitId] ?? 0;
          const newCount = Math.max(0, existing - 1);
          const newCounts: CountMap = {
            ...state.counts,
            [date]: { ...(state.counts[date] ?? {}), [habitId]: newCount },
          };
          // remove from completions if below target
          let newCompletions = state.completions;
          if (newCount < target) {
            newCompletions = {
              ...state.completions,
              [date]: (state.completions[date] ?? []).filter((id) => id !== habitId),
            };
          }
          return { counts: newCounts, completions: newCompletions };
        }),

      setFrequencyGoal: (habitId, timesPerWeek) =>
        set((state) => ({
          frequencyGoals: [
            ...state.frequencyGoals.filter((g) => g.habitId !== habitId),
            { habitId, timesPerWeek },
          ],
        })),

      removeFrequencyGoal: (habitId) =>
        set((state) => ({
          frequencyGoals: state.frequencyGoals.filter((g) => g.habitId !== habitId),
        })),

      setHabitNote: (habitId, date, text) =>
        set((state) => ({
          habitNotes: [
            ...state.habitNotes.filter(
              (n) => !(n.habitId === habitId && n.date === date)
            ),
            ...(text.trim() ? [{ habitId, date, text: text.trim() }] : []),
          ],
        })),

      removeHabitNote: (habitId, date) =>
        set((state) => ({
          habitNotes: state.habitNotes.filter(
            (n) => !(n.habitId === habitId && n.date === date)
          ),
        })),

      setTemplate: (habitId, template) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId ? { ...h, template } : h
          ),
        })),

      setWorkoutDay: (habitId, day, text) =>
        set((state) => {
          const existing = state.workoutSchedule[habitId] ?? {};
          const updated = text.trim()
            ? { ...existing, [day]: text.trim() }
            : Object.fromEntries(
                Object.entries(existing).filter(([k]) => k !== String(day))
              );
          return {
            workoutSchedule: { ...state.workoutSchedule, [habitId]: updated },
          };
        }),

      addAnnotation: (habitId, annotation) =>
        set((state) => ({
          annotations: {
            ...state.annotations,
            [habitId]: [
              {
                ...annotation,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
              },
              ...(state.annotations[habitId] ?? []),
            ],
          },
        })),

      removeAnnotation: (habitId, annotationId) =>
        set((state) => ({
          annotations: {
            ...state.annotations,
            [habitId]: (state.annotations[habitId] ?? []).filter(
              (a) => a.id !== annotationId
            ),
          },
        })),
    }),
    {
      name: "segna-habitos",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function calcStreak(habitId: string, completions: CompletionMap): number {
  let streak = 0;
  let date = new Date();
  const todayKey = format(date, "yyyy-MM-dd");
  if (!(completions[todayKey] ?? []).includes(habitId)) {
    date = subDays(date, 1);
  }
  while (true) {
    const key = format(date, "yyyy-MM-dd");
    if ((completions[key] ?? []).includes(habitId)) {
      streak++;
      date = subDays(date, 1);
    } else {
      break;
    }
  }
  return streak;
}

export function calcBestStreak(habitId: string, completions: CompletionMap): number {
  const allDates = Object.keys(completions)
    .filter((d) => (completions[d] ?? []).includes(habitId))
    .sort();
  if (allDates.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < allDates.length; i++) {
    const prev = new Date(allDates[i - 1]);
    const curr = new Date(allDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}
