"use client";
import { useState } from "react";
import { useHabitosStore } from "@/store/habitosStore";
import { Book } from "@/types";
import { Plus, Trash2, Check, X, BookOpen, CheckCircle2, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type BookStatus = Book["status"];

const STATUS_CONFIG: Record<BookStatus, {
  label: string;
  icon: React.ElementType;
  color: string;
  next: BookStatus;
  nextLabel: string;
}> = {
  reading:   { label: "Lendo",      icon: BookOpen,     color: "#6366f1", next: "completed", nextLabel: "Marcar como concluído" },
  completed: { label: "Concluído",  icon: CheckCircle2, color: "#22c55e", next: "want",      nextLabel: "Mover para quero ler" },
  want:      { label: "Quero ler",  icon: Bookmark,     color: "#f59e0b", next: "reading",   nextLabel: "Começar a ler" },
};

const STATUS_ORDER: BookStatus[] = ["reading", "completed", "want"];

interface Props {
  habitId: string;
}

export function BookTracker({ habitId }: Props) {
  const { books, addBook, updateBook, removeBook } = useHabitosStore();
  const { success } = useToast();
  const bookList = books[habitId] ?? [];

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newStatus, setNewStatus] = useState<BookStatus>("want");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addBook(habitId, {
      title: newTitle.trim(),
      author: newAuthor.trim() || undefined,
      status: newStatus,
    });
    setNewTitle("");
    setNewAuthor("");
    setNewStatus("want");
    setAdding(false);
    success("Livro adicionado!");
  }

  function cycleStatus(book: Book) {
    const next = STATUS_CONFIG[book.status].next;
    updateBook(habitId, book.id, { status: next });
  }

  // Stats
  const stats = STATUS_ORDER.map((s) => ({
    status: s,
    count: bookList.filter((b) => b.status === s).length,
  }));

  return (
    <div className="space-y-5">
      {/* Books grouped by status */}
      {STATUS_ORDER.map((status) => {
        const group = bookList.filter((b) => b.status === status);
        const { label, icon: Icon, color } = STATUS_CONFIG[status];

        return (
          <div key={status} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={13} style={{ color }} />
              <span className="text-xs font-semibold" style={{ color }}>{label}</span>
              <span className="text-[10px] text-[#4a4a4a]">({group.length})</span>
            </div>

            {group.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-lg px-4 py-3">
                <p className="text-xs text-[#3a3a3a] italic">Nenhum livro aqui ainda</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {group.map((book) => {
                  const cfg = STATUS_CONFIG[book.status];
                  return (
                    <div
                      key={book.id}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center gap-3 group"
                    >
                      {/* Status cycle button */}
                      <button
                        onClick={() => cycleStatus(book)}
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                        style={{ background: cfg.color + "22" }}
                        title={cfg.nextLabel}
                      >
                        <cfg.icon size={13} style={{ color: cfg.color }} />
                      </button>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{book.title}</p>
                        {book.author && (
                          <p className="text-xs text-[#6b7280] truncate">{book.author}</p>
                        )}
                        {book.status === "completed" && book.completedAt && (
                          <p className="text-[10px] text-[#4a4a4a] mt-0.5">
                            Concluído em {format(new Date(book.completedAt), "d 'de' MMM yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>

                      {/* Delete */}
                      <div className="flex-shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {confirmDeleteId === book.id ? (
                          <>
                            <span className="text-xs text-[#ef4444] mr-1">Remover?</span>
                            <button
                              onClick={() => {
                                removeBook(habitId, book.id);
                                setConfirmDeleteId(null);
                                success("Livro removido");
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
                            onClick={() => setConfirmDeleteId(book.id)}
                            className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer opacity-0 group-hover:opacity-100 p-0.5"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Add book form */}
      {adding ? (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
          <p className="text-xs text-[#6b7280] font-medium">Adicionar livro</p>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Título do livro *"
            className="w-full text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none placeholder-[#4a4a4a] focus:border-[#3a3a3a]"
          />
          <input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="Autor (opcional)"
            className="w-full text-sm bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white outline-none placeholder-[#4a4a4a] focus:border-[#3a3a3a]"
          />

          {/* Status selector for new book */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_ORDER.map((s) => {
              const { label, color, icon: Icon } = STATUS_CONFIG[s];
              const active = newStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewStatus(s)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border"
                  style={
                    active
                      ? { background: color + "22", color, borderColor: color + "55" }
                      : { color: "#6b7280", borderColor: "#2a2a2a" }
                  }
                >
                  <Icon size={11} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="flex-1 text-sm py-2 rounded-lg bg-[#22c55e] text-black font-medium cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              Adicionar
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle(""); setNewAuthor(""); }}
              className="px-4 text-sm py-2 rounded-lg bg-[#2a2a2a] text-[#9ca3af] cursor-pointer hover:bg-[#333]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[#2a2a2a] text-xs text-[#4a4a4a] hover:text-[#9ca3af] hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Adicionar livro
        </button>
      )}

      {/* Summary stats */}
      {bookList.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ status, count }) => {
            const { label, color } = STATUS_CONFIG[status];
            return (
              <div key={status} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2.5 text-center">
                <p className="text-lg font-semibold" style={{ color }}>{count}</p>
                <p className="text-[10px] text-[#6b7280] mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
