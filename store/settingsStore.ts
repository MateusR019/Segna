import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadStoreData, saveStoreData } from "@/lib/db";

export type AppTheme    = "dark" | "light" | "auto";
export type AppLanguage = "pt" | "en";

interface SettingsState {
  // Perfil
  displayName: string;
  avatarColor: string;

  // Configurações corporais
  walletAddress: string;
  zerionApiKey:  string; // Zerion API free key — dashboard.zerion.io
  height: number; // cm — para cálculo de IMC

  // Aparência
  theme: AppTheme;
  language: AppLanguage;

  // Ações
  setDisplayName:   (name: string)   => void;
  setAvatarColor:   (color: string)  => void;
  setWalletAddress: (addr: string)   => void;
  setZerionApiKey:  (key: string)    => void;
  setHeight:        (h: number)      => void;
  setTheme:         (t: AppTheme)    => void;
  setLanguage:      (l: AppLanguage) => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useSettingsStore.getState();
    saveStoreData("settings", {
      displayName:   s.displayName,
      avatarColor:   s.avatarColor,
      walletAddress: s.walletAddress,
      zerionApiKey:  s.zerionApiKey,
      height:        s.height,
      theme:         s.theme,
      language:      s.language,
    });
  }, 1000);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName:   "",
      avatarColor:   "#6366f1",
      walletAddress: "",
      zerionApiKey:  "",
      height:        0,
      theme:         "dark",
      language:      "pt",

      setDisplayName:   (name) => { set({ displayName: name.trim() });   scheduleSync(); },
      setAvatarColor:   (color) => { set({ avatarColor: color });         scheduleSync(); },
      setWalletAddress: (addr) => { set({ walletAddress: addr.trim() }); scheduleSync(); },
      setZerionApiKey:  (key)  => { set({ zerionApiKey: key.trim() });   scheduleSync(); },
      setHeight:        (h)    => { set({ height: h });                   scheduleSync(); },
      setTheme:         (t)    => { set({ theme: t });                    scheduleSync(); },
      setLanguage:      (l)    => { set({ language: l });                 scheduleSync(); },

      loadFromDB: async () => {
        const data = await loadStoreData("settings");
        if (!data) return;
        set({
          displayName:   (data.displayName   as string)      ?? "",
          avatarColor:   (data.avatarColor   as string)      ?? "#6366f1",
          walletAddress: (data.walletAddress as string)      ?? "",
          zerionApiKey:  (data.zerionApiKey  as string)      ?? "",
          height:        (data.height        as number)      ?? 0,
          theme:         (data.theme         as AppTheme)    ?? "dark",
          language:      (data.language      as AppLanguage) ?? "pt",
        });
      },
    }),
    { name: "segna-settings", storage: createJSONStorage(() => localStorage) }
  )
);
