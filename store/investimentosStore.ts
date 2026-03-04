import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Investment } from "@/types";
import { loadStoreData, saveStoreData } from "@/lib/db";
import { useFinancasStore } from "@/store/financasStore";

interface InvestimentosState {
  investments: Investment[];
  addInvestment: (inv: Omit<Investment, "id" | "createdAt">) => void;
  removeInvestment: (id: string) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useInvestimentosStore.getState();
    saveStoreData("investimentos", { investments: s.investments });
  }, 1000);
}

export const useInvestimentosStore = create<InvestimentosState>()(
  persist(
    (set) => ({
      investments: [],

      addInvestment: (inv) => {
        set((state) => ({
          investments: [
            ...state.investments,
            { ...inv, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removeInvestment: (id) => {
        set((state) => ({
          investments: state.investments.filter((i) => i.id !== id),
        }));
        // Limpa referências órfãs nas transações de finanças
        const financas = useFinancasStore.getState();
        financas.transactions
          .filter((t) => t.investmentId === id)
          .forEach((t) => financas.editTransaction(t.id, { investmentId: undefined }));
        scheduleSync();
      },

      updateInvestment: (id, updates) => {
        set((state) => ({
          investments: state.investments.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));
        scheduleSync();
      },

      loadFromDB: async () => {
        const data = await loadStoreData("investimentos");
        if (!data) return;
        set({ investments: (data.investments as Investment[]) ?? [] });
      },
    }),
    {
      name: "segna-investimentos",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
