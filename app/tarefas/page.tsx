"use client";
import { useState, useEffect } from "react";
import {
  format, addDays,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, subMonths, addMonths, isToday as dfIsToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Check, X, ClipboardList, RefreshCcw, Clock, Calendar, Tag, ChevronLeft, ChevronRight, LayoutList, CalendarDays, Timer } from "lucide-react";
import { useTarefasStore, getTasksForDate, getOverdueTasks, daysOverdue, calcCompletionRate } from "@/store/tarefasStore";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useSettingsStore } from "@/store/settingsStore";
import { useT, type TranslationKey } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskPriority, TaskRecurrence, TaskTag, CustomTag } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

// PRIORITY_LABEL is now built dynamically inside components using t()

const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

// ─── Tag config ───────────────────────────────────────────────────────────────

const TAG_COLOR: Record<TaskTag, string> = {
  pessoal:  "#6366f1",
  trabalho: "#f59e0b",
  estudos:  "#22c55e",
  negocio:  "#a855f7",
  saude:    "#f43f5e",
  financas: "#14b8a6",
};

const TAG_LABEL_KEY: Record<TaskTag, TranslationKey> = {
  pessoal:  "tagPessoal",
  trabalho: "tagTrabalho",
  estudos:  "tagEstudos",
  negocio:  "tagNegocio",
  saude:    "tagSaude",
  financas: "tagFinancas",
};

const TAG_KEYS: TaskTag[] = ["pessoal", "trabalho", "estudos", "negocio", "saude", "financas"];

// 8 cores predefinidas para tags customizadas
const CUSTOM_TAG_COLORS = [
  "#6366f1", "#f59e0b", "#22c55e", "#a855f7",
  "#f43f5e", "#14b8a6", "#3b82f6", "#f97316",
];

// Helpers para resolver cor e label de qualquer tag (built-in ou custom)
function getTagColor(tag: string, customTags: CustomTag[]): string {
  if (tag in TAG_COLOR) return TAG_COLOR[tag as TaskTag];
  return customTags.find((ct) => ct.id === tag)?.color ?? "#6b7280";
}

