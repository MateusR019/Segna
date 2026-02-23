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
  addNote: (content: string, tagId?: string) => void;
  editNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  clearAll: () => void;
  addTag: (label: string, color: string) => void;
  removeTag: (id: string) => void;
}

export const useNotasStore = create<NotasState>()(
  persist(
    (set) => ({
      notes: [],
      tags: DEFAULT_TAGS,
      addNote: (content, tagId) =>
        set((s) => ({
          notes: [
            {
              id: crypto.randomUUID(),
              content: content.trim(),
              tagId: tagId || undefined,
              createdAt: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),
      editNote: (id, content) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, content: content.trim() } : n
          ),
        })),
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
          // detach notes that used this tag
          notes: s.notes.map((n) =>
            n.tagId === id ? { ...n, tagId: undefined } : n
          ),
        })),
    }),
    {
      name: "segna-notas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
