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
import { HabitTag } from "@/types";

const PRESET_COLORS = [
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#6366f1",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
];

const TAGS: { value: HabitTag; label: string; color: string }[] = [
  { value: "saude", label: "Saúde", color: "#22c55e" },
  { value: "trabalho", label: "Trabalho", color: "#6366f1" },
  { value: "pessoal", label: "Pessoal", color: "#f59e0b" },
  { value: "aprendizado", label: "Aprendizado", color: "#06b6d4" },
  { value: "financas", label: "Finanças", color: "#14b8a6" },
];

export function AddHabitDialog() {
  const addHabit = useHabitosStore((s) => s.addHabit);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tag, setTag] = useState<HabitTag | "none">("none");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      color,
      icon: "check",
      tag: tag === "none" ? undefined : tag,
    });
    setName("");
    setColor(PRESET_COLORS[0]);
    setTag("none");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          Novo Hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Criar Hábito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="habit-name">Nome</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Exercitar, Leitura..."
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          {/* Tag */}
          <div className="space-y-1.5">
            <Label>Contexto</Label>
            <Select
              value={tag}
              onValueChange={(v) => setTag(v as HabitTag | "none")}
            >
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                <SelectValue placeholder="Sem contexto" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                <SelectItem value="none">Sem contexto</SelectItem>
                {TAGS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]"
                      : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
          >
            Criar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
