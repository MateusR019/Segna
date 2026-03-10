import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkoutSession } from "@/types";
import { loadStoreData, saveStoreData } from "@/lib/db";

// ─── Sync ────────────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const { sessions } = useWorkoutStore.getState();
    saveStoreData("treino", { sessions });
  }, 1000);
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface WorkoutState {
  sessions: WorkoutSession[];

  // Session CRUD
  addSession:         (date: string, name?: string) => string;
  updateSession:      (id: string, updates: Partial<Pick<WorkoutSession, "name" | "duration" | "note" | "date">>) => void;
  removeSession:      (id: string) => void;

  // Exercise CRUD
  addExercise:        (sessionId: string, name: string) => void;
  updateExerciseName: (sessionId: string, exerciseId: string, name: string) => void;
  removeExercise:     (sessionId: string, exerciseId: string) => void;

  // Set CRUD
  addSet:             (sessionId: string, exerciseId: string) => void;
  updateSet:          (sessionId: string, exerciseId: string, setId: string, reps: number, weight?: number) => void;
  toggleSetDone:      (sessionId: string, exerciseId: string, setId: string) => void;
  removeSet:          (sessionId: string, exerciseId: string, setId: string) => void;

  // Supabase sync
  loadFromDB:         () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapSession(
  sessions: WorkoutSession[],
  sessionId: string,
  fn: (s: WorkoutSession) => WorkoutSession
): WorkoutSession[] {
  return sessions.map((s) => (s.id === sessionId ? fn(s) : s));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      sessions: [],

      // ── Sessions ────────────────────────────────────────────────────────────

      addSession: (date, name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          sessions: [
            {
              id,
              date,
              name,
              exercises: [],
              createdAt: new Date().toISOString(),
            },
            ...state.sessions,
          ],
        }));
        scheduleSync();
        return id;
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: mapSession(state.sessions, id, (s) => ({ ...s, ...updates })),
        }));
        scheduleSync();
      },

      removeSession: (id) => {
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }));
        scheduleSync();
      },

      // ── Exercises ───────────────────────────────────────────────────────────

      addExercise: (sessionId, name) => {
        const exerciseId = crypto.randomUUID();
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: [...s.exercises, { id: exerciseId, name, sets: [] }],
          })),
        }));
        scheduleSync();
      },

      updateExerciseName: (sessionId, exerciseId, name) => {
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) =>
              e.id === exerciseId ? { ...e, name } : e
            ),
          })),
        }));
        scheduleSync();
      },

      removeExercise: (sessionId, exerciseId) => {
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.filter((e) => e.id !== exerciseId),
          })),
        }));
        scheduleSync();
      },

      // ── Sets ────────────────────────────────────────────────────────────────

      addSet: (sessionId, exerciseId) => {
        // Pre-fill with the last set's reps/weight for convenience
        const session = get().sessions.find((s) => s.id === sessionId);
        const exercise = session?.exercises.find((e) => e.id === exerciseId);
        const lastSet = exercise?.sets[exercise.sets.length - 1];

        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) =>
              e.id === exerciseId
                ? {
                    ...e,
                    sets: [
                      ...e.sets,
                      {
                        id: crypto.randomUUID(),
                        reps: lastSet?.reps ?? 0,
                        weight: lastSet?.weight,
                        done: false,
                      },
                    ],
                  }
                : e
            ),
          })),
        }));
        scheduleSync();
      },

      updateSet: (sessionId, exerciseId, setId, reps, weight) => {
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) =>
              e.id === exerciseId
                ? {
                    ...e,
                    sets: e.sets.map((st) =>
                      st.id === setId ? { ...st, reps, weight } : st
                    ),
                  }
                : e
            ),
          })),
        }));
        scheduleSync();
      },

      toggleSetDone: (sessionId, exerciseId, setId) => {
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) =>
              e.id === exerciseId
                ? {
                    ...e,
                    sets: e.sets.map((st) =>
                      st.id === setId ? { ...st, done: !st.done } : st
                    ),
                  }
                : e
            ),
          })),
        }));
        scheduleSync();
      },

      removeSet: (sessionId, exerciseId, setId) => {
        set((state) => ({
          sessions: mapSession(state.sessions, sessionId, (s) => ({
            ...s,
            exercises: s.exercises.map((e) =>
              e.id === exerciseId
                ? { ...e, sets: e.sets.filter((st) => st.id !== setId) }
                : e
            ),
          })),
        }));
        scheduleSync();
      },

      // ── Supabase ────────────────────────────────────────────────────────────

      loadFromDB: async () => {
        const data = await loadStoreData("treino");
        if (!data) return;
        set({
          sessions: (data.sessions as WorkoutSession[]) ?? [],
        });
      },
    }),
    {
      name: "segna-treino",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
