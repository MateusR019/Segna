"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { MessageSquare, X } from "lucide-react";
import { format } from "date-fns";

interface Props {
  habitId: string;
}

export function HabitNoteInline({ habitId }: Props) {
  const { habitNotes, setHabitNote } = useHabitosStore();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const existing = habitNotes.find((n) => n.habitId === habitId && n.date === todayKey);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(existing?.text ?? "");

  function save() {
    setHabitNote(habitId, todayKey, draft);
    setOpen(false);
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={(e) => { e.stopPropagation(); setDraft(existing?.text ?? ""); setOpen(true); }}
          className="flex items-center gap-1 text-[10px] text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer"
        >
          <MessageSquare size={10} />
          {existing ? existing.text.slice(0, 30) + (existing.text.length > 30 ? "…" : "") : "nota de hoje"}
        </button>
      ) : (
        <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setOpen(false); }}
            placeholder="Nota de hoje (opcional)..."
            className="flex-1 text-xs bg-[#0f0f0f] border border-[#3a3a3a] rounded px-2 py-0.5 text-white outline-none min-w-0"
          />
          <button onClick={save} className="text-[10px] text-[#22c55e] cursor-pointer flex-shrink-0">OK</button>
          <button onClick={() => setOpen(false)} className="text-[#4a4a4a] cursor-pointer flex-shrink-0">
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
