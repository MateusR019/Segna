"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { useHabitosStore } from "@/store/habitosStore";
import { HabitTag, HabitTemplate, WeekDayIndex } from "@/types";

const WORKOUT_KEYWORDS = ["treino", "academia", "musculação", "musculacao", "gym", "exercício", "exercicio", "fitness", "crossfit"];
const READING_KEYWORDS = ["leitura", "livro", "ler", "reading", "book", "livros"];

function detectTemplate(name: string): HabitTemplate | undefined {
  const lower = name.toLowerCase();
  if (WORKOUT_KEYWORDS.some((k) => lower.includes(k))) return "workout";
  if (READING_KEYWORDS.some((k) => lower.includes(k))) return "reading";
  return undefined;
}

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

export function AddHabitDialog() {
  const addHabit = useHabitosStore((s) => s.addHabit);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tag, setTag] = useState<HabitTag | "none">("none");
  const [weekDays, setWeekDays] = useState<WeekDayIndex[]>([]);
  const [detectedTemplate, setDetectedTemplate] = useState<HabitTemplate | undefined>(undefined);

  function toggleDay(idx: WeekDayIndex) {
    setWeekDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      color,
      icon: "check",
      tag: tag === "none" ? undefined : tag,
      weekDays: weekDays.length > 0 ? weekDays : undefined,
      template: detectedTemplate,
    });
    setName("");
    setColor(PRESET_COLORS[0]);
    setTag("none");
    setWeekDays([]);
    setDetectedTemplate(undefined);
    setOpen(false);
  }

  const allDays = weekDays.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer">
          <Plus size={14} className="mr-1.5" />
          Novo Hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Criar Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setDetectedTemplate(detectTemplate(e.target.value));
              }}
              placeholder="Ex: Treino, Leitura, Meditação..."
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
            {detectedTemplate && (
              <p className="text-[11px] text-[#6b7280] mt-1">
                Modelo detectado:{" "}
                <span className="text-[#a78bfa] font-medium">
                  {detectedTemplate === "workout" ? "💪 Treino" : "📖 Leitura"}
                </span>
                {" "}— você poderá configurar na página do hábito
              </p>
            )}
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
                      active
                        ? "text-white"
                        : "bg-[#1f1f1f] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                    }`}
                    style={active ? { background: color } : {}}
                  >
                    {short}
                  </button>
                );
              })}
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

          <Button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer">
            Criar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
