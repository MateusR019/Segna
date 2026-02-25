import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  walletAddress: string;
  debankApiKey: string;
  setWalletAddress: (address: string) => void;
  setDebankApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      walletAddress: "",
      debankApiKey: "",
      setWalletAddress: (address) => set({ walletAddress: address.trim() }),
      setDebankApiKey: (key) => set({ debankApiKey: key.trim() }),
    }),
    {
      name: "segna-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
