"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHabitosStore } from "@/store/habitosStore";
import { Habit, HabitTag, WeekDayIndex } from "@/types";
import { PauseCircle, PlayCircle, Ban, Minus, Plus } from "lucide-react";

const PRESET_COLORS = [
  "#22c55e", "#ef4444", "#f59e0b", "#6366f1",
  "#ec4899", "#06b6d4", "#8b5cf6", "#f97316",
];

const TAGS: { value: HabitTag; label: string }[] = [
  { value: "saude", label: "Saúde" },
  { value: "trabalho", label: "Trabalho" },
  { value: "pessoal", label: "Pessoal" },
  { value: "aprendizado", label: "Aprendizado" },
  { value: "financas", label: "Finanças" },
];

const WEEK_DAYS: { idx: WeekDayIndex; short: string }[] = [
  { idx: 1, short: "Seg" },
  { idx: 2, short: "Ter" },
  { idx: 3, short: "Qua" },
  { idx: 4, short: "Qui" },
  { idx: 5, short: "Sex" },
  { idx: 6, short: "Sáb" },
  { idx: 0, short: "Dom" },
];

interface Props {
  habit: Habit;
  open: boolean;
  onClose: () => void;
}

export function EditHabitDialog({ habit, open, onClose }: Props) {
  const updateHabit = useHabitosStore((s) => s.updateHabit);

  const [name, setName] = useState(habit.name);
  const [color, setColor] = useState(habit.color);
  const [tag, setTag] = useState<HabitTag | "none">(habit.tag ?? "none");
  const [weekDays, setWeekDays] = useState<WeekDayIndex[]>(habit.weekDays ?? []);
  const [paused, setPaused] = useState(habit.paused ?? false);
  const [negative, setNegative] = useState(habit.negative ?? false);
  const [targetCount, setTargetCount] = useState(habit.targetCount ?? 1);

  // Sync when habit changes
  useEffect(() => {
    setName(habit.name);
    setColor(habit.color);
    setTag(habit.tag ?? "none");
    setWeekDays(habit.weekDays ?? []);
    setPaused(habit.paused ?? false);
    setNegative(habit.negative ?? false);
    setTargetCount(habit.targetCount ?? 1);
  }, [habit]);

  function toggleDay(idx: WeekDayIndex) {
    setWeekDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateHabit(habit.id, {
      name: name.trim(),
      color,
      tag: tag === "none" ? undefined : tag,
      weekDays: weekDays.length > 0 ? weekDays : undefined,
      paused,
      negative,
      targetCount: targetCount > 1 ? targetCount : undefined,
    });
    onClose();
  }

  const allDays = weekDays.length === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            Editar hábito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nome</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          {/* Dias da semana */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Dias da semana</Label>
              <span className="text-xs text-[#4a4a4a]">
                {allDays ? "Todo dia" : `${weekDays.length}× por semana`}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setWeekDays([])}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  allDays
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#1f1f1f] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                }`}
              >
                Todo dia
              </button>
              {WEEK_DAYS.map(({ idx, short }) => {
                const active = weekDays.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`w-9 h-8 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      active ? "text-white" : "bg-[#1f1f1f] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                    }`}
                    style={active ? { background: color } : {}}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contador */}
          <div className="space-y-1.5">
            <Label>Modo</Label>
            <div className="flex items-center gap-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2">
              <span className="text-xs text-[#6b7280] flex-1">
                {targetCount <= 1 ? "Check simples" : `Contador (meta: ${targetCount}×)`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTargetCount((n) => Math.max(1, n - 1))}
                  disabled={targetCount <= 1}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-white">{targetCount}</span>
                <button
                  type="button"
                  onClick={() => setTargetCount((n) => Math.min(20, n + 1))}
                  disabled={targetCount >= 20}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Tag */}
          <div className="space-y-1.5">
            <Label>Contexto</Label>
            <Select value={tag} onValueChange={(v) => setTag(v as HabitTag | "none")}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                <SelectValue placeholder="Sem contexto" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="none">Sem contexto</SelectItem>
                {TAGS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Flags: Negativo + Pausar */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNegative((n) => !n)}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                negative
                  ? "bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]"
                  : "bg-[#1f1f1f] border-[#2a2a2a] text-[#6b7280] hover:text-white"
              }`}
            >
              <Ban size={13} />
              {negative ? "Hábito negativo ✓" : "Hábito negativo"}
            </button>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                paused
                  ? "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]"
                  : "bg-[#1f1f1f] border-[#2a2a2a] text-[#6b7280] hover:text-white"
              }`}
            >
              {paused ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
              {paused ? "Retomar" : "Pausar"}
            </button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-[#6b7280] cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
