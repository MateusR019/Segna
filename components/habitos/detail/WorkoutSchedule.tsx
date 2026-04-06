"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { WeekDayIndex } from "@/types";
import { Pencil, Check } from "lucide-react";

const ALL_DAYS: { idx: WeekDayIndex; short: string; full: string }[] = [
  { idx: 1, short: "Seg", full: "Segunda" },
  { idx: 2, short: "Ter", full: "Terça" },
  { idx: 3, short: "Qua", full: "Quarta" },
  { idx: 4, short: "Qui", full: "Quinta" },
  { idx: 5, short: "Sex", full: "Sexta" },
  { idx: 6, short: "Sáb", full: "Sábado" },
  { idx: 0, short: "Dom", full: "Domingo" },
];

interface Props {
  habitId: string;
  weekDays?: WeekDayIndex[];
  color: string;
}

export function WorkoutSchedule({ habitId, weekDays, color }: Props) {
  const { workoutSchedule, setWorkoutDay } = useHabitosStore();
  const schedule = workoutSchedule[habitId] ?? {};

  const activeDays =
    !weekDays || weekDays.length === 0
      ? ALL_DAYS
      : ALL_DAYS.filter((d) => weekDays.includes(d.idx));

  const [editingDay, setEditingDay] = useState<WeekDayIndex | null>(null);
  const [draft, setDraft] = useState("");

  function startEdit(idx: WeekDayIndex) {
    setEditingDay(idx);
    setDraft((schedule[idx] as string | undefined) ?? "");
  }

  function commitEdit() {
    if (editingDay === null) return;
    setWorkoutDay(habitId, editingDay, draft);
    setEditingDay(null);
  }

  function cancelEdit() {
    setEditingDay(null);
    setDraft("");
  }

  const todayIdx = new Date().getDay() as WeekDayIndex;
  const filledDays = Object.keys(schedule).length;

  return (
    <div className="space-y-3">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
          <p className="text-xs text-[#6b7280] font-medium">
            Plano semanal — {activeDays.length} dia{activeDays.length !== 1 ? "s" : ""}
          </p>
          {filledDays > 0 && (
            <span className="text-[10px] text-[#4a4a4a]">
              {filledDays}/{activeDays.length} configurados
            </span>
          )}
        </div>

        <div className="divide-y divide-[#1a1a1a]">
          {activeDays.map(({ idx, short }) => {
            const text = schedule[idx] as string | undefined;
            const isEditing = editingDay === idx;
            const isToday = idx === todayIdx && activeDays.some((d) => d.idx === todayIdx);

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isToday && !isEditing ? "bg-[#1d1d22]" : "bg-[#1a1a1a]"
                } ${!isEditing ? "cursor-pointer hover:bg-[#1f1f1f] group" : ""}`}
                onClick={() => !isEditing && startEdit(idx)}
              >
                {/* Day pill */}
                <div
                  className="flex-shrink-0 w-9 text-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={
                    isToday
                      ? { background: color + "22", color }
                      : { color: "#4a4a4a" }
                  }
                >
                  {short}
                </div>

                {/* Content or editor */}
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      onBlur={commitEdit}
                      placeholder="Ex: Peito + Bíceps"
                      className="flex-1 text-sm bg-[#0f0f0f] border border-[#3a3a3a] rounded-md px-2.5 py-1.5 text-white outline-none focus:border-[#5a5a5a] transition-colors"
                    />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); commitEdit(); }}
                      className="text-[#22c55e] cursor-pointer flex-shrink-0 p-0.5"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span
                      className={`text-sm truncate ${
                        text ? "text-white" : "text-[#3a3a3a] italic"
                      }`}
                    >
                      {text ?? "Toque para definir..."}
                    </span>
                    <Pencil
                      size={11}
                      className="text-[#3a3a3a] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-[#4a4a4a] px-1">
        Clique em qualquer linha para editar · Enter ou clique fora para salvar · ESC para cancelar
      </p>
    </div>
  );
}
