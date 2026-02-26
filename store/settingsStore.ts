import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface SettingsState {
  walletAddress: string;
  debankApiKey: string;
  setWalletAddress: (address: string) => void;
  setDebankApiKey: (key: string) => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useSettingsStore.getState();
    saveStoreData("settings", { walletAddress: s.walletAddress, debankApiKey: s.debankApiKey });
  }, 1000);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      walletAddress: "",
      debankApiKey: "",
      setWalletAddress: (address) => { set({ walletAddress: address.trim() }); scheduleSync(); },
      setDebankApiKey: (key) => { set({ debankApiKey: key.trim() }); scheduleSync(); },
      loadFromDB: async () => {
        const data = await loadStoreData("settings");
        if (!data) return;
        set({ walletAddress: (data.walletAddress as string) ?? "", debankApiKey: (data.debankApiKey as string) ?? "" });
      },
    }),
    { name: "segna-settings", storage: createJSONStorage(() => localStorage) }
  )
);
