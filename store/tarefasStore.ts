import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task, TaskPriority } from "@/types";
import { format } from "date-fns";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface TarefasState {
  tasks: Task[];

  addTask: (t: Omit<Task, "id" | "createdAt" | "completed">) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "date">>) => void;

  loadFromDB: () => Promise<void>;
}

// ─── Sync helper ────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useTarefasStore.getState();
    saveStoreData("tarefas", { tasks: s.tasks });
  }, 1000);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useTarefasStore = create<TarefasState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (t) => {
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...t,
              id: crypto.randomUUID(),
              completed: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        scheduleSync();
      },

      removeTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        scheduleSync();
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        }));
        scheduleSync();
      },

      editTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        scheduleSync();
      },

      loadFromDB: async () => {
        const data = await loadStoreData("tarefas");
        if (!data) return;
        set({ tasks: (data.tasks as Task[]) ?? [] });
      },
    }),
    {
      name: "segna-tarefas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Helpers exportados ──────────────────────────────────────────────────────

/** Tarefas do dia (YYYY-MM-DD) */
export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.date === date);
}

/** Tarefas do dia de hoje */
export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksForDate(tasks, format(new Date(), "yyyy-MM-dd"));
}

/** % de conclusão de um array de tarefas */
export function calcCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}
