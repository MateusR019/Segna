import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Transaction, CategoryGoal, MonthlyBudget, ExpenseCategory } from "@/types";
import { format, addMonths } from "date-fns";

interface FinancasState {
  transactions: Transaction[];
  goals: CategoryGoal[];
  budget: MonthlyBudget | null;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  removeTransaction: (id: string) => void;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;

  addGoal: (g: Omit<CategoryGoal, "id" | "createdAt">) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, limitAmount: number) => void;

  setBudget: (limitAmount: number) => void;
  clearBudget: () => void;

  generateRecurring: () => void;
}

export const useFinancasStore = create<FinancasState>()(
  persist(
    (set, get) => ({
      transactions: [],
      goals: [],
      budget: null,

      addTransaction: (t) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...t,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      editTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      addGoal: (g) =>
        set((state) => ({
          // one goal per category
          goals: [
            ...state.goals.filter((x) => x.category !== g.category),
            {
              ...g,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      updateGoal: (id, limitAmount) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, limitAmount } : g
          ),
        })),

      setBudget: (limitAmount) => set({ budget: { limitAmount } }),
      clearBudget: () => set({ budget: null }),

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
          (t) =>
            !thisMonthKeys.has(`${t.description}|${t.amount}|${t.category}`)
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
      },
    }),
    {
      name: "segna-financas",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function calcBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
    0
  );
}

export function calcTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
}

export function calcTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
}

export function calcCategorySpendThisMonth(
  transactions: Transaction[],
  category: ExpenseCategory
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
