"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { Plus, Trash2, Check, X, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  habitId: string;
  habitColor: string;
}

export function HabitAnnotations({ habitId, habitColor }: Props) {
  const { annotations, addAnnotation, removeAnnotation } = useHabitosStore();
  const { success } = useToast();
  const list = annotations[habitId] ?? [];

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd() {
    if (!newContent.trim()) return;
    addAnnotation(habitId, {
      title: newTitle.trim() || undefined,
      content: newContent.trim(),
    });
    setNewTitle("");
    setNewContent("");
    setAdding(false);
    success("Anotação salva!");
  }

  return (
    <div className="space-y-4">
      {/* List of annotations */}
      {list.length === 0 && !adding ? (
        <div className="bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-xl p-8 text-center space-y-2">
          <StickyNote size={20} className="text-[#3a3a3a] mx-auto" />
          <p className="text-sm text-[#4a4a4a]">Nenhuma anotação ainda</p>
          <p className="text-xs text-[#3a3a3a]">Registre observações, reflexões ou qualquer coisa sobre este hábito.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((a) => (
            <div
              key={a.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Color accent + title */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: habitColor }}
                    />
                    {a.title ? (
                      <p className="text-sm font-semibold text-white truncate">{a.title}</p>
                    ) : (
                      <p className="text-[10px] text-[#4a4a4a]">
                        {format(new Date(a.createdAt), "d 'de' MMM 'de' yyyy · HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-sm text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                    {a.content}
                  </p>

                  {/* Date if title exists */}
                  {a.title && (
                    <p className="text-[10px] text-[#4a4a4a]">
                      {format(new Date(a.createdAt), "d 'de' MMM 'de' yyyy · HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </div>

                {/* Delete */}
                <div className="flex-shrink-0 flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                  {confirmDeleteId === a.id ? (
                    <>
                      <span className="text-xs text-[#ef4444] mr-1">Remover?</span>
                      <button
                        onClick={() => {
                          removeAnnotation(habitId, a.id);
                          setConfirmDeleteId(null);
                          success("Anotação removida");
                        }}
                        className="text-[#ef4444] cursor-pointer p-0.5"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[#4a4a4a] cursor-pointer p-0.5"
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(a.id)}
                      className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer opacity-0 group-hover:opacity-100 p-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <p className="text-xs text-[#6b7280] font-medium">Nova anotação</p>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
            placeholder="Título (opcional)"
            className="w-full text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none placeholder-[#4a4a4a] focus:border-[#3a3a3a] transition-colors"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAdding(false);
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd();
            }}
            placeholder="Escreva sua anotação... *"
            rows={4}
            className="w-full text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none placeholder-[#4a4a4a] resize-none leading-relaxed focus:border-[#3a3a3a] transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#4a4a4a]">Ctrl+Enter para salvar · ESC para cancelar</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setAdding(false); setNewTitle(""); setNewContent(""); }}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#2a2a2a] text-[#9ca3af] cursor-pointer hover:bg-[#333] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!newContent.trim()}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#22c55e] text-black font-medium cursor-pointer disabled:opacity-30 disabled:cursor-default transition-opacity"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[#2a2a2a] text-xs text-[#4a4a4a] hover:text-[#9ca3af] hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Nova anotação
        </button>
      )}

      {list.length > 0 && (
        <p className="text-[10px] text-[#4a4a4a] px-1">
          {list.length} anotaç{list.length === 1 ? "ão" : "ões"} · ordenadas da mais recente
        </p>
      )}
    </div>
  );
}
