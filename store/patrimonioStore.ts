import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PatrimonioSnapshot {
  date: string;        // "yyyy-MM-dd"
  total: number;
  financas: number;
  cripto: number;
  investimentos: number;
  pools: number;
}

interface PatrimonioState {
  snapshots: PatrimonioSnapshot[];
  addSnapshot: (snap: PatrimonioSnapshot) => void;
  hasSnapshotToday: () => boolean;
  getLastN: (n: number) => PatrimonioSnapshot[];
}

export const usePatrimonioStore = create<PatrimonioState>()(
  persist(
    (set, get) => ({
      snapshots: [],

      addSnapshot: (snap) =>
        set((state) => {
          // Replace if same date exists, otherwise append
          const filtered = state.snapshots.filter((s) => s.date !== snap.date);
          const updated = [...filtered, snap].sort((a, b) =>
            a.date.localeCompare(b.date)
          );
          // Keep at most 104 entries (~2 years of weekly snapshots)
          return { snapshots: updated.slice(-104) };
        }),

      hasSnapshotToday: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get().snapshots.some((s) => s.date === today);
      },

      getLastN: (n) => {
        const snaps = get().snapshots;
        return snaps.slice(-n);
      },
    }),
    { name: "patrimonio-store" }
  )
);
