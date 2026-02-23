import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Token, PortfolioSnapshot } from "@/types";
import { format } from "date-fns";

interface DefiState {
  tokens: Token[];
  snapshots: PortfolioSnapshot[];
  addToken: (t: Omit<Token, "id" | "addedAt">) => void;
  removeToken: (id: string) => void;
  updatePrice: (id: string, newPrice: number) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  setAlertPrice: (id: string, price: number) => void;
  saveSnapshot: () => void;
}

export const useDefiStore = create<DefiState>()(
  persist(
    (set, get) => ({
      tokens: [],
      snapshots: [],

      addToken: (t) =>
        set((state) => ({
          tokens: [
            ...state.tokens,
            { ...t, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        })),

      removeToken: (id) =>
        set((state) => ({ tokens: state.tokens.filter((t) => t.id !== id) })),

      updatePrice: (id, newPrice) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, priceInBRL: newPrice } : t
          ),
        })),

      updateQuantity: (id, newQuantity) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, quantity: newQuantity } : t
          ),
        })),

      setAlertPrice: (id, price) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, priceAtAlert: price } : t
          ),
        })),

      saveSnapshot: () => {
        const { tokens, snapshots } = get();
        const today = format(new Date(), "yyyy-MM-dd");
        const total = tokens.reduce((acc, t) => acc + t.quantity * t.priceInBRL, 0);
        const existing = snapshots.find((s) => s.date === today);
        if (existing) {
          set((state) => ({
            snapshots: state.snapshots.map((s) =>
              s.date === today ? { ...s, totalBRL: total } : s
            ),
          }));
        } else {
          set((state) => ({
            snapshots: [...state.snapshots, { date: today, totalBRL: total }].slice(-90),
          }));
        }
      },
    }),
    {
      name: "segna-defi",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
