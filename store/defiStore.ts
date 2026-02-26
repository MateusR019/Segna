import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Token, PortfolioSnapshot, PriceEntry, ExchangeRate, LiquidityPool, WatchToken } from "@/types";
import { format } from "date-fns";
import { loadStoreData, saveStoreData } from "@/lib/db";

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
  setAvgCostUSD: (id: string, avgCostUSD: number) => void;
  setExchangeRate: (usdToBRL: number) => void;
  saveSnapshot: () => void;
  addPriceEntry: (tokenId: string, date: string, priceBRL: number) => void;
  removePriceEntry: (id: string) => void;

  addPool: (pool: Omit<LiquidityPool, "id" | "addedAt">) => void;
  removePool: (id: string) => void;
  updatePool: (id: string, updates: Partial<LiquidityPool>) => void;

  watchlist: WatchToken[];
  addWatch: (w: Omit<WatchToken, "id" | "addedAt">) => void;
  removeWatch: (id: string) => void;
  updateWatch: (id: string, updates: Partial<WatchToken>) => void;

  loadFromDB: () => Promise<void>;
}

// ─── Sync helper ────────────────────────────────────────────────────────────

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useDefiStore.getState();
    saveStoreData("defi", {
      tokens:       s.tokens,
      snapshots:    s.snapshots,
      priceHistory: s.priceHistory,
      exchangeRate: s.exchangeRate,
      pools:        s.pools,
      watchlist:    s.watchlist,
    });
  }, 1000);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDefiStore = create<DefiState>()(
  persist(
    (set, get) => ({
      tokens: [],
      snapshots: [],
      priceHistory: [],
      exchangeRate: null,
      pools: [],
      watchlist: [],

      addToken: (t) => {
        set((state) => ({
          tokens: [
            ...state.tokens,
            { ...t, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removeToken: (id) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.id !== id),
          priceHistory: state.priceHistory.filter((e) => e.tokenId !== id),
        }));
        scheduleSync();
      },

      updatePrice: (id, newPrice) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, priceInBRL: newPrice } : t
          ),
        }));
        scheduleSync();
      },

      updatePriceUSD: (id, priceUSD) => {
        set((state) => {
          const rate = state.exchangeRate?.usdToBRL ?? 0;
          return {
            tokens: state.tokens.map((t) =>
              t.id === id
                ? {
                    ...t,
                    priceInUSD: priceUSD,
                    priceInBRL: rate > 0 ? priceUSD * rate : t.priceInBRL,
                  }
                : t
            ),
          };
        });
        scheduleSync();
      },

      updateQuantity: (id, newQuantity) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, quantity: newQuantity } : t
          ),
        }));
        scheduleSync();
      },

      setAlertPrice: (id, price) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, priceAtAlert: price } : t
          ),
        }));
        scheduleSync();
      },

      setAvgCost: (id, avgCost) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, avgCostBRL: avgCost } : t
          ),
        }));
        scheduleSync();
      },

      setAvgCostUSD: (id, avgCostUSD) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, avgCostUSD } : t
          ),
        }));
        scheduleSync();
      },

      setExchangeRate: (usdToBRL) => {
        set({ exchangeRate: { usdToBRL, updatedAt: new Date().toISOString() } });
        scheduleSync();
      },

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
        scheduleSync();
      },

      addPriceEntry: (tokenId, date, priceBRL) => {
        set((state) => ({
          priceHistory: [
            ...state.priceHistory.filter(
              (e) => !(e.tokenId === tokenId && e.date === date)
            ),
            { id: crypto.randomUUID(), tokenId, date, priceBRL },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        }));
        scheduleSync();
      },

      removePriceEntry: (id) => {
        set((state) => ({
          priceHistory: state.priceHistory.filter((e) => e.id !== id),
        }));
        scheduleSync();
      },

      addPool: (pool) => {
        set((state) => ({
          pools: [
            ...state.pools,
            { ...pool, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removePool: (id) => {
        set((state) => ({
          pools: state.pools.filter((p) => p.id !== id),
        }));
        scheduleSync();
      },

      updatePool: (id, updates) => {
        set((state) => ({
          pools: state.pools.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        scheduleSync();
      },

      addWatch: (w) => {
        set((state) => ({
          watchlist: [
            ...state.watchlist,
            { ...w, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        }));
        scheduleSync();
      },

      removeWatch: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.id !== id),
        }));
        scheduleSync();
      },

      updateWatch: (id, updates) => {
        set((state) => ({
          watchlist: state.watchlist.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
        scheduleSync();
      },

      loadFromDB: async () => {
        const data = await loadStoreData("defi");
        if (!data) return;
        set({
          tokens:       (data.tokens as Token[])                ?? [],
          snapshots:    (data.snapshots as PortfolioSnapshot[]) ?? [],
          priceHistory: (data.priceHistory as PriceEntry[])     ?? [],
          exchangeRate: (data.exchangeRate as ExchangeRate)     ?? null,
          pools:        (data.pools as LiquidityPool[])         ?? [],
          watchlist:    (data.watchlist as WatchToken[])        ?? [],
        });
      },
    }),
    {
      name: "segna-defi",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
