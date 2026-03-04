import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface SettingsState {
  walletAddress: string;
  height: number; // cm — para cálculo de IMC
  setWalletAddress: (address: string) => void;
  setHeight: (h: number) => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useSettingsStore.getState();
    saveStoreData("settings", { walletAddress: s.walletAddress, height: s.height });
  }, 1000);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      walletAddress: "",
      height: 0,
      setWalletAddress: (address) => { set({ walletAddress: address.trim() }); scheduleSync(); },
      setHeight: (h) => { set({ height: h }); scheduleSync(); },
      loadFromDB: async () => {
        const data = await loadStoreData("settings");
        if (!data) return;
        set({
          walletAddress: (data.walletAddress as string) ?? "",
          height: (data.height as number) ?? 0,
        });
      },
    }),
    { name: "segna-settings", storage: createJSONStorage(() => localStorage) }
  )
);
