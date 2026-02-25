"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Habit } from "@/types";
import { subDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  habitId: string;
  habit: Habit;
}

function getLast30Days(): string[] {
  return Array.from({ length: 35 }, (_, i) =>
    format(subDays(new Date(), 34 - i), "yyyy-MM-dd")
  );
}

export function HabitDetailDefault({ habitId, habit }: Props) {
  const { completions, habitNotes, setHabitNote } = useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const days = getLast30Days();

  const existing = habitNotes.find((n) => n.habitId === habitId && n.date === todayKey);
  const [draft, setDraft] = useState(existing?.text ?? "");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setHabitNote(habitId, todayKey, draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  // Group into columns of 5 for the heatmap grid
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 5) {
    weeks.push(days.slice(i, i + 5));
  }

  const last30 = days.slice(-30);
  const totalDone = last30.filter((d) => (completions[d] ?? []).includes(habitId)).length;
  const last7 = last30.slice(-7);
  const last7Done = last7.filter((d) => (completions[d] ?? []).includes(habitId)).length;
  const consistency = totalDone === 0 ? "—" : `${Math.round((totalDone / 30) * 100)}%`;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: String(totalDone), label: "últimos 30 dias" },
          { value: `${last7Done}/7`, label: "esta semana" },
          { value: consistency, label: "consistência" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-white">{value}</p>
            <p className="text-[10px] text-[#6b7280] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
        <p className="text-xs text-[#6b7280] font-medium mb-3">Últimos 35 dias</p>
        <div className="overflow-x-auto">
          <div className="flex gap-1.5" style={{ width: "max-content" }}>
            {weeks.map((col, wi) => (
              <div key={wi} className="flex flex-col gap-1.5">
                {col.map((day) => {
                  const done = (completions[day] ?? []).includes(habitId);
                  const label = format(parseISO(day), "d MMM", { locale: ptBR });
                  const isToday = day === todayKey;
                  return (
                    <Tooltip key={day}>
                      <TooltipTrigger asChild>
                        <div
                          className="w-5 h-5 rounded-sm cursor-default transition-opacity"
                          style={{
                            background: done ? habit.color : "#2a2a2a",
                            opacity: done ? 1 : 0.45,
                            outline: isToday ? `2px solid ${habit.color}55` : "none",
                            outlineOffset: "1px",
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                        {label} — {done ? "✓ feito" : "não feito"}
                        {isToday ? " (hoje)" : ""}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's note */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
        <p className="text-xs text-[#6b7280] font-medium">
          Nota de hoje · {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
        </p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
          }}
          placeholder="Como foi hoje? Alguma observação..."
          rows={3}
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#4a4a4a] resize-none outline-none leading-relaxed p-3 focus:border-[#3a3a3a] transition-colors"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#4a4a4a]">Ctrl+Enter para salvar</span>
          <button
            onClick={handleSave}
            disabled={draft === (existing?.text ?? "") && !saved}
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{
              background: saved ? "#22c55e33" : "#22c55e",
              color: saved ? "#22c55e" : "#000",
            }}
          >
            {saved ? "Salvo ✓" : "Salvar nota"}
          </button>
        </div>
      </div>
    </div>
  );
}
