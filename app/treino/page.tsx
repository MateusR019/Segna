"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus, Trash2, Check, Dumbbell, Trophy,
  ChevronDown, ChevronUp, X,
} from "lucide-react";
import { useWorkoutStore } from "@/store/workoutStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useT } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { WorkoutSession, WorkoutExercise, WorkoutSet } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Para cada nome de exercício, retorna a melhor série (maior peso; empate → mais reps). */
function getExercisePRs(
  sessions: WorkoutSession[]
): Map<string, { weight: number; reps: number; date: string }> {
  const prs = new Map<string, { weight: number; reps: number; date: string }>();
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const key = exercise.name.trim().toLowerCase();
      if (!key) continue;
      for (const set of exercise.sets) {
        if (!set.done || !set.weight) continue;
        const cur = prs.get(key);
        if (
          !cur ||
          set.weight > cur.weight ||
          (set.weight === cur.weight && set.reps > cur.reps)
        ) {
          prs.set(key, { weight: set.weight, reps: set.reps, date: session.date });
        }
      }
    }
  }
  return prs;
}

// ─── SetRow ───────────────────────────────────────────────────────────────────

function SetRow({
  sessionId,
  exerciseId,
  set,
  index,
}: {
  sessionId: string;
  exerciseId: string;
  set: WorkoutSet;
  index: number;
}) {
  const updateSet    = useWorkoutStore((s) => s.updateSet);
  const toggleSetDone = useWorkoutStore((s) => s.toggleSetDone);
  const removeSet    = useWorkoutStore((s) => s.removeSet);

  const [reps,   setReps]   = useState(set.reps > 0 ? String(set.reps) : "");
  const [weight, setWeight] = useState(set.weight !== undefined ? String(set.weight) : "");

  function persist() {
    updateSet(
      sessionId, exerciseId, set.id,
      Number(reps) || 0,
      weight ? Number(weight) : undefined
    );
  }

  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors ${
        set.done ? "opacity-55" : ""
      }`}
    >
      {/* Número da série */}
      <span className="text-[10px] text-[#4a4a4a] w-4 text-center flex-shrink-0 tabular-nums">
        {index + 1}
      </span>

      {/* Reps */}
      <input
        type="number"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={persist}
        placeholder="0"
        min={0}
        className="w-12 bg-[#141414] border border-[#2a2a2a] rounded text-center text-xs text-white outline-none focus:border-[#6366f1] py-1 transition-colors"
      />

      <span className="text-[10px] text-[#3a3a3a] select-none">×</span>

      {/* Peso */}
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={persist}
        placeholder="—"
        min={0}
        step={0.5}
        className="w-14 bg-[#141414] border border-[#2a2a2a] rounded text-center text-xs text-white outline-none focus:border-[#6366f1] py-1 transition-colors"
      />

      <span className="text-[10px] text-[#4a4a4a] select-none">kg</span>

      {/* Done toggle */}
      <button
        type="button"
        onClick={() => toggleSetDone(sessionId, exerciseId, set.id)}
        className={`ml-auto w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
          set.done
            ? "bg-[#22c55e] border-[#22c55e]"
            : "border-[#3a3a3a] hover:border-[#22c55e]/60"
        }`}
        aria-label={set.done ? "Desmarcar série" : "Marcar série como feita"}
      >
        {set.done && <Check size={10} strokeWidth={3} className="text-black" />}
      </button>

      {/* Delete set */}
      <button
        type="button"
        onClick={() => removeSet(sessionId, exerciseId, set.id)}
        className="text-[#2a2a2a] hover:text-[#ef4444] transition-colors cursor-pointer flex-shrink-0"
        aria-label="Remover série"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

// ─── ExerciseBlock ────────────────────────────────────────────────────────────

function ExerciseBlock({
  sessionId,
  exercise,
}: {
  sessionId: string;
  exercise: WorkoutExercise;
}) {
  const addSet            = useWorkoutStore((s) => s.addSet);
  const removeExercise    = useWorkoutStore((s) => s.removeExercise);
  const updateExerciseName = useWorkoutStore((s) => s.updateExerciseName);

  const [name, setName] = useState(exercise.name);

  const doneSets  = exercise.sets.filter((s) => s.done).length;
  const totalSets = exercise.sets.length;

  return (
    <div className="border border-[#2a2a2a] rounded-xl p-3 space-y-2 bg-[#0f0f0f]">
      {/* Exercise name + done counter + delete */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => updateExerciseName(sessionId, exercise.id, name.trim())}
          placeholder="Nome do exercício"
          autoFocus={exercise.name === ""}
          className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-[#3a3a3a] outline-none border-b border-transparent focus:border-[#6366f1] pb-0.5 transition-colors"
        />
        {totalSets > 0 && (
          <span className="text-[10px] text-[#6b7280] tabular-nums flex-shrink-0">
            {doneSets}/{totalSets}
          </span>
        )}
        <button
          type="button"
          onClick={() => removeExercise(sessionId, exercise.id)}
          className="text-[#2a2a2a] hover:text-[#ef4444] transition-colors cursor-pointer flex-shrink-0"
          aria-label="Remover exercício"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Sets */}
      <div className="space-y-0.5">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            sessionId={sessionId}
            exerciseId={exercise.id}
            set={set}
            index={i}
          />
        ))}
      </div>

      {/* Add set */}
      <button
        type="button"
        onClick={() => addSet(sessionId, exercise.id)}
        className="flex items-center gap-1 text-xs text-[#4a4a4a] hover:text-[#6366f1] transition-colors cursor-pointer"
      >
        <Plus size={11} />
        Série
      </button>
    </div>
  );
}

// ─── ActiveSession ────────────────────────────────────────────────────────────

function ActiveSession({ session }: { session: WorkoutSession }) {
  const addExercise   = useWorkoutStore((s) => s.addExercise);
  const updateSession = useWorkoutStore((s) => s.updateSession);
  const removeSession = useWorkoutStore((s) => s.removeSession);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sessionName, setSessionName]     = useState(session.name ?? "");
  const [duration, setDuration]           = useState(
    session.duration !== undefined ? String(session.duration) : ""
  );

  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const doneSets  = session.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0);

  return (
    <div className="bg-[#1a1a1a] border border-[#6366f1]/30 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1.5 min-w-0">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onBlur={() =>
              updateSession(session.id, { name: sessionName.trim() || undefined })
            }
            placeholder="Nome do treino (Push, Pull, Legs...)"
            className="w-full bg-transparent text-sm font-semibold text-white placeholder-[#3a3a3a] outline-none border-b border-transparent focus:border-[#6366f1] pb-0.5 transition-colors"
          />
          <div className="flex items-center gap-2.5 text-xs text-[#6b7280] flex-wrap">
            <span>
              {format(new Date(session.date + "T00:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
            {session.exercises.length > 0 && (
              <>
                <span className="text-[#2a2a2a]">·</span>
                <span>{session.exercises.length} exerc.</span>
              </>
            )}
            {totalSets > 0 && (
              <>
                <span className="text-[#2a2a2a]">·</span>
                <span className={doneSets === totalSets ? "text-[#22c55e]" : ""}>
                  {doneSets}/{totalSets} séries
                </span>
              </>
            )}
          </div>
        </div>

        {/* Duração */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={() =>
              updateSession(session.id, {
                duration: duration ? Number(duration) : undefined,
              })
            }
            placeholder="—"
            min={0}
            className="w-12 bg-[#141414] border border-[#2a2a2a] rounded text-center text-xs text-white outline-none focus:border-[#6366f1] py-1 transition-colors"
          />
          <span className="text-[10px] text-[#4a4a4a]">min</span>
        </div>

        {/* Delete session */}
        {confirmDelete ? (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => removeSession(session.id)}
              className="text-[#ef4444] cursor-pointer p-1.5 hover:bg-[#ef4444]/10 rounded transition-colors"
              aria-label="Confirmar"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[#4a4a4a] cursor-pointer p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"
              aria-label="Cancelar"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer flex-shrink-0 p-1"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Exercises */}
      {session.exercises.length > 0 && (
        <div className="space-y-3">
          {session.exercises.map((exercise) => (
            <ExerciseBlock
              key={exercise.id}
              sessionId={session.id}
              exercise={exercise}
            />
          ))}
        </div>
      )}

      {/* Add exercise */}
      <button
        type="button"
        onClick={() => addExercise(session.id, "")}
        className="flex items-center gap-2 w-full py-2.5 border border-dashed border-[#2a2a2a] rounded-xl text-xs text-[#4a4a4a] hover:text-[#6366f1] hover:border-[#6366f1]/40 transition-colors cursor-pointer justify-center"
      >
        <Plus size={13} />
        Adicionar exercício
      </button>
    </div>
  );
}

// ─── SessionCard (histórico) ──────────────────────────────────────────────────

function SessionCard({
  session,
  onRemove,
}: {
  session: WorkoutSession;
  onRemove: () => void;
}) {
  const [open, setOpen]                   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const doneSets  = session.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0);
  const totalVolume = session.exercises.reduce(
    (acc, e) =>
      acc + e.sets.reduce((a, s) => a + (s.done && s.weight ? s.reps * s.weight : 0), 0),
    0
  );

  return (
    <div className="border-b border-[#1f1f1f] last:border-0 py-3">
      <div className="flex items-start gap-3">
        {/* Date column */}
        <div className="flex-shrink-0 w-11 text-center">
          <p className="text-xs font-semibold text-white">
            {format(new Date(session.date + "T00:00:00"), "d MMM", { locale: ptBR })}
          </p>
          <p className="text-[10px] text-[#4a4a4a]">
            {format(new Date(session.date + "T00:00:00"), "yyyy")}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {session.name || "Treino"}
          </p>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
            {session.exercises.length > 0 && (
              <span className="text-xs text-[#6b7280]">
                {session.exercises.length} exerc.
              </span>
            )}
            {totalSets > 0 && (
              <span className="text-xs text-[#6b7280]">{doneSets}/{totalSets} séries</span>
            )}
            {totalVolume > 0 && (
              <span className="text-xs text-[#6b7280]">
                {totalVolume.toLocaleString("pt-BR")} kg vol.
              </span>
            )}
            {session.duration && (
              <span className="text-xs text-[#6b7280]">{session.duration} min</span>
            )}
          </div>

          {/* Expanded exercises */}
          {open && session.exercises.length > 0 && (
            <div className="mt-3 space-y-2.5">
              {session.exercises.map((ex) => (
                <div key={ex.id}>
                  <p className="text-xs font-medium text-[#9ca3af] mb-1.5">
                    {ex.name || "—"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.sets.map((s, i) => (
                      <span
                        key={s.id}
                        className={`text-[10px] px-2 py-0.5 rounded border tabular-nums ${
                          s.done
                            ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                            : "bg-[#141414] border-[#2a2a2a] text-[#4a4a4a]"
                        }`}
                      >
                        {i + 1}. {s.reps}×{s.weight ?? "—"}kg
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {confirmDelete ? (
            <>
              <button
                type="button"
                onClick={onRemove}
                className="text-[#ef4444] cursor-pointer p-1.5 hover:bg-[#ef4444]/10 rounded transition-colors"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[#4a4a4a] cursor-pointer p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer rounded"
              >
                <Trash2 size={12} />
              </button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="p-1.5 text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer rounded"
              >
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TreinoPage() {
  const hydrated      = useHydrated();
  const language      = useSettingsStore((s) => s.language);
  const t             = useT(language);
  const sessions      = useWorkoutStore((s) => s.sessions);
  const addSession    = useWorkoutStore((s) => s.addSession);
  const removeSession = useWorkoutStore((s) => s.removeSession);

  const today = format(new Date(), "yyyy-MM-dd");

  // Today's sessions (may be more than one — double training days)
  const todaySessions = sessions.filter((s) => s.date === today);

  // Past sessions (sorted by date desc, already ordered by createdAt from store)
  const pastSessions = sessions.filter((s) => s.date !== today);

  // PRs across all sessions
  const prs      = getExercisePRs(sessions);
  const prList   = [...prs.entries()].sort((a, b) => b[1].weight - a[1].weight);

  // Aggregate stats
  const totalSets = sessions.reduce(
    (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
    0
  );

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-[#1a1a1a]" />
        <Skeleton className="h-56 bg-[#1a1a1a]" />
        <Skeleton className="h-28 bg-[#1a1a1a]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("treinoTitle")}</h1>
          <p className="text-sm text-[#6b7280]">{t("treinoDesc")}</p>
        </div>
        <button
          type="button"
          onClick={() => addSession(today)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex-shrink-0"
        >
          <Plus size={14} />
          {t("newWorkout")}
        </button>
      </div>

      {/* ─── Empty state (sem nenhum treino) ─── */}
      {sessions.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto">
            <Dumbbell size={24} className="text-[#4a4a4a]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#6b7280]">{t("noWorkoutsYet")}</p>
            <p className="text-xs text-[#3a3a3a]">
              Registre exercícios, séries e pesos — seus PRs aparecem automaticamente
            </p>
          </div>
        </div>
      )}

      {/* ─── Today's sessions ─── */}
      {todaySessions.map((session) => (
        <ActiveSession key={session.id} session={session} />
      ))}

      {/* ─── Stats bar ─── */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-white">{sessions.length}</p>
            <p className="text-xs text-[#4a4a4a] mt-0.5">sessões</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-white">{totalSets}</p>
            <p className="text-xs text-[#4a4a4a] mt-0.5">séries</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 text-center">
            <p className="text-lg font-semibold text-[#f59e0b]">{prList.length}</p>
            <p className="text-xs text-[#4a4a4a] mt-0.5">PRs</p>
          </div>
        </div>
      )}

      {/* ─── PRs panel ─── */}
      {prList.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-[#f59e0b]" />
            <p className="text-sm font-medium text-white">{t("prsTitle")}</p>
          </div>
          <div className="space-y-2">
            {prList.map(([key, pr]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#9ca3af] capitalize truncate">{key}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    {pr.weight} kg × {pr.reps}
                  </span>
                  <span className="text-xs text-[#4a4a4a]">
                    {format(new Date(pr.date + "T00:00:00"), "d MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Histórico ─── */}
      {pastSessions.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-1">
            {t("workoutHistory")}
          </p>
          <div>
            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRemove={() => removeSession(session.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
