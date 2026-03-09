import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task, TaskPriority } from "@/types";
import { format, getDay, getDate } from "date-fns";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface TarefasState {
  tasks: Task[];

  addTask: (t: Omit<Task, "id" | "createdAt" | "completed">) => void;
  removeTask: (id: string) => void;
  toggleTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "date">>) => void;
  generateRecurring: (dateStr: string) => void;

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

      generateRecurring: (dateStr: string) => {
        set((state) => {
          // Templates = tasks com recurrence definido e sem generatedFrom
          const templates = state.tasks.filter(
            (t) => t.recurrence && !t.generatedFrom
          );
          const newInstances: Task[] = [];

          for (const tpl of templates) {
            const tplDate = new Date(tpl.createdAt);
            const targetDate = new Date(dateStr + "T12:00:00");

            // Verifica se já existe instância para esta data
            const alreadyExists = state.tasks.some(
              (t) => t.generatedFrom === tpl.id && t.date === dateStr
            );
            if (alreadyExists) continue;

            // Verifica se o dia corresponde à recorrência
            let shouldGenerate = false;
            if (tpl.recurrence === "daily") {
              shouldGenerate = true;
            } else if (tpl.recurrence === "weekly") {
              shouldGenerate = getDay(targetDate) === getDay(tplDate);
            } else if (tpl.recurrence === "monthly") {
              shouldGenerate = getDate(targetDate) === getDate(tplDate);
            }

            if (shouldGenerate) {
              newInstances.push({
                ...tpl,
                id: crypto.randomUUID(),
                date: dateStr,
                completed: false,
                completedAt: undefined,
                createdAt: new Date().toISOString(),
                recurrence: undefined,
                generatedFrom: tpl.id,
              });
            }
          }

          if (newInstances.length === 0) return state;
          return { tasks: [...state.tasks, ...newInstances] };
        });
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

/** Tarefas do dia (YYYY-MM-DD) — exclui templates de recorrência */
export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.date === date && !t.recurrence);
}

/** Tarefas do dia de hoje */
export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksForDate(tasks, format(new Date(), "yyyy-MM-dd"));
}

/** Tarefas de dias anteriores não concluídas (backlog) */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = format(new Date(), "yyyy-MM-dd");
  return tasks
    .filter((t) => t.date < today && !t.completed && !t.recurrence)
    .sort((a, b) => a.date.localeCompare(b.date)); // mais antigas primeiro
}

/** Quantos dias em atraso */
export function daysOverdue(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dateStr + "T00:00:00");
  return Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
}

/** % de conclusão de um array de tarefas */
export function calcCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}
