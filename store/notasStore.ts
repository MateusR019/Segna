import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Note } from "@/types";

interface NotasState {
  notes: Note[];
  addNote: (content: string) => void;
  removeNote: (id: string) => void;
  clearAll: () => void;
}

export const useNotasStore = create<NotasState>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (content) =>
        set((s) => ({
          notes: [
            {
              id: crypto.randomUUID(),
              content: content.trim(),
              createdAt: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),
      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      clearAll: () => set({ notes: [] }),
    }),
    {
      name: "segna-notas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
