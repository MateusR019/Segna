import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MoodEntry, MoodLevel } from "@/types";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface MoodState {
  entries: MoodEntry[];

  setMood: (date: string, mood: MoodLevel, note?: string) => void;
  removeMood: (date: string) => void;
  getMoodForDate: (date: string) => MoodEntry | undefined;

  loadFromDB: () => Promise<void>;
}

// ─── Sync helper ────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useMoodStore.getState();
    saveStoreData("mood", { entries: s.entries });
  }, 1000);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],

      setMood: (date, mood, note) => {
        set((state) => {
          const existing = state.entries.find((e) => e.date === date);
          if (existing) {
            return {
              entries: state.entries.map((e) =>
                e.date === date ? { ...e, mood, note } : e
              ),
            };
          }
          return {
            entries: [
              ...state.entries,
              { id: crypto.randomUUID(), date, mood, note, createdAt: new Date().toISOString() },
            ],
          };
        });
        scheduleSync();
      },

      removeMood: (date) => {
        set((state) => ({ entries: state.entries.filter((e) => e.date !== date) }));
        scheduleSync();
      },

      getMoodForDate: (date) => {
        return get().entries.find((e) => e.date === date);
      },

      loadFromDB: async () => {
        const data = await loadStoreData("mood");
        if (!data) return;
        set({ entries: (data.entries as MoodEntry[]) ?? [] });
      },
    }),
    {
      name: "segna-mood",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Ok",
  4: "Bom",
  5: "Ótimo",
};

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄",
};

export const MOOD_COLORS: Record<MoodLevel, string> = {
  1: "#ef4444",
  2: "#f59e0b",
  3: "#6b7280",
  4: "#22c55e",
  5: "#6366f1",
};

/** Média de mood de uma lista de entradas */
export function calcAvgMood(entries: MoodEntry[]): number | null {
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
}
