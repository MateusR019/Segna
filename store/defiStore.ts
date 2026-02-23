import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Token } from "@/types";

interface DefiState {
  tokens: Token[];
  addToken: (t: Omit<Token, "id" | "addedAt">) => void;
  removeToken: (id: string) => void;
  updatePrice: (id: string, newPrice: number) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
}

export const useDefiStore = create<DefiState>()(
  persist(
    (set) => ({
      tokens: [],

      addToken: (t) =>
        set((state) => ({
          tokens: [
            ...state.tokens,
            {
              ...t,
              id: crypto.randomUUID(),
              addedAt: new Date().toISOString(),
            },
          ],
        })),

      removeToken: (id) =>
        set((state) => ({
          tokens: state.tokens.filter((t) => t.id !== id),
        })),

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
    }),
    {
      name: "segna-defi",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
