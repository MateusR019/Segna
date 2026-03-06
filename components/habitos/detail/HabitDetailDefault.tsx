"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Habit } from "@/types";
import { subDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Zap } from "lucide-react";

interface Props {
  habitId: string;
  habit: Habit;
}

function getLast35Days(): string[] {
  return Array.from({ length: 35 }, (_, i) =>
    format(subDays(new Date(), 34 - i), "yyyy-MM-dd")
  );
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );
}

function scoreColor(s: number): string {
  if (s <= 3) return "#ef4444";
  if (s <= 5) return "#f59e0b";
  if (s <= 7) return "#22c55e";
  if (s <= 9) return "#6366f1";
  return "#a78bfa";
}

function scoreLabel(s: number): string {
  if (s <= 2) return "Péssimo";
  if (s <= 4) return "Ruim";
  if (s === 5) return "Regular";
  if (s <= 7) return "Bom";
  if (s <= 9) return "Ótimo";
  return "Perfeito";
}

export function HabitDetailDefault({ habitId, habit }: Props) {
  const { completions, habitNotes, setHabitNote } = useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const days = getLast35Days();
  const last7 = getLast7Days();

  const existing = habitNotes.find((n) => n.habitId === habitId && n.date === todayKey);
  const [draft, setDraft] = useState(existing?.text ?? "");
  const [score, setScore] = useState<number | undefined>(existing?.score);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setHabitNote(habitId, todayKey, draft, score);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  // Heatmap columns of 5
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 5) {
    weeks.push(days.slice(i, i + 5));
  }

  const last30 = days.slice(-30);
  const totalDone = last30.filter((d) => (completions[d] ?? []).includes(habitId)).length;
  const last7Days = last30.slice(-7);
  const last7Done = last7Days.filter((d) => (completions[d] ?? []).includes(habitId)).length;
  const consistency = totalDone === 0 ? "—" : `${Math.round((totalDone / 30) * 100)}%`;

  // Last 7 days scores (for mini chart)
  const last7Scores = last7.map((d) => {
    const note = habitNotes.find((n) => n.habitId === habitId && n.date === d);
    return { date: d, score: note?.score };
  });

  const hasAnyScore = last7Scores.some((s) => s.score !== undefined);

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

      {/* Score + nota do dia */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#6366f1]/10 flex items-center justify-center">
            <Zap size={11} className="text-[#a78bfa]" />
          </div>
          <p className="text-xs font-medium text-[#9ca3af]">
            Score do dia · {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
          </p>
          {score !== undefined && (
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-md"
              style={{
                background: scoreColor(score) + "20",
                color: scoreColor(score),
              }}
            >
              {scoreLabel(score)}
            </span>
          )}
        </div>

        {/* Score selector — 10 dots */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const active = score === n;
              const color = scoreColor(n);
              return (
                <Tooltip key={n}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setScore(score === n ? undefined : n)}
                      className="flex flex-col items-center gap-0.5 cursor-pointer group"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                        style={{
                          background: active ? color : color + "18",
                          color: active ? "#fff" : color,
                          border: `1.5px solid ${color}${active ? "ff" : "44"}`,
                          transform: active ? "scale(1.15)" : "scale(1)",
                          boxShadow: active ? `0 0 8px ${color}55` : "none",
                        }}
                      >
                        {n}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                    {n} — {scoreLabel(n)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          <p className="text-[10px] text-[#4a4a4a]">
            Clique para selecionar o score de hoje (1 = péssimo · 10 = perfeito)
          </p>
        </div>

        {/* Mini 7-day score chart */}
        {hasAnyScore && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-[#4a4a4a] font-medium">Últimos 7 dias</p>
            <div className="flex items-end gap-1.5 h-8">
              {last7Scores.map(({ date, score: s }) => {
                const label = format(parseISO(date), "EEE", { locale: ptBR });
                const isToday = date === todayKey;
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-0.5 flex-1 cursor-default">
                        <div
                          className="w-full rounded-sm transition-all"
                          style={{
                            height: s ? `${(s / 10) * 28}px` : "3px",
                            background: s ? scoreColor(s) : "#2a2a2a",
                            opacity: s ? 1 : 0.4,
                            outline: isToday ? `1px solid #6366f1` : "none",
                          }}
                        />
                        <span
                          className="text-[9px]"
                          style={{ color: isToday ? "#a78bfa" : "#3a3a3a" }}
                        >
                          {label}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1a1a] border-[#2a2a2a] text-xs text-white">
                      {format(parseISO(date), "d MMM", { locale: ptBR })}
                      {s ? ` — ${s}/10 (${scoreLabel(s)})` : " — sem score"}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-2">
          <p className="text-[10px] text-[#4a4a4a] font-medium">Nota do dia</p>
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
        </div>

        {/* Save row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#4a4a4a]">Ctrl+Enter para salvar</span>
          <button
            onClick={handleSave}
            disabled={
              draft === (existing?.text ?? "") &&
              score === existing?.score &&
              !saved
            }
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
            style={{
              background: saved ? "#22c55e33" : "#22c55e",
              color: saved ? "#22c55e" : "#000",
            }}
          >
            {saved ? "Salvo ✓" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
