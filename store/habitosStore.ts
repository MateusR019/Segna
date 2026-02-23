import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subDays, format } from "date-fns";
import { Habit, CompletionMap, HabitFrequencyGoal, HabitNote } from "@/types";

interface HabitosState {
  habits: Habit[];
  completions: CompletionMap;
  frequencyGoals: HabitFrequencyGoal[];
  habitNotes: HabitNote[];

  addHabit: (h: Omit<Habit, "id" | "createdAt">) => void;
  removeHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  setFrequencyGoal: (habitId: string, timesPerWeek: number) => void;
  removeFrequencyGoal: (habitId: string) => void;
  setHabitNote: (habitId: string, date: string, text: string) => void;
  removeHabitNote: (habitId: string, date: string) => void;
}

export const useHabitosStore = create<HabitosState>()(
  persist(
    (set) => ({
      habits: [],
      completions: {},
      frequencyGoals: [],
      habitNotes: [],

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

      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          completions: Object.fromEntries(
            Object.entries(state.completions).map(([date, ids]) => [
              date,
              ids.filter((hId) => hId !== id),
            ])
          ),
          habitNotes: state.habitNotes.filter((n) => n.habitId !== id),
        })),

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
