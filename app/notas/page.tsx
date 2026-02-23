"use client";
import { useState, useRef, useEffect } from "react";
import { useNotasStore } from "@/store/notasStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Eraser } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotasPage() {
  const hydrated = useHydrated();
  const { notes, addNote, removeNote, clearAll } = useNotasStore();
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!draft.trim()) return;
    addNote(draft);
    setDraft("");
    textareaRef.current?.focus();
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Notas</h1>
          <p className="text-sm text-[#6b7280]">Anote e vá embora</p>
        </div>
        {hydrated && notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
          >
            <Eraser size={13} className="mr-1.5" />
            Limpar tudo
          </Button>
        )}
      </div>

      {/* Input box */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="O que está na sua cabeça? (Ctrl+Enter para salvar)"
          rows={3}
          className="w-full bg-transparent text-sm text-white placeholder-[#4a4a4a] resize-none outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-3">
          <span className="text-xs text-[#4a4a4a]">
            {draft.length > 0 ? `${draft.length} caracteres` : "Ctrl+Enter para salvar"}
          </span>
          <Button
            size="sm"
            onClick={submit}
            disabled={!draft.trim()}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium text-xs cursor-pointer disabled:opacity-30"
          >
            Salvar
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {!hydrated ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 bg-[#1a1a1a]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 space-y-1">
          <p className="text-sm text-[#4a4a4a]">Nenhuma nota ainda.</p>
          <p className="text-xs text-[#3a3a3a]">Escreva algo acima e salve.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-start justify-between gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">
                  {note.content}
                </p>
                <p className="text-xs text-[#4a4a4a]">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeNote(note.id)}
                className="h-7 w-7 flex-shrink-0 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
