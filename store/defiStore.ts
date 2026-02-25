import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Token, PortfolioSnapshot, PriceEntry, ExchangeRate, LiquidityPool } from "@/types";
import { format } from "date-fns";

interface DefiState {
  tokens: Token[];
  snapshots: PortfolioSnapshot[];
  priceHistory: PriceEntry[];
  exchangeRate: ExchangeRate | null;
  pools: LiquidityPool[];

  addToken: (t: Omit<Token, "id" | "addedAt">) => void;
  removeToken: (id: string) => void;
  updatePrice: (id: string, newPrice: number) => void;
  updatePriceUSD: (id: string, priceUSD: number) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  setAlertPrice: (id: string, price: number) => void;
  setAvgCost: (id: string, avgCost: number) => void;
  setExchangeRate: (usdToBRL: number) => void;
  saveSnapshot: () => void;
  addPriceEntry: (tokenId: string, date: string, priceBRL: number) => void;
  removePriceEntry: (id: string) => void;

  addPool: (pool: Omit<LiquidityPool, "id" | "addedAt">) => void;
  removePool: (id: string) => void;
  updatePool: (id: string, updates: Partial<LiquidityPool>) => void;
}

export const useDefiStore = create<DefiState>()(
  persist(
    (set, get) => ({
      tokens: [],
      snapshots: [],
      priceHistory: [],
      exchangeRate: null,
      pools: [],

      addToken: (t) =>
        set((state) => ({
          tokens: [
            ...state.tokens,
            { ...t, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        })),

      removeToken: (id) =>
        set((state) => ({
          tokens: state.tokens.filter((t) => t.id !== id),
          priceHistory: state.priceHistory.filter((e) => e.tokenId !== id),
        })),

      updatePrice: (id, newPrice) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, priceInBRL: newPrice } : t
          ),
        })),

      updatePriceUSD: (id, priceUSD) =>
        set((state) => {
          const rate = state.exchangeRate?.usdToBRL ?? 0;
          return {
            tokens: state.tokens.map((t) =>
              t.id === id
                ? { ...t, priceInUSD: priceUSD, priceInBRL: rate > 0 ? priceUSD * rate : t.priceInBRL }
                : t
            ),
          };
        }),

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

      setAvgCost: (id, avgCost) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, avgCostBRL: avgCost } : t
          ),
        })),

      setExchangeRate: (usdToBRL) =>
        set({ exchangeRate: { usdToBRL, updatedAt: new Date().toISOString() } }),

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

      addPriceEntry: (tokenId, date, priceBRL) =>
        set((state) => ({
          priceHistory: [
            ...state.priceHistory.filter(
              (e) => !(e.tokenId === tokenId && e.date === date)
            ),
            { id: crypto.randomUUID(), tokenId, date, priceBRL },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        })),

      removePriceEntry: (id) =>
        set((state) => ({
          priceHistory: state.priceHistory.filter((e) => e.id !== id),
        })),

      addPool: (pool) =>
        set((state) => ({
          pools: [
            ...state.pools,
            { ...pool, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        })),

      removePool: (id) =>
        set((state) => ({
          pools: state.pools.filter((p) => p.id !== id),
        })),

      updatePool: (id, updates) =>
        set((state) => ({
          pools: state.pools.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
    }),
    {
      name: "segna-defi",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
