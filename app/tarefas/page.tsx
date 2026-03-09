"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Check, X, ClipboardList, RefreshCcw, Clock } from "lucide-react";
import { useTarefasStore, getTodayTasks, getOverdueTasks, daysOverdue, calcCompletionRate } from "@/store/tarefasStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskPriority, TaskRecurrence } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

// PRIORITY_LABEL is now built dynamically inside components using t()

const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

// ─── Add Task Form ────────────────────────────────────────────────────────────

interface AddTaskFormProps {
  onClose: () => void;
}

function AddTaskForm({ onClose }: AddTaskFormProps) {
  const addTask = useTarefasStore((s) => s.addTask);
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const PRIORITY_LABEL: Record<TaskPriority, string> = {
    high: t("priorityHigh"),
    medium: t("priorityMedium"),
    low: t("priorityLow"),
  };
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<TaskRecurrence | "">("");
  const [time, setTime] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      date: format(new Date(), "yyyy-MM-dd"),
      ...(recurrence ? { recurrence } : {}),
      ...(time ? { time } : {}),
    });
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-3"
    >
      <div className="space-y-2">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("taskTitle")}
          className="w-full bg-transparent border-b border-[#2a2a2a] pb-1.5 text-sm text-white placeholder-[#4a4a4a] outline-none focus:border-[#6366f1] transition-colors"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("taskDesc")}
          className="w-full bg-transparent border-b border-[#2a2a2a] pb-1.5 text-xs text-[#9ca3af] placeholder-[#3a3a3a] outline-none focus:border-[#4a4a4a] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[#4a4a4a] flex-shrink-0">{t("priority")}</span>
        <div className="flex gap-1.5">
          {PRIORITY_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className="px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer"
              style={
                priority === p
                  ? { background: PRIORITY_COLOR[p] + "22", color: PRIORITY_COLOR[p], borderWidth: 1, borderStyle: "solid", borderColor: PRIORITY_COLOR[p] + "55" }
                  : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
              }
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Horário (opcional) */}
        <div className="flex items-center gap-1.5">
          <Clock size={11} className={time ? "text-[#6366f1]" : "text-[#3a3a3a]"} />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-transparent border border-[#2a2a2a] rounded text-xs text-[#6b7280] px-1.5 py-0.5 outline-none hover:border-[#3a3a3a] focus:border-[#6366f1] transition-colors"
          />
        </div>

        {/* Recorrência */}
        <div className="flex items-center gap-1.5 ml-auto">
          <RefreshCcw size={11} className={recurrence ? "text-[#6366f1]" : "text-[#3a3a3a]"} />
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as TaskRecurrence | "")}
            className="bg-transparent border border-[#2a2a2a] rounded text-xs text-[#6b7280] px-1.5 py-0.5 outline-none cursor-pointer hover:border-[#3a3a3a] focus:border-[#6366f1]"
          >
            <option value="">{t("repeatNone")}</option>
            <option value="daily">{t("repeatDaily")}</option>
            <option value="weekly">{t("repeatWeekly")}</option>
            <option value="monthly">{t("repeatMonthly")}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1f1f1f]">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer"
        >
          {t("cancelBtn")}
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={12} />
          {t("addBtn")}
        </button>
      </div>
    </form>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  id: string;
  title: string;
  description?: string;
  time?: string;
  priority: TaskPriority;
  completed: boolean;
  isRecurring?: boolean;
  daysLate?: number;
  onToggle: () => void;
  onRemove: () => void;
}

