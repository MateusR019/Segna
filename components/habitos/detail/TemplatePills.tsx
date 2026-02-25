"use client";
import { HabitTemplate } from "@/types";

const OPTIONS: { value: HabitTemplate; label: string; emoji: string }[] = [
  { value: "default", label: "Geral",         emoji: "📊" },
  { value: "weekly",  label: "Plano Semanal", emoji: "📅" },
  { value: "notes",   label: "Anotações",     emoji: "📝" },
];

interface Props {
  value: HabitTemplate;
  onChange: (t: HabitTemplate) => void;
}

export function TemplatePills({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-fit">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            value === opt.value
              ? "bg-[#2a2a2a] text-white shadow-sm"
              : "text-[#6b7280] hover:text-[#9ca3af]"
          }`}
        >
          <span>{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
