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
import { Plus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useHabitosStore } from "@/store/habitosStore";
import { HabitTag, HabitTemplate, WeekDayIndex } from "@/types";

const WEEKLY_KEYWORDS = ["treino", "academia", "musculação", "musculacao", "gym", "exercício", "exercicio", "fitness", "crossfit", "dieta", "estudo", "estud"];
const NOTES_KEYWORDS = ["leitura", "livro", "ler", "reading", "book", "livros", "anotaç", "notas", "diário", "diario", "journal"];

function detectTemplate(name: string): HabitTemplate | undefined {
  const lower = name.toLowerCase();
  if (WEEKLY_KEYWORDS.some((k) => lower.includes(k))) return "weekly";
  if (NOTES_KEYWORDS.some((k) => lower.includes(k))) return "notes";
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

// ─── Habit Templates ───────────────────────────────────────────────────────────

interface HabitTemplateOption {
  emoji: string;
  name: string;
  color: string;
  tag: HabitTag;
  weekDays?: WeekDayIndex[];
  template?: HabitTemplate;
  negative?: boolean;
}

const HABIT_TEMPLATES: { category: string; items: HabitTemplateOption[] }[] = [
  {
    category: "💪 Saúde",
    items: [
      { emoji: "🏋️", name: "Treino", color: "#ef4444", tag: "saude", weekDays: [1, 2, 3, 4, 5], template: "weekly" },
      { emoji: "💧", name: "Beber água", color: "#06b6d4", tag: "saude" },
      { emoji: "😴", name: "Dormir cedo", color: "#6366f1", tag: "saude" },
      { emoji: "🧘", name: "Meditação", color: "#8b5cf6", tag: "saude" },
    ],
  },
  {
    category: "🚀 Produtividade",
    items: [
      { emoji: "📚", name: "Leitura", color: "#f59e0b", tag: "aprendizado", template: "notes" },
      { emoji: "📋", name: "Revisão diária", color: "#22c55e", tag: "trabalho" },
      { emoji: "🎯", name: "Foco profundo", color: "#ec4899", tag: "trabalho", weekDays: [1, 2, 3, 4, 5] },
      { emoji: "📵", name: "Sem redes sociais", color: "#9ca3af", tag: "pessoal", negative: true },
    ],
  },
  {
    category: "💰 Finanças",
    items: [
      { emoji: "💵", name: "Anotar gastos", color: "#22c55e", tag: "financas" },
      { emoji: "📈", name: "Ver investimentos", color: "#6366f1", tag: "financas", weekDays: [1] },
    ],
  },
  {
    category: "🌱 Bem-estar",
    items: [
      { emoji: "🚶", name: "Caminhar", color: "#22c55e", tag: "saude" },
      { emoji: "🥗", name: "Comer bem", color: "#f59e0b", tag: "saude" },
      { emoji: "✍️", name: "Diário", color: "#a78bfa", tag: "pessoal", template: "notes" },
      { emoji: "🙏", name: "Gratidão", color: "#ec4899", tag: "pessoal" },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function AddHabitDialog() {
  const addHabit = useHabitosStore((s) => s.addHabit);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tag, setTag] = useState<HabitTag | "none">("none");
  const [weekDays, setWeekDays] = useState<WeekDayIndex[]>([]);
  const [timesPerWeek, setTimesPerWeek] = useState<number | null>(null);
  const [detectedTemplate, setDetectedTemplate] = useState<HabitTemplate | undefined>(undefined);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  function toggleDay(idx: WeekDayIndex) {
    setWeekDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]
    );
  }

  function applyTemplate(tpl: HabitTemplateOption, key: string) {
    if (selectedTemplateIdx === key) {
      // Deselect
      setSelectedTemplateIdx(null);
      setName("");
      setColor(PRESET_COLORS[0]);
      setTag("none");
      setWeekDays([]);
      setTimesPerWeek(null);
      setDetectedTemplate(undefined);
      return;
    }
    setSelectedTemplateIdx(key);
    setName(tpl.name);
    setColor(tpl.color);
    setTag(tpl.tag);
    setWeekDays(tpl.weekDays ?? []);
    setDetectedTemplate(tpl.template);
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
      timesPerWeek: timesPerWeek ?? undefined,
    });
    setName("");
    setColor(PRESET_COLORS[0]);
    setTag("none");
    setWeekDays([]);
    setTimesPerWeek(null);
    setDetectedTemplate(undefined);
    setSelectedTemplateIdx(null);
    setShowTemplates(true);
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
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* ── Templates ── */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowTemplates((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors cursor-pointer"
            >
              <Sparkles size={11} />
              Começar com template
              {showTemplates ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>

            {showTemplates && (
              <div className="space-y-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3">
                {HABIT_TEMPLATES.map((group) => (
                  <div key={group.category}>
                    <p className="text-[10px] text-[#4a4a4a] font-medium mb-1.5">{group.category}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {group.items.map((tpl, i) => {
                        const key = `${group.category}-${i}`;
                        const isActive = selectedTemplateIdx === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => applyTemplate(tpl, key)}
                            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                              isActive
                                ? "border-opacity-60"
                                : "border-[#2a2a2a] hover:border-[#3a3a3a] bg-transparent"
                            }`}
                            style={isActive ? {
                              borderColor: tpl.color + "80",
                              background: tpl.color + "15",
                            } : {}}
                          >
                            <span className="text-base leading-none">{tpl.emoji}</span>
                            <span className={`text-[9px] leading-tight font-medium ${isActive ? "text-white" : "text-[#6b7280]"}`}>
                              {tpl.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedTemplateIdx && (
                  <p className="text-[10px] text-[#22c55e] mt-1">
                    ✓ Template aplicado — edite os campos abaixo se quiser
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!selectedTemplateIdx) {
                  setDetectedTemplate(detectTemplate(e.target.value));
                }
              }}
              placeholder="Ex: Treino, Leitura, Meditação..."
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
            {detectedTemplate && !selectedTemplateIdx && (
              <p className="text-[11px] text-[#6b7280] mt-1">
                Modelo detectado:{" "}
                <span className="text-[#a78bfa] font-medium">
                  {detectedTemplate === "weekly" ? "📅 Plano Semanal" : "📝 Anotações"}
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

          {/* Meta semanal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Meta semanal</Label>
              <span className="text-xs text-[#4a4a4a]">
                {timesPerWeek ? `${timesPerWeek}× por semana` : "Sem meta"}
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setTimesPerWeek(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  timesPerWeek === null
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#1f1f1f] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                }`}
              >
                Sem meta
              </button>
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTimesPerWeek(n === timesPerWeek ? null : n)}
                  className={`w-9 h-8 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    timesPerWeek === n
                      ? "text-white"
                      : "bg-[#1f1f1f] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                  }`}
                  style={timesPerWeek === n ? { background: color } : {}}
                >
                  {n}x
                </button>
              ))}
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