function TaskRow({ id, title, description, time, priority, completed, isRecurring, daysLate, onToggle, onRemove }: TaskRowProps) {
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const PRIORITY_LABEL: Record<TaskPriority, string> = {
    high: t("priorityHigh"),
    medium: t("priorityMedium"),
    low: t("priorityLow"),
  };
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`group flex items-start gap-3 py-2.5 border-b border-[#1f1f1f] last:border-0 transition-opacity ${
        completed ? "opacity-60" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
          completed
            ? "bg-[#22c55e] border-[#22c55e]"
            : "border-[#3a3a3a] hover:border-[#6b7280]"
        }`}
        aria-label={completed ? "Marcar como pendente" : "Marcar como concluída"}
      >
        {completed && (
          <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <div
        className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: PRIORITY_COLOR[priority] }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-sm leading-snug ${
              completed ? "line-through text-[#4a4a4a]" : "text-[#e5e5e5]"
            }`}
          >
            {title}
          </span>
          {isRecurring && (
            <RefreshCcw size={10} className="text-[#6366f1] flex-shrink-0" aria-label="Recorrente" />
          )}
        </span>
        {description && (
          <p className="text-xs text-[#4a4a4a] leading-snug line-clamp-1">{description}</p>
        )}
        {time && (
          <span className="flex items-center gap-1 text-[10px] text-[#6b7280] mt-0.5">
            <Clock size={9} />
            {time}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded"
          style={{
            background: PRIORITY_COLOR[priority] + "18",
            color: PRIORITY_COLOR[priority],
          }}
        >
          {PRIORITY_LABEL[priority]}
        </span>
        {daysLate !== undefined && daysLate > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f97316]/15 text-[#f97316]">
            {daysLate}d atraso
          </span>
        )}
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRemove}
              className="text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer"
              aria-label="Confirmar exclusão"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
              aria-label="Cancelar"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer"
            aria-label="Remover tarefa"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TarefasPage() {
  const hydrated = useHydrated();
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const PRIORITY_LABEL: Record<TaskPriority, string> = {
    high: t("priorityHigh"),
    medium: t("priorityMedium"),
    low: t("priorityLow"),
  };
  const tasks = useTarefasStore((s) => s.tasks);
  const toggleTask = useTarefasStore((s) => s.toggleTask);
  const removeTask = useTarefasStore((s) => s.removeTask);
  const generateRecurring = useTarefasStore((s) => s.generateRecurring);

  const [showForm, setShowForm] = useState(false);

  // Gera instâncias de tarefas recorrentes para hoje ao montar
  useEffect(() => {
    if (hydrated) {
      generateRecurring(format(new Date(), "yyyy-MM-dd"));
    }
  }, [hydrated, generateRecurring]);

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const todayTasks = getTodayTasks(tasks);
  const overdueTasks = getOverdueTasks(tasks);
  const completedTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completionRate = calcCompletionRate(todayTasks);

  // Group pending by priority
  const pendingByPriority = PRIORITY_ORDER.reduce<Record<TaskPriority, typeof pendingTasks>>(
    (acc, p) => {
      acc[p] = pendingTasks.filter((t) => t.priority === p);
      return acc;
    },
    { high: [], medium: [], low: [] }
  );

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-[#1a1a1a]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 bg-[#1a1a1a]" />
          ))}
        </div>
        <Skeleton className="h-64 bg-[#1a1a1a]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("tarefasTitle")}</h1>
          <p className="text-sm text-[#6b7280] capitalize">{todayLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex-shrink-0"
        >
          <Plus size={14} />
          {t("addTask")}
        </button>
      </div>

      {/* Inline add form */}
      {showForm && <AddTaskForm onClose={() => setShowForm(false)} />}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-lg font-semibold text-white">{todayTasks.length}</p>
          <p className="text-xs text-[#4a4a4a] mt-0.5">{t("totalDay")}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-lg font-semibold text-[#22c55e]">{completedTasks.length}</p>
          <p className="text-xs text-[#4a4a4a] mt-0.5">{t("completed")}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-lg font-semibold text-[#f59e0b]">{pendingTasks.length}</p>
          <p className="text-xs text-[#4a4a4a] mt-0.5">{t("pending")}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <p className="text-lg font-semibold text-white">{completionRate}%</p>
          <p className="text-xs text-[#4a4a4a] mt-0.5">{t("completion")}</p>
          <div className="mt-2 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completionRate}%`,
                background: completionRate === 100 ? "#22c55e" : "#6366f1",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tarefas atrasadas (backlog) */}
      {overdueTasks.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#f97316]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
            <p className="text-xs font-medium text-[#f97316] uppercase tracking-wide">
              Atrasadas ({overdueTasks.length})
            </p>
          </div>
          <div className="space-y-0">
            {overdueTasks.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                time={task.time}
                priority={task.priority}
                completed={task.completed}
                isRecurring={!!task.generatedFrom}
                daysLate={daysOverdue(task.date)}
                onToggle={() => toggleTask(task.id)}
                onRemove={() => removeTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Task list */}
      {todayTasks.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 sm:p-10 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <ClipboardList size={22} className="text-[#4a4a4a]" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#4a4a4a]">{t("noTasksToday")}</p>
            <p className="text-xs text-[#3a3a3a]">Clique em "Adicionar tarefa" para começar</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending tasks grouped by priority */}
          {pendingTasks.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-3">
                {t("pending")}
              </p>
              <div className="space-y-0">
                {PRIORITY_ORDER.map((priority) => {
                  const group = pendingByPriority[priority];
                  if (group.length === 0) return null;
                  return (
                    <div key={priority}>
                      <div className="flex items-center gap-2 py-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: PRIORITY_COLOR[priority] }}
                        />
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: PRIORITY_COLOR[priority] }}
                        >
                          {PRIORITY_LABEL[priority]}
                        </span>
                      </div>
                      {group.map((task) => (
                        <TaskRow
                          key={task.id}
                          id={task.id}
                          title={task.title}
                          description={task.description}
                          time={task.time}
                          priority={task.priority}
                          completed={task.completed}
                          isRecurring={!!task.generatedFrom}
                          onToggle={() => toggleTask(task.id)}
                          onRemove={() => removeTask(task.id)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-3">
                {t("completed")} ({completedTasks.length})
              </p>
              <div>
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    time={task.time}
                    priority={task.priority}
                    completed={task.completed}
                    isRecurring={!!task.generatedFrom}
                    onToggle={() => toggleTask(task.id)}
                    onRemove={() => removeTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
