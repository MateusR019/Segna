"use client";
import Link from "next/link";
import { useState } from "react";
import { useTarefasStore } from "@/store/tarefasStore";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckSquare2, Plus, ArrowRight, Circle } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#6b7280",
};
const PRIORITY_LABEL: Record<string, string> = {
  high: "Alta", medium: "Média", low: "Baixa",
};

export function TodayTasksWidget() {
  const { tasks, toggleTask, addTask } = useTarefasStore();
  const todayKey    = format(new Date(), "yyyy-MM-dd");
  const tomorrowKey = format(addDays(new Date(), 1), "yyyy-MM-dd");

  // Tasks de hoje + overdue (pendentes de dias anteriores)
  const todayTasks = tasks.filter(
    (t) => !t.completed && (t.date === todayKey || t.date < todayKey)
  ).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] ?? 1) - (p[b.priority] ?? 1);
  });

  const doneTodayCount = tasks.filter(
    (t) => t.completed && t.date === todayKey
  ).length;

  // Quick-add state
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function submitQuick(e?: React.FormEvent) {
    e?.preventDefault();
    const title = draft.trim();
    if (!title) { setAdding(false); return; }
    addTask({ title, date: todayKey, priority: "medium" });
    setDraft("");
    setAdding(false);
  }

  const overdue = todayTasks.filter((t) => t.date < todayKey);
  const today   = todayTasks.filter((t) => t.date === todayKey);
  const allPending = [...overdue, ...today];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare2 size={14} className="text-[#6366f1]" />
          <span className="text-sm font-medium text-white">Tarefas de hoje</span>
          {allPending.length > 0 && (
            <span className="text-[10px] bg-[#6366f1]/15 text-[#a78bfa] px-1.5 py-0.5 rounded-full font-medium">
              {allPending.length}
            </span>
          )}
          {doneTodayCount > 0 && (
            <span className="text-[10px] text-[#4a4a4a]">
              · {doneTodayCount} concluída{doneTodayCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding(true)}
            className="p-1 rounded-md text-[#4a4a4a] hover:text-[#a78bfa] hover:bg-[#6366f1]/10 transition-colors cursor-pointer"
            title="Adicionar tarefa"
          >
            <Plus size={13} />
          </button>
          <Link
            href="/tarefas"
            className="text-xs text-[#4a4a4a] hover:text-[#9ca3af] flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight size={10} />
          </Link>
        </div>
      </div>

      {/* Quick-add input */}
      {adding && (
        <form onSubmit={submitQuick} className="flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => submitQuick()}
            onKeyDown={(e) => { if (e.key === "Escape") { setAdding(false); setDraft(""); }}}
            placeholder="Nova tarefa para hoje…"
            className="flex-1 bg-[#0f0f0f] border border-[#6366f1]/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#4a4a4a] outline-none focus:border-[#6366f1] transition-colors"
          />
        </form>
      )}

      {/* Empty */}
      {allPending.length === 0 && !adding ? (
        <div className="py-4 text-center space-y-2">
          {doneTodayCount > 0 ? (
            <>
              <p className="text-2xl">🎉</p>
              <p className="text-sm text-[#4a4a4a]">
                Todas as tarefas concluídas!
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#4a4a4a]">Sem tarefas para hoje</p>
              <button
                onClick={() => setAdding(true)}
                className="text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors cursor-pointer"
              >
                + Adicionar tarefa
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-0.5">
          {/* Overdue indicator */}
          {overdue.length > 0 && (
            <p className="text-[9px] text-[#ef4444] font-medium uppercase tracking-wider mb-1.5">
              {overdue.length} atrasada{overdue.length > 1 ? "s" : ""}
            </p>
          )}

          {allPending.slice(0, 5).map((task) => {
            const isOverdue = task.date < todayKey;
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-2.5 py-1.5 border-b border-[#1f1f1f] last:border-0 cursor-pointer group text-left hover:opacity-80 transition-opacity"
              >
                {/* Circle indicator */}
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: PRIORITY_COLOR[task.priority] + "80",
                  }}
                >
                  <Circle
                    size={5}
                    className="opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ fill: PRIORITY_COLOR[task.priority] }}
                  />
                </div>

                {/* Title */}
                <span className="text-xs text-[#d1d5db] flex-1 truncate leading-relaxed">
                  {task.title}
                </span>

                {/* Priority + overdue badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isOverdue && (
                    <span className="text-[9px] text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 rounded-full">
                      atrasada
                    </span>
                  )}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: PRIORITY_COLOR[task.priority] }}
                    title={PRIORITY_LABEL[task.priority]}
                  />
                </div>
              </button>
            );
          })}

          {allPending.length > 5 && (
            <Link
              href="/tarefas"
              className="text-[11px] text-[#4a4a4a] hover:text-[#9ca3af] transition-colors pt-1 block"
            >
              +{allPending.length - 5} mais tarefas →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
