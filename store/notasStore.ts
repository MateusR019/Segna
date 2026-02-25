import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Note, NoteTag } from "@/types";

const DEFAULT_TAGS: NoteTag[] = [
  { id: "ideias", label: "Ideias", color: "#6366f1" },
  { id: "filmes", label: "Filmes / Séries", color: "#ec4899" },
  { id: "livros", label: "Livros", color: "#f59e0b" },
];

interface NotasState {
  notes: Note[];
  tags: NoteTag[];
  addNote: (content: string, tagId?: string, mode?: "text" | "checklist", image?: string) => void;
  editNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  clearAll: () => void;
  addTag: (label: string, color: string) => void;
  removeTag: (id: string) => void;
  togglePin: (id: string) => void;
  setNoteMode: (id: string, mode: "text" | "checklist") => void;
}

export const useNotasStore = create<NotasState>()(
  persist(
    (set) => ({
      notes: [],
      tags: DEFAULT_TAGS,

      addNote: (content, tagId, mode, image) =>
        set((s) => ({
          notes: [
            {
              id: crypto.randomUUID(),
              content: content.trim(),
              image: image || undefined,
              tagId: tagId || undefined,
              createdAt: new Date().toISOString(),
              mode: mode ?? "text",
            },
            ...s.notes,
          ],
        })),

      editNote: (id, content) =>
        set((s) => {
          const trimmed = content.trim();
          // Auto-detect mode on edit too
          const newMode: "text" | "checklist" = /^\[[ xX]\] /.test(trimmed)
            ? "checklist"
            : "text";
          return {
            notes: s.notes.map((n) =>
              n.id === id ? { ...n, content: trimmed, mode: newMode } : n
            ),
          };
        }),

      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      clearAll: () => set({ notes: [] }),

      addTag: (label, color) =>
        set((s) => ({
          tags: [
            ...s.tags,
            { id: crypto.randomUUID(), label: label.trim(), color },
          ],
        })),

      removeTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          notes: s.notes.map((n) =>
            n.tagId === id ? { ...n, tagId: undefined } : n
          ),
        })),

      togglePin: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n
          ),
        })),

      setNoteMode: (id, mode) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, mode } : n
          ),
        })),
    }),
    {
      name: "segna-notas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
