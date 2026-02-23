"use client";
import { useState, useRef, useEffect } from "react";
import { useNotasStore } from "@/store/notasStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Eraser, Plus, Tag, X, Search, Check, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TAG_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#22c55e",
  "#06b6d4", "#8b5cf6", "#f97316", "#ef4444",
];

export default function NotasPage() {
  const hydrated = useHydrated();
  const { notes, tags, addNote, editNote, removeNote, clearAll, addTag, removeTag } =
    useNotasStore();

  const [draft, setDraft] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [filterTagId, setFilterTagId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  // inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize new note textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  // Auto-resize edit textarea
  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editDraft]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!draft.trim()) return;
    addNote(draft, selectedTagId || undefined);
    setDraft("");
    setSelectedTagId("");
    textareaRef.current?.focus();
  }

  function startEdit(id: string, content: string) {
    setEditingId(id);
    setEditDraft(content);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function confirmEdit() {
    if (!editingId || !editDraft.trim()) return;
    editNote(editingId, editDraft);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagLabel.trim()) return;
    addTag(newTagLabel, newTagColor);
    setNewTagLabel("");
    setNewTagColor(TAG_COLORS[0]);
    setShowAddTag(false);
  }

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  const visibleNotes = notes.filter((n) => {
    const matchTag = !filterTagId || n.tagId === filterTagId;
    const matchSearch = !search.trim() || n.content.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
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

        {/* Tag selector */}
        {hydrated && (
          <div className="flex flex-wrap gap-1.5 border-t border-[#2a2a2a] pt-3">
            <button
              type="button"
              onClick={() => setSelectedTagId("")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                selectedTagId === ""
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#4a4a4a] hover:text-[#6b7280]"
              }`}
            >
              <Tag size={10} />
              Sem tag
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTagId(selectedTagId === tag.id ? "" : tag.id)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                  selectedTagId === tag.id ? "text-white" : "text-[#6b7280] hover:text-white"
                }`}
                style={selectedTagId === tag.id ? { background: tag.color + "33", color: tag.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tag.color }} />
                {tag.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
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

      {/* Tag filter bar + search */}
      {hydrated && (
        <div className="space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nas notas..."
              className="pl-8 h-10 text-sm bg-[#1a1a1a] border-[#2a2a2a] placeholder:text-[#4a4a4a]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterTagId("")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterTagId === ""
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#6b7280] hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              Todas ({notes.length})
            </button>
            {tags.map((tag) => {
              const count = notes.filter((n) => n.tagId === tag.id).length;
              return (
                <div key={tag.id} className="flex items-center gap-0.5 group/tag">
                  <button
                    onClick={() => setFilterTagId(filterTagId === tag.id ? "" : tag.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                      filterTagId === tag.id ? "text-white" : "text-[#6b7280] hover:text-white"
                    }`}
                    style={filterTagId === tag.id ? { background: tag.color + "22", color: tag.color } : {}}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tag.color }} />
                    {tag.label} ({count})
                  </button>
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="opacity-0 group-hover/tag:opacity-100 transition-opacity text-[#3a3a3a] hover:text-[#ef4444] cursor-pointer p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
            {!showAddTag ? (
              <button
                onClick={() => setShowAddTag(true)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#3a3a3a] hover:text-[#6b7280] transition-colors cursor-pointer"
              >
                <Plus size={11} />
                Nova tag
              </button>
            ) : (
              <form onSubmit={handleAddTag} className="flex items-center gap-1.5">
                <Input
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  placeholder="Nome da tag"
                  autoFocus
                  className="h-6 text-xs bg-[#0f0f0f] border-[#2a2a2a] w-28 px-2"
                />
                <div className="flex gap-1">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`w-4 h-4 rounded-full cursor-pointer transition-all ${newTagColor === c ? "ring-1 ring-white ring-offset-1 ring-offset-[#1a1a1a]" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <button type="submit" className="text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer">OK</button>
                <button type="button" onClick={() => setShowAddTag(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer"><X size={12} /></button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notes list */}
      {!hydrated ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 bg-[#1a1a1a]" />)}
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="text-center py-16 space-y-1">
          <p className="text-sm text-[#4a4a4a]">
            {search ? `Nenhuma nota para "${search}".` : filterTagId ? "Nenhuma nota com essa tag." : "Nenhuma nota ainda."}
          </p>
          <p className="text-xs text-[#3a3a3a]">Escreva algo acima e salve.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleNotes.map((note) => {
            const tag = note.tagId ? tagMap[note.tagId] : undefined;
            const isEditing = editingId === note.id;
            return (
              <div
                key={note.id}
                className="group flex items-start justify-between gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  {tag && (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{ background: tag.color + "22", color: tag.color }}
                    >
                      <span className="w-1 h-1 rounded-full" style={{ background: tag.color }} />
                      {tag.label}
                    </span>
                  )}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        ref={editRef}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); confirmEdit(); }
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full bg-[#0f0f0f] border border-[#3a3a3a] rounded text-sm text-white resize-none outline-none leading-relaxed p-2"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <button onClick={confirmEdit} className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer">
                          <Check size={11} /> Salvar
                        </button>
                        <button onClick={cancelEdit} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">{note.content}</p>
                  )}
                  <p className="text-xs text-[#4a4a4a]">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(note.id, note.content)}
                      className="h-10 w-10 text-[#3a3a3a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNote(note.id)}
                      className="h-10 w-10 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
