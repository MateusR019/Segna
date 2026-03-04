import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadStoreData, saveStoreData } from "@/lib/db";

interface SettingsState {
  // Perfil
  displayName: string;
  avatarColor: string;  // cor do avatar gerado (hex)

  // Configurações corporais
  walletAddress: string;
  height: number; // cm — para cálculo de IMC

  // Aparência
  theme: "dark" | "light" | "auto";

  // Ações
  setDisplayName: (name: string) => void;
  setAvatarColor: (color: string) => void;
  setWalletAddress: (address: string) => void;
  setHeight: (h: number) => void;
  setTheme: (t: "dark" | "light" | "auto") => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useSettingsStore.getState();
    saveStoreData("settings", {
      displayName: s.displayName,
      avatarColor: s.avatarColor,
      walletAddress: s.walletAddress,
      height: s.height,
      theme: s.theme,
    });
  }, 1000);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: "",
      avatarColor: "#6366f1",
      walletAddress: "",
      height: 0,
      theme: "dark",

      setDisplayName: (name) => { set({ displayName: name.trim() }); scheduleSync(); },
      setAvatarColor: (color) => { set({ avatarColor: color }); scheduleSync(); },
      setWalletAddress: (address) => { set({ walletAddress: address.trim() }); scheduleSync(); },
      setHeight: (h) => { set({ height: h }); scheduleSync(); },
      setTheme: (t) => { set({ theme: t }); scheduleSync(); },

      loadFromDB: async () => {
        const data = await loadStoreData("settings");
        if (!data) return;
        set({
          displayName: (data.displayName as string) ?? "",
          avatarColor: (data.avatarColor as string) ?? "#6366f1",
          walletAddress: (data.walletAddress as string) ?? "",
          height: (data.height as number) ?? 0,
          theme: (data.theme as "dark" | "light" | "auto") ?? "dark",
        });
      },
    }),
    { name: "segna-settings", storage: createJSONStorage(() => localStorage) }
  )
);
