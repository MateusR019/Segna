"use client";
import { useState, useRef, useEffect } from "react";
import { useNotasStore } from "@/store/notasStore";
import { useHydrated } from "@/hooks/useHydrated";
import { useToast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Eraser, Plus, Tag, X, Search, Check, Pencil, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TAG_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#22c55e",
  "#06b6d4", "#8b5cf6", "#f97316", "#ef4444",
];

/** Parse inline markdown tokens: **bold**, _italic_, `code` */
function parseInline(line: string, baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const pattern = /(\*\*(.+?)\*\*|_(.+?)_|`(.+?)`)/g;
  let last = 0;
  let key = baseKey;
  let match;
  while ((match = pattern.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    if (match[0].startsWith("**"))
      parts.push(<strong key={key++} className="font-semibold text-white">{match[2]}</strong>);
    else if (match[0].startsWith("_"))
      parts.push(<em key={key++} className="italic text-[#d1d5db]">{match[3]}</em>);
    else if (match[0].startsWith("`"))
      parts.push(<code key={key++} className="text-xs bg-[#2a2a2a] text-[#a78bfa] px-1 py-0.5 rounded font-mono">{match[4]}</code>);
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

/** Render markdown as React nodes: headings, bold, italic, code, blank-line paragraphs */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blank line — small spacer
    if (line.trim() === "") {
      nodes.push(<span key={key++} className="block h-2" />);
      continue;
    }

    // Heading ## / #
    if (line.startsWith("## ")) {
      nodes.push(
        <span key={key++} className="block text-base font-semibold text-white mt-1 mb-0.5">
          {parseInline(line.slice(3), key)}
        </span>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <span key={key++} className="block text-lg font-bold text-white mt-1 mb-0.5">
          {parseInline(line.slice(2), key)}
        </span>
      );
      continue;
    }

    // Regular line with inline tokens
    const inline = parseInline(line, key);
    key += 100;
    nodes.push(
      <span key={key++} className="block leading-relaxed">
        {inline.length > 0 ? inline : line}
      </span>
    );
  }

  return nodes;
}

// Checklist renderer: lines starting with "[ ]" or "[x]"
function ChecklistView({
  content,
  onToggle,
}: {
  content: string;
  onToggle: (newContent: string) => void;
}) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isDone = line.startsWith("[x] ") || line.startsWith("[X] ");
        const isTodo = line.startsWith("[ ] ");
        const isCheckLine = isDone || isTodo;
        const text = isCheckLine ? line.slice(4) : line;

        if (!isCheckLine) {
          return <p key={i} className="text-xs text-[#6b7280] leading-relaxed">{line}</p>;
        }

        return (
          <button
            key={i}
            onClick={() => {
              const newLines = [...lines];
              newLines[i] = isDone ? `[ ] ${text}` : `[x] ${text}`;
              onToggle(newLines.join("\n"));
            }}
            className="flex items-start gap-2 w-full text-left cursor-pointer"
          >
            <div className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isDone ? "bg-[#22c55e] border-[#22c55e]" : "border-[#3a3a3a]"}`}>
              {isDone && <Check size={10} className="text-black" />}
            </div>
            <span className={`text-sm leading-relaxed ${isDone ? "line-through text-[#4a4a4a]" : "text-white"}`}>
              {text}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function NotasPage() {
  const hydrated = useHydrated();
  const { notes, tags, addNote, editNote, removeNote, clearAll, addTag, removeTag, togglePin } =
    useNotasStore();
  const { success, error: toastError } = useToast();

  const [draft, setDraft] = useState("");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [filterTagId, setFilterTagId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [editDraft]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
  }

  function readImageFile(file: File): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);
    const imgItem = items.find((i) => i.type.startsWith("image/"));
    if (imgItem) {
      e.preventDefault();
      const file = imgItem.getAsFile();
      if (file) {
        const dataUrl = await readImageFile(file);
        setDraftImage(dataUrl);
      }
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      const dataUrl = await readImageFile(file);
      setDraftImage(dataUrl);
    }
  }

  function submit() {
    if (!draft.trim() && !draftImage) return;
    const isChecklistContent = /^\[[ xX]\] /.test(draft.trim());
    addNote(draft, selectedTagId || undefined, isChecklistContent ? "checklist" : "text", draftImage ?? undefined);
    setDraft("");
    setDraftImage(null);
    setSelectedTagId("");
    textareaRef.current?.focus();
    success("Nota salva!");
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
    success("Nota atualizada!");
  }

  function cancelEdit() { setEditingId(null); setEditDraft(""); }

  function handleAddTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagLabel.trim()) return;
    addTag(newTagLabel, newTagColor);
    setNewTagLabel("");
    setNewTagColor(TAG_COLORS[0]);
    setShowAddTag(false);
  }

  const tagMap = Object.fromEntries(tags.map((t) => [t.id, t]));

  // Pinned first, then rest
  const filtered = notes.filter((n) => {
    const matchTag = !filterTagId || n.tagId === filterTagId;
    const matchSearch = !search.trim() || n.content.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });
  const visibleNotes = [
    ...filtered.filter((n) => n.pinned),
    ...filtered.filter((n) => !n.pinned),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Notas</h1>
          <p className="text-sm text-[#6b7280]">Anote e vá embora</p>
        </div>
        {hydrated && notes.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer">
            <Eraser size={13} className="mr-1.5" />
            Limpar tudo
          </Button>
        )}
      </div>

      {/* Input box */}
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="O que está na sua cabeça? (Ctrl+Enter para salvar, cole imagens)"
          rows={3}
          className="w-full bg-transparent text-sm text-white placeholder-[#4a4a4a] resize-none outline-none leading-relaxed"
        />
        {/* Image preview */}
        {draftImage && (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draftImage} alt="preview" className="max-h-40 rounded-lg border border-[#2a2a2a] object-contain" />
            <button
              type="button"
              onClick={() => setDraftImage(null)}
              className="absolute top-1 right-1 bg-[#0f0f0f]/80 rounded-full p-0.5 text-[#9ca3af] hover:text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Tag selector */}
        {hydrated && (
          <div className="flex flex-wrap gap-1.5 border-t border-[#2a2a2a] pt-3">
            <button
              type="button"
              onClick={() => setSelectedTagId("")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                selectedTagId === "" ? "bg-[#2a2a2a] text-white" : "text-[#4a4a4a] hover:text-[#6b7280]"
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
            {draft.length > 0 ? `${draft.length} chars` : "Ctrl+Enter para salvar"}
          </span>
          <Button size="sm" onClick={submit} disabled={!draft.trim()}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium text-xs cursor-pointer disabled:opacity-30">
            Salvar
          </Button>
        </div>
      </div>

      {/* Filter bar + search */}
      {hydrated && (
        <div className="space-y-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nas notas..."
              className="pl-8 h-10 text-sm bg-[#1a1a1a] border-[#2a2a2a] placeholder:text-[#4a4a4a]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterTagId("")}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filterTagId === "" ? "bg-[#2a2a2a] text-white" : "text-[#6b7280] hover:text-white hover:bg-[#1f1f1f]"
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
                <Input value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)} placeholder="Nome da tag" autoFocus className="h-6 text-xs bg-[#0f0f0f] border-[#2a2a2a] w-28 px-2" />
                <div className="flex gap-1">
                  {TAG_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setNewTagColor(c)}
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
        <div className="columns-1 md:columns-2 xl:columns-3 gap-3 space-y-0">
          {visibleNotes.map((note) => {
            const tag = note.tagId ? tagMap[note.tagId] : undefined;
            const isEditing = editingId === note.id;
            const isChecklist = note.mode === "checklist";

            return (
              <div
                key={note.id}
                className={`break-inside-avoid mb-3 flex items-start justify-between gap-3 rounded-xl px-4 py-3 transition-colors border card-hover ${
                  note.pinned
                    ? "bg-[#1a1a1f] border-[#6366f1]/50 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]"
                    : "bg-[#1a1a1a] border-[#2a2a2a]"
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Tag + mode badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.pinned && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#a78bfa]">
                        <Pin size={9} /> fixada
                      </span>
                    )}
                    {tag && (
                      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: tag.color + "22", color: tag.color }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: tag.color }} />
                        {tag.label}
                      </span>
                    )}
                  </div>

                  {/* Content */}
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
                        <button onClick={cancelEdit} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">Cancelar</button>
                      </div>
                    </div>
                  ) : isChecklist ? (
                    <ChecklistView
                      content={note.content}
                      onToggle={(newContent) => editNote(note.id, newContent)}
                    />
                  ) : (
                    <div className="text-sm text-[#e5e5e5] break-words leading-relaxed">
                      {renderMarkdown(note.content)}
                    </div>
                  )}

                  {/* Image attachment */}
                  {note.image && !isEditing && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={note.image}
                      alt="imagem"
                      className="max-h-48 rounded-lg border border-[#2a2a2a] object-contain cursor-pointer"
                      onClick={() => window.open(note.image)}
                    />
                  )}

                  <p className="text-xs text-[#4a4a4a]">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>

                {/* Actions */}
                {!isEditing && (
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    {/* Pin */}
                    <Button variant="ghost" size="icon"
                      onClick={() => { togglePin(note.id); success(note.pinned ? "Nota desafixada" : "Nota fixada!"); }}
                      className="h-9 w-9 hover:bg-transparent cursor-pointer"
                      style={{ color: note.pinned ? "#a78bfa" : "#3a3a3a" }}
                      title={note.pinned ? "Desafixar" : "Fixar nota"}
                    >
                      <Pin size={13} />
                    </Button>
                    {/* Edit */}
                    <Button variant="ghost" size="icon"
                      onClick={() => startEdit(note.id, note.content)}
                      className="h-9 w-9 text-[#3a3a3a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer">
                      <Pencil size={13} />
                    </Button>
                    {/* Delete — confirmação */}
                    {confirmDeleteId === note.id ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <Button variant="ghost" size="icon"
                          onClick={() => { removeNote(note.id); setConfirmDeleteId(null); success("Nota excluída"); }}
                          className="h-8 w-8 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer">
                          <Check size={13} />
                        </Button>
                        <Button variant="ghost" size="icon"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-8 w-8 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer">
                          <X size={13} />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon"
                        onClick={() => setConfirmDeleteId(note.id)}
                        className="h-9 w-9 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer">
                        <Trash2 size={13} />
                      </Button>
                    )}
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
