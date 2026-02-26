import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { BodyMetric } from "@/types";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface CorporalState {
  metrics: BodyMetric[];

  addMetric: (m: Omit<BodyMetric, "id" | "createdAt">) => void;
  removeMetric: (id: string) => void;
  editMetric: (id: string, updates: Partial<Omit<BodyMetric, "id" | "createdAt">>) => void;

  loadFromDB: () => Promise<void>;
}

// ─── Sync helper ────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useCorporalStore.getState();
    saveStoreData("corporal", { metrics: s.metrics });
  }, 1000);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCorporalStore = create<CorporalState>()(
  persist(
    (set) => ({
      metrics: [],

      addMetric: (m) => {
        set((state) => ({
          metrics: [
            ...state.metrics,
            { ...m, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ].sort((a, b) => b.date.localeCompare(a.date)),
        }));
        scheduleSync();
      },

      removeMetric: (id) => {
        set((state) => ({ metrics: state.metrics.filter((m) => m.id !== id) }));
        scheduleSync();
      },

      editMetric: (id, updates) => {
        set((state) => ({
          metrics: state.metrics.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }));
        scheduleSync();
      },

      loadFromDB: async () => {
        const data = await loadStoreData("corporal");
        if (!data) return;
        set({ metrics: (data.metrics as BodyMetric[]) ?? [] });
      },
    }),
    {
      name: "segna-corporal",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
