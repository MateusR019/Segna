"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, SkipForward, X } from "lucide-react";
import { usePomodoroStore, POMODORO_SECONDS, type PomodoroPhase } from "@/store/pomodoroStore";

// ─── Config visual por fase ───────────────────────────────────────────────────

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  work:        "Foco",
  shortBreak:  "Pausa Curta",
  longBreak:   "Pausa Longa",
};

const PHASE_COLOR: Record<PomodoroPhase, string> = {
  work:        "#6366f1",
  shortBreak:  "#22c55e",
  longBreak:   "#14b8a6",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PomodoroWidget() {
  const {
    isActive, isPaused, taskTitle,
    phase, secondsLeft, sessionCount,
    pause, resume, skip, stop, tick,
  } = usePomodoroStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick a cada 1 segundo quando ativo e não pausado
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, tick]);

  if (!isActive) return null;

  // ── Cálculo do ring SVG ──
  const totalSeconds  = POMODORO_SECONDS[phase];
  const progress      = (totalSeconds - secondsLeft) / totalSeconds;
  const radius        = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset  = circumference * (1 - progress);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const color = PHASE_COLOR[phase];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 p-4 rounded-2xl shadow-2xl min-w-[180px]"
      style={{ background: "rgba(15,15,15,0.97)", border: "1px solid #2a2a2a", backdropFilter: "blur(12px)" }}>

      {/* Fase + sessões */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
          {PHASE_LABEL[phase]}
        </span>
        <span className="text-[10px] text-[#4a4a4a] tabular-nums">
          {sessionCount} sessão{sessionCount !== 1 ? "ões" : ""}
        </span>
      </div>

      {/* Ring progress + tempo */}
      <div className="relative flex items-center justify-center">
        <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={36} cy={36} r={radius} fill="none" stroke="#2a2a2a" strokeWidth={4} />
          {/* Progress */}
          <circle
            cx={36} cy={36} r={radius} fill="none"
            stroke={color} strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s linear" }}
          />
        </svg>
        <span className="absolute text-base font-bold tabular-nums text-white">
          {mm}:{ss}
        </span>
      </div>

      {/* Título da tarefa */}
      {taskTitle && (
        <p className="text-[11px] text-[#6b7280] text-center line-clamp-2 max-w-[160px] leading-snug">
          {taskTitle}
        </p>
      )}

      {/* Controles */}
      <div className="flex items-center gap-2">
        {/* Pause / Play */}
        <button
          type="button"
          onClick={isPaused ? resume : pause}
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer"
          style={{ background: color + "22", color }}
          aria-label={isPaused ? "Retomar" : "Pausar"}
        >
          {isPaused ? <Play size={13} fill={color} /> : <Pause size={13} />}
        </button>

        {/* Skip phase */}
        <button
          type="button"
          onClick={skip}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] text-[#6b7280] hover:text-white transition-colors cursor-pointer"
          aria-label="Pular fase"
        >
          <SkipForward size={13} />
        </button>

        {/* Stop */}
        <button
          type="button"
          onClick={stop}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] text-[#6b7280] hover:text-[#ef4444] transition-colors cursor-pointer"
          aria-label="Parar"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
