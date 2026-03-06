import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Transaction, CategoryGoal, MonthlyBudget, SavingsGoal } from "@/types";
import { format, addMonths } from "date-fns";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface FinancasState {
  transactions: Transaction[];
  goals: CategoryGoal[];
  budget: MonthlyBudget | null;
  savingsGoal: SavingsGoal | null;
  customExpenseCategories: string[];
  customIncomeCategories: string[];

  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;

  addGoal: (g: Omit<CategoryGoal, "id" | "createdAt">) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, limitAmount: number) => void;

  setBudget: (limitAmount: number) => void;
  clearBudget: () => void;

  setSavingsGoal: (targetAmount: number) => void;
  clearSavingsGoal: () => void;

  addCustomCategory: (type: "expense" | "income", name: string) => void;
  removeCustomCategory: (type: "expense" | "income", name: string) => void;

  generateRecurring: () => void;

  loadFromDB: () => Promise<void>;
}

// ─── Sync helper ────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useFinancasStore.getState();
    saveStoreData("financas", {
      transactions: s.transactions,
      goals: s.goals,
      budget: s.budget,
      savingsGoal: s.savingsGoal,
      customExpenseCategories: s.customExpenseCategories,
      customIncomeCategories:  s.customIncomeCategories,
    });
  }, 1000);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFinancasStore = create<FinancasState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      budget: null,
      savingsGoal: null,
      customExpenseCategories: [],
      customIncomeCategories: [],

      addTransaction: (t) => {
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
        scheduleSync();
      },

      editTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        scheduleSync();
      },

      addGoal: (g) => {
        set((state) => ({
          goals: [
            ...state.goals.filter((x) => x.category !== g.category),
            { ...g, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removeGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
        scheduleSync();
      },

      updateGoal: (id, limitAmount) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, limitAmount } : g
          ),
        }));
        scheduleSync();
      },

      setBudget: (limitAmount) => {
        set({ budget: { limitAmount } });
        scheduleSync();
      },

      clearBudget: () => {
        set({ budget: null });
        scheduleSync();
      },

      setSavingsGoal: (targetAmount) => {
        set({ savingsGoal: { targetAmount } });
        scheduleSync();
      },

      clearSavingsGoal: () => {
        set({ savingsGoal: null });
        scheduleSync();
      },

      addCustomCategory: (type, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const key = type === "expense" ? "customExpenseCategories" : "customIncomeCategories";
        set((state) => {
          const existing = state[key] as string[];
          if (existing.includes(trimmed)) return state;
          return { [key]: [...existing, trimmed] };
        });
        scheduleSync();
      },

      removeCustomCategory: (type, name) => {
        const key = type === "expense" ? "customExpenseCategories" : "customIncomeCategories";
        set((state) => ({
          [key]: (state[key] as string[]).filter((c) => c !== name),
        }));
        scheduleSync();
      },

      generateRecurring: () => {
        const { transactions } = get();
        const thisMonth = format(new Date(), "yyyy-MM");
        const lastMonth = format(addMonths(new Date(), -1), "yyyy-MM");

        const lastMonthRecurring = transactions.filter(
          (t) => t.recurring && t.date.startsWith(lastMonth)
        );

        const thisMonthKeys = new Set(
          transactions
            .filter((t) => t.date.startsWith(thisMonth))
            .map((t) => `${t.description}|${t.amount}|${t.category}`)
        );

        const toGenerate = lastMonthRecurring.filter(
          (t) => !thisMonthKeys.has(`${t.description}|${t.amount}|${t.category}`)
        );

        if (toGenerate.length === 0) return;

        set((state) => ({
          transactions: [
            ...state.transactions,
            ...toGenerate.map((t) => ({
              ...t,
              id: crypto.randomUUID(),
              date: t.date.replace(lastMonth, thisMonth),
              createdAt: new Date().toISOString(),
            })),
          ],
        }));
        scheduleSync();
      },

      loadFromDB: async () => {
        const data = await loadStoreData("financas");
        if (!data) return;
        set({
          transactions:            (data.transactions as Transaction[]) ?? [],
          goals:                   (data.goals as CategoryGoal[])       ?? [],
          budget:                  (data.budget as MonthlyBudget)       ?? null,
          savingsGoal:             (data.savingsGoal as SavingsGoal)    ?? null,
          customExpenseCategories: (data.customExpenseCategories as string[]) ?? [],
          customIncomeCategories:  (data.customIncomeCategories  as string[]) ?? [],
        });
      },
    }),
    {
      name: "segna-financas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Helpers de cálculo ──────────────────────────────────────────────────────

export function calcBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
    0
  );
}

export function calcTotalIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
}

export function calcTotalExpenses(transactions: Transaction[]): number {
  return transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
}

export function calcCategorySpendThisMonth(
  transactions: Transaction[],
  category: string
): number {
  const thisMonth = format(new Date(), "yyyy-MM");
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === category &&
        t.date.startsWith(thisMonth)
    )
    .reduce((acc, t) => acc + t.amount, 0);
}