function getTagLabel(
  tag: string,
  customTags: CustomTag[],
  t: (key: TranslationKey) => string
): string {
  if (tag in TAG_LABEL_KEY) return t(TAG_LABEL_KEY[tag as TaskTag]);
  return customTags.find((ct) => ct.id === tag)?.label ?? tag;
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

interface MonthCalendarProps {
  selectedDate: string;
  calendarMonth: string; // "yyyy-MM"
  tasks: import("@/types").Task[];
  onSelectDate: (d: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

function MonthCalendar({ selectedDate, calendarMonth, tasks, onSelectDate, onPrevMonth, onNextMonth }: MonthCalendarProps) {
  const monthDate = new Date(calendarMonth + "-01T12:00:00");
  const start     = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end       = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days      = eachDayOfInterval({ start, end });
  const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const todayStr  = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onPrevMonth} className="p-1 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-semibold text-white capitalize">
          {format(monthDate, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={onNextMonth} className="p-1 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer">
          <ChevronRight size={15} />
        </button>
      </div>
      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-0.5">
        {weekLabels.map((l) => (
          <div key={l} className="text-center text-[10px] font-medium text-[#4a4a4a] py-1">{l}</div>
        ))}
        {days.map((d) => {
          const dateStr   = format(d, "yyyy-MM-dd");
          const inMonth   = isSameMonth(d, monthDate);
          const isToday   = dateStr === todayStr;
          const isSel     = dateStr === selectedDate;
          const count     = getTasksForDate(tasks, dateStr).length;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className="relative flex flex-col items-center justify-center py-1.5 rounded-lg transition-all cursor-pointer text-[11px] font-medium"
              style={
                isSel
                  ? { background: "#6366f1", color: "#fff" }
                  : isToday
                  ? { background: "#1a1a1a", color: "#e5e5e5", outline: "1px solid rgba(99,102,241,0.4)" }
                  : inMonth
                  ? { color: "#9ca3af" }
                  : { color: "#2a2a2a" }
              }
            >
              <span>{format(d, "d")}</span>
              {count > 0 && inMonth && (
                <span
                  className="text-[9px] font-bold tabular-nums leading-none"
                  style={{ color: isSel ? "rgba(255,255,255,0.75)" : "#f97316", opacity: inMonth ? 1 : 0.3 }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Add Task Form ────────────────────────────────────────────────────────────

interface AddTaskFormProps {
  onClose: () => void;
  defaultDate?: string;
}

function AddTaskForm({ onClose, defaultDate }: AddTaskFormProps) {
  const addTask    = useTarefasStore((s) => s.addTask);
  const customTags = useTarefasStore((s) => s.customTags);
  const language   = useSettingsStore((s) => s.language);
  const t          = useT(language);
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
  const [tag, setTag] = useState<string | undefined>(undefined);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(defaultDate ?? todayStr);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      date,
      ...(recurrence ? { recurrence } : {}),
      ...(time ? { time } : {}),
      ...(tag ? { tag } : {}),
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

        {/* Data */}
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className={date !== todayStr ? "text-[#6366f1]" : "text-[#3a3a3a]"} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border border-[#2a2a2a] rounded text-xs text-[#6b7280] px-1.5 py-0.5 outline-none hover:border-[#3a3a3a] focus:border-[#6366f1] transition-colors"
          />
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

      {/* Tag picker */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TAG_KEYS.map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => setTag(tag === tk ? undefined : tk)}
            className="px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer"
            style={
              tag === tk
                ? { background: TAG_COLOR[tk] + "25", color: TAG_COLOR[tk], borderWidth: 1, borderStyle: "solid", borderColor: TAG_COLOR[tk] + "55" }
                : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
            }
          >
            {t(TAG_LABEL_KEY[tk])}
          </button>
        ))}
        {customTags.map((ct) => (
          <button
            key={ct.id}
            type="button"
            onClick={() => setTag(tag === ct.id ? undefined : ct.id)}
            className="px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer"
            style={
              tag === ct.id
                ? { background: ct.color + "25", color: ct.color, borderWidth: 1, borderStyle: "solid", borderColor: ct.color + "55" }
                : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
            }
          >
            {ct.label}
          </button>
        ))}
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
  date: string;
  time?: string;
  tag?: string;
  priority: TaskPriority;
  completed: boolean;
  isRecurring?: boolean;
  daysLate?: number;
  onToggle: () => void;
  onRemove: () => void;
}

function TaskRow({ id, title, description, date, time, tag, priority, completed, isRecurring, daysLate, onToggle, onRemove }: TaskRowProps) {
  const language      = useSettingsStore((s) => s.language);
  const t             = useT(language);
  const editTask      = useTarefasStore((s) => s.editTask);
  const customTags    = useTarefasStore((s) => s.customTags);
  const startPomodoro = usePomodoroStore((s) => s.startSession);

  const PRIORITY_LABEL: Record<TaskPriority, string> = {
    high: t("priorityHigh"), medium: t("priorityMedium"), low: t("priorityLow"),
  };

  // ── View state ──
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Edit state ──
  const [isEditing,    setIsEditing]    = useState(false);
  const [editTitle,    setEditTitle]    = useState(title);
  const [editDesc,     setEditDesc]     = useState(description ?? "");
  const [editPriority, setEditPriority] = useState<TaskPriority>(priority);
  const [editTime,     setEditTime]     = useState(time ?? "");
  const [editTag,      setEditTag]      = useState<string | undefined>(tag);
  const [editDate,     setEditDate]     = useState(date);

  function openEdit() {
    // Sync local state from latest props before opening
    setEditTitle(title);
    setEditDesc(description ?? "");
    setEditPriority(priority);
    setEditTime(time ?? "");
    setEditTag(tag);
    setEditDate(date);
    setIsEditing(true);
  }

  function saveEdit() {
    if (!editTitle.trim()) return;
    editTask(id, {
      title:       editTitle.trim(),
      description: editDesc.trim() || undefined,
      priority:    editPriority,
      date:        editDate,
      time:        editTime || undefined,
      tag:         editTag,
    });
    setIsEditing(false);
  }

  function cancelEdit() { setIsEditing(false); }

  // ── Edit mode render ──
  if (isEditing) {
    return (
      <div className="py-2 border-b border-[#1f1f1f] last:border-0">
        <div className="bg-[#141414] border border-[#6366f1]/30 rounded-xl p-3 space-y-2.5">
          {/* Title */}
          <input
            autoFocus
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
            className="w-full bg-transparent text-sm text-white placeholder-[#4a4a4a] outline-none border-b border-[#2a2a2a] pb-1 focus:border-[#6366f1] transition-colors"
            placeholder={t("taskTitle")}
          />
          {/* Description */}
          <input
            type="text"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
            className="w-full bg-transparent text-xs text-[#9ca3af] placeholder-[#3a3a3a] outline-none border-b border-[#2a2a2a] pb-1 focus:border-[#4a4a4a] transition-colors"
            placeholder={t("taskDesc")}
          />
          {/* Priority */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRIORITY_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setEditPriority(p)}
                className="px-2.5 py-0.5 rounded text-xs font-medium transition-all cursor-pointer"
                style={
                  editPriority === p
                    ? { background: PRIORITY_COLOR[p] + "22", color: PRIORITY_COLOR[p], borderWidth: 1, borderStyle: "solid", borderColor: PRIORITY_COLOR[p] + "55" }
                    : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
                }
              >
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {TAG_KEYS.map((tk) => (
              <button
                key={tk}
                type="button"
                onClick={() => setEditTag(editTag === tk ? undefined : tk)}
                className="px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer"
                style={
                  editTag === tk
                    ? { background: TAG_COLOR[tk] + "25", color: TAG_COLOR[tk], borderWidth: 1, borderStyle: "solid", borderColor: TAG_COLOR[tk] + "55" }
                    : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
                }
              >
                {t(TAG_LABEL_KEY[tk])}
              </button>
            ))}
            {customTags.map((ct) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => setEditTag(editTag === ct.id ? undefined : ct.id)}
                className="px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer"
                style={
                  editTag === ct.id
                    ? { background: ct.color + "25", color: ct.color, borderWidth: 1, borderStyle: "solid", borderColor: ct.color + "55" }
                    : { color: "#4a4a4a", borderWidth: 1, borderStyle: "solid", borderColor: "#2a2a2a" }
                }
              >
                {ct.label}
              </button>
            ))}
          </div>
          {/* Date + Time */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-[#4a4a4a]" />
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="bg-transparent border border-[#2a2a2a] rounded text-xs text-[#6b7280] px-1.5 py-0.5 outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-[#4a4a4a]" />
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="bg-transparent border border-[#2a2a2a] rounded text-xs text-[#6b7280] px-1.5 py-0.5 outline-none focus:border-[#6366f1] transition-colors"
              />
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1f1f1f]">
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer"
            >
              {t("cancelBtn")}
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={!editTitle.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Check size={12} />
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal view ──
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
            <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <div
        className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: PRIORITY_COLOR[priority] }}
      />

      {/* Content — click to edit */}
      <div className="flex-1 min-w-0 space-y-0.5 cursor-pointer" onClick={openEdit}>
        <span className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-sm leading-snug transition-colors ${
              completed ? "line-through text-[#4a4a4a]" : "text-[#e5e5e5] hover:text-white"
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
        {tag && (
          <span
            className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: getTagColor(tag, customTags) + "20", color: getTagColor(tag, customTags) }}
          >
            {getTagLabel(tag, customTags, t)}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="mt-0.5 text-xs font-medium px-1.5 py-0.5 rounded"
          style={{ background: PRIORITY_COLOR[priority] + "18", color: PRIORITY_COLOR[priority] }}
        >
          {PRIORITY_LABEL[priority]}
        </span>
        {daysLate !== undefined && daysLate > 0 && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#f97316]/15 text-[#f97316]">
            {daysLate}d atraso
          </span>
        )}
      </div>

      {/* Pomodoro + Delete */}
      <div className="flex items-center gap-1 flex-shrink-0 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        {!completed && (
          <button
            type="button"
            onClick={() => startPomodoro(id, title)}
            className="text-[#3a3a3a] hover:text-[#6366f1] transition-colors cursor-pointer"
            aria-label="Iniciar Pomodoro"
            title="Iniciar Pomodoro"
          >
            <Timer size={13} />
          </button>
        )}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button type="button" onClick={onRemove} className="text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer" aria-label="Confirmar exclusão">
              <Check size={13} />
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer" aria-label="Cancelar">
              <X size={13} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer" aria-label="Remover tarefa">
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
  const tasks           = useTarefasStore((s) => s.tasks);
  const toggleTask      = useTarefasStore((s) => s.toggleTask);
  const removeTask      = useTarefasStore((s) => s.removeTask);
  const generateRecurring = useTarefasStore((s) => s.generateRecurring);
  const customTags      = useTarefasStore((s) => s.customTags);
  const addCustomTag    = useTarefasStore((s) => s.addCustomTag);
  const removeCustomTag = useTarefasStore((s) => s.removeCustomTag);

  const [showForm, setShowForm]              = useState(false);
  const [activeTag, setActiveTag]            = useState<"all" | string>("all");
  const [showManageTags, setShowManageTags]  = useState(false);
  const [newTagName, setNewTagName]          = useState("");
  const [newTagColor, setNewTagColor]        = useState(CUSTOM_TAG_COLORS[0]);
  const [viewMode, setViewMode]              = useState<"week" | "month">("week");
  const today                                = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate]      = useState(today);
  const [calendarMonth, setCalendarMonth]    = useState(format(new Date(), "yyyy-MM"));

  // Sincroniza mês do calendário quando a data selecionada muda para outro mês
  function handleSelectDate(d: string) {
    setSelectedDate(d);
    setShowForm(false);
    setCalendarMonth(d.slice(0, 7)); // "yyyy-MM"
  }

  // Gera instâncias de tarefas recorrentes para hoje ao montar
  useEffect(() => {
    if (hydrated) generateRecurring(today);
  }, [hydrated, generateRecurring, today]);

  // Barra semanal: hoje + 6 dias seguintes
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d       = addDays(new Date(), i);
    const dateStr = format(d, "yyyy-MM-dd");
    return {
      dateStr,
      dayLabel: i === 0 ? "Hoje" : format(d, "EEE", { locale: ptBR }),
      dayNum:   format(d, "d"),
      count:    getTasksForDate(tasks, dateStr).length, // total sem filtro de tag
    };
  });

  const selectedDateLabel = format(
    new Date(selectedDate + "T00:00:00"),
    "EEEE, d 'de' MMMM",
    { locale: ptBR }
  );

  // Contagem por tag (para o dia selecionado + atrasadas se for hoje)
  const allOverdueTasks   = selectedDate === today ? getOverdueTasks(tasks) : [];
  const allTagKeysForCount = [...TAG_KEYS, ...customTags.map((ct) => ct.id)];
  const tagCounts = allTagKeysForCount.reduce<Record<string, number>>((acc, tk) => {
    const dayTasks = getTasksForDate(tasks, selectedDate);
    acc[tk] = [...dayTasks, ...allOverdueTasks].filter((t) => t.tag === tk).length;
    return acc;
  }, {});

  // Aplica filtro de tag
  const filteredTasks = activeTag === "all" ? tasks : tasks.filter((t) => t.tag === activeTag);

  const todayTasks    = getTasksForDate(filteredTasks, selectedDate);
  const overdueTasks  = selectedDate === today ? getOverdueTasks(filteredTasks) : [];
  const completedTasks = todayTasks.filter((t) => t.completed);
  const pendingTasks   = todayTasks.filter((t) => !t.completed);
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
          <p className="text-sm text-[#6b7280] capitalize">{selectedDateLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle Semana / Mês */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
              style={viewMode === "week" ? { background: "#2a2a2a", color: "#e5e5e5" } : { color: "#4a4a4a" }}
              title="Semana"
            >
              <LayoutList size={12} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
              style={viewMode === "month" ? { background: "#2a2a2a", color: "#e5e5e5" } : { color: "#4a4a4a" }}
              title="Mês"
            >
              <CalendarDays size={12} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={14} />
            {t("addTask")}
          </button>
        </div>
      </div>

      {/* Inline add form */}
      {showForm && (
        <AddTaskForm onClose={() => setShowForm(false)} defaultDate={selectedDate} />
      )}

      {/* Week bar ou Calendário mensal */}
      {viewMode === "week" ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {weekDays.map(({ dateStr, dayLabel, dayNum, count }) => {
            const isSelected = selectedDate === dateStr;
            const isToday    = dateStr === today;
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleSelectDate(dateStr)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 w-12 py-2 rounded-xl transition-all cursor-pointer"
                style={
                  isSelected
                    ? { background: "#6366f1", color: "#fff" }
                    : isToday
                    ? { background: "#1a1a1a", color: "#e5e5e5", border: "1px solid rgba(99,102,241,0.35)" }
                    : { background: "#141414", color: "#6b7280", border: "1px solid #2a2a2a" }
                }
              >
                <span className="text-[10px] font-medium capitalize leading-none">{dayLabel}</span>
                <span className="text-sm font-bold tabular-nums leading-tight">{dayNum}</span>
                {count > 0 ? (
                  <span className="text-[10px] font-semibold tabular-nums leading-none" style={{ opacity: isSelected ? 0.85 : 0.55 }}>
                    {count}
                  </span>
                ) : (
                  <span className="text-[10px] leading-none opacity-0">·</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <MonthCalendar
          selectedDate={selectedDate}
          calendarMonth={calendarMonth}
          tasks={tasks}
          onSelectDate={handleSelectDate}
          onPrevMonth={() => setCalendarMonth(format(subMonths(new Date(calendarMonth + "-01"), 1), "yyyy-MM"))}
          onNextMonth={() => setCalendarMonth(format(addMonths(new Date(calendarMonth + "-01"), 1), "yyyy-MM"))}
        />
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        <button
          type="button"
          onClick={() => setActiveTag("all")}
          className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={
            activeTag === "all"
              ? { background: "#6366f1", color: "#fff" }
              : { background: "#1a1a1a", color: "#6b7280", border: "1px solid #2a2a2a" }
          }
        >
          {t("filterAll")}
        </button>
        {TAG_KEYS.map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => setActiveTag(activeTag === tk ? "all" : tk)}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={
              activeTag === tk
                ? { background: TAG_COLOR[tk], color: "#fff" }
                : { background: "#1a1a1a", color: "#6b7280", border: "1px solid #2a2a2a" }
            }
          >
            {t(TAG_LABEL_KEY[tk])}
            {tagCounts[tk] > 0 && (
              <span className="text-[10px] font-semibold tabular-nums leading-none" style={{ opacity: activeTag === tk ? 0.85 : 0.6 }}>
                {tagCounts[tk]}
              </span>
            )}
          </button>
        ))}
        {customTags.map((ct) => (
          <button
            key={ct.id}
            type="button"
            onClick={() => setActiveTag(activeTag === ct.id ? "all" : ct.id)}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={
              activeTag === ct.id
                ? { background: ct.color, color: "#fff" }
                : { background: "#1a1a1a", color: "#6b7280", border: "1px solid #2a2a2a" }
            }
          >
            {ct.label}
            {(tagCounts[ct.id] ?? 0) > 0 && (
              <span className="text-[10px] font-semibold tabular-nums leading-none" style={{ opacity: activeTag === ct.id ? 0.85 : 0.6 }}>
                {tagCounts[ct.id]}
              </span>
            )}
          </button>
        ))}
        {/* Botão gerenciar tags */}
        <button
          type="button"
          onClick={() => setShowManageTags((v) => !v)}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ml-auto"
          style={
            showManageTags
              ? { background: "#2a2a2a", color: "#e5e5e5", border: "1px solid #3a3a3a" }
              : { background: "#1a1a1a", color: "#4a4a4a", border: "1px solid #2a2a2a" }
          }
          title={t("manageTags")}
        >
          <Tag size={10} />
        </button>
      </div>

      {/* Painel gerenciar tags */}
      {showManageTags && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide">{t("manageTags")}</p>
            <button type="button" onClick={() => setShowManageTags(false)} className="text-[#4a4a4a] hover:text-white transition-colors cursor-pointer">
              <X size={13} />
            </button>
          </div>
          {/* Tags custom existentes */}
          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customTags.map((ct) => (
                <div
                  key={ct.id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: ct.color + "20", color: ct.color, border: `1px solid ${ct.color}55` }}
                >
                  <span>{ct.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCustomTag(ct.id);
                      if (activeTag === ct.id) setActiveTag("all");
                    }}
                    className="hover:opacity-60 transition-opacity cursor-pointer ml-0.5"
                    aria-label={`Remover tag ${ct.label}`}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Formulário nova tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTagName.trim()) {
                  addCustomTag(newTagName.trim(), newTagColor);
                  setNewTagName("");
                }
              }}
              placeholder={t("tagNamePlaceholder")}
              maxLength={20}
              className="flex-1 min-w-[120px] bg-transparent border border-[#2a2a2a] rounded text-xs text-white placeholder-[#4a4a4a] px-2 py-1 outline-none focus:border-[#6366f1] transition-colors"
            />
            <div className="flex gap-1.5">
              {CUSTOM_TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  className="w-4 h-4 rounded-full transition-all cursor-pointer flex-shrink-0"
                  style={{
                    background: c,
                    outline: newTagColor === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newTagName.trim()) return;
                addCustomTag(newTagName.trim(), newTagColor);
                setNewTagName("");
              }}
              disabled={!newTagName.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus size={11} />
              {t("addBtn")}
            </button>
          </div>
        </div>
      )}

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
                date={task.date}
                time={task.time}
                tag={task.tag}
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
            <p className="text-sm text-[#4a4a4a]">
              {selectedDate === today ? t("noTasksToday") : "Nenhuma tarefa para este dia"}
            </p>
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
                          date={task.date}
                          time={task.time}
                          tag={task.tag}
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
                    date={task.date}
                    time={task.time}
                    tag={task.tag}
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
