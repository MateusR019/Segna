import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  isActive:     boolean;
  isPaused:     boolean;
  taskId:       string | null;
  taskTitle:    string | null;
  phase:        PomodoroPhase;
  secondsLeft:  number;
  sessionCount: number; // work phases completadas

  startSession: (taskId: string, taskTitle: string) => void;
  pause:        () => void;
  resume:       () => void;
  skip:         () => void;  // pula para próxima fase
  stop:         () => void;
  tick:         () => void;  // decrementado a cada segundo pelo widget
}

// ─── Constantes de duração ────────────────────────────────────────────────────

export const POMODORO_SECONDS: Record<PomodoroPhase, number> = {
  work:        25 * 60,
  shortBreak:   5 * 60,
  longBreak:   15 * 60,
};

function advancePhase(
  phase: PomodoroPhase,
  sessionCount: number
): { phase: PomodoroPhase; seconds: number; newCount: number } {
  if (phase === "work") {
    const newCount = sessionCount + 1;
    return newCount % 4 === 0
      ? { phase: "longBreak",   seconds: POMODORO_SECONDS.longBreak,   newCount }
      : { phase: "shortBreak",  seconds: POMODORO_SECONDS.shortBreak,  newCount };
  }
  return { phase: "work", seconds: POMODORO_SECONDS.work, newCount: sessionCount };
}

// ─── Store (sem persist — ephemeral) ─────────────────────────────────────────

export const usePomodoroStore = create<PomodoroState>()((set, get) => ({
  isActive:     false,
  isPaused:     false,
  taskId:       null,
  taskTitle:    null,
  phase:        "work",
  secondsLeft:  POMODORO_SECONDS.work,
  sessionCount: 0,

  startSession: (taskId, taskTitle) =>
    set({
      isActive:     true,
      isPaused:     false,
      taskId,
      taskTitle,
      phase:        "work",
      secondsLeft:  POMODORO_SECONDS.work,
      sessionCount: 0,
    }),

  pause:  () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),

  stop: () =>
    set({
      isActive:     false,
      isPaused:     false,
      taskId:       null,
      taskTitle:    null,
      phase:        "work",
      secondsLeft:  POMODORO_SECONDS.work,
      sessionCount: 0,
    }),

  skip: () => {
    const { phase, sessionCount } = get();
    const { phase: next, seconds, newCount } = advancePhase(phase, sessionCount);
    set({ phase: next, secondsLeft: seconds, sessionCount: newCount, isPaused: false });
  },

  tick: () => {
    const { secondsLeft, phase, sessionCount } = get();
    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
    } else {
      const { phase: next, seconds, newCount } = advancePhase(phase, sessionCount);
      set({ phase: next, secondsLeft: seconds, sessionCount: newCount, isPaused: false });
    }
  },
}));
