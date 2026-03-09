import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadStoreData, saveStoreData } from "@/lib/db";

export type AppTheme    = "dark" | "light" | "auto";
export type AppLanguage = "pt" | "en";

interface SettingsState {
  // Perfil
  displayName: string;
  avatarColor: string;
  birthDate:   string; // "YYYY-MM-DD" or ""
  joinedAt:    string; // ISO timestamp, set once on first use

  // Configurações corporais
  walletAddress: string;
  zerionApiKey:  string; // Zerion API free key — dashboard.zerion.io
  height: number; // cm — para cálculo de IMC

  // Aparência
  theme: AppTheme;
  language: AppLanguage;

  // Notificações
  notificationsEnabled: boolean;
  notificationTime:     string; // "HH:MM"

  // Ações
  setDisplayName:          (name: string)   => void;
  setAvatarColor:          (color: string)  => void;
  setBirthDate:            (d: string)      => void;
  setWalletAddress:        (addr: string)   => void;
  setZerionApiKey:         (key: string)    => void;
  setHeight:               (h: number)      => void;
  setTheme:                (t: AppTheme)    => void;
  setLanguage:             (l: AppLanguage) => void;
  setNotificationsEnabled: (v: boolean)     => void;
  setNotificationTime:     (t: string)      => void;
  loadFromDB: () => Promise<void>;
}

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const s = useSettingsStore.getState();
    saveStoreData("settings", {
      displayName:          s.displayName,
      avatarColor:          s.avatarColor,
      birthDate:            s.birthDate,
      joinedAt:             s.joinedAt,
      walletAddress:        s.walletAddress,
      zerionApiKey:         s.zerionApiKey,
      height:               s.height,
      theme:                s.theme,
      language:             s.language,
      notificationsEnabled: s.notificationsEnabled,
      notificationTime:     s.notificationTime,
    });
  }, 1000);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName:          "",
      avatarColor:          "#6366f1",
      birthDate:            "",
      joinedAt:             new Date().toISOString(),
      walletAddress:        "",
      zerionApiKey:         "",
      height:               0,
      theme:                "dark",
      language:             "pt",
      notificationsEnabled: false,
      notificationTime:     "08:00",

      setDisplayName:          (name)  => { set({ displayName: name.trim() });         scheduleSync(); },
      setAvatarColor:          (color) => { set({ avatarColor: color });               scheduleSync(); },
      setBirthDate:            (d)     => { set({ birthDate: d });                     scheduleSync(); },
      setWalletAddress:        (addr)  => { set({ walletAddress: addr.trim() });       scheduleSync(); },
      setZerionApiKey:         (key)   => { set({ zerionApiKey: key.trim() });         scheduleSync(); },
      setHeight:               (h)     => { set({ height: h });                        scheduleSync(); },
      setTheme:                (t)     => { set({ theme: t });                         scheduleSync(); },
      setLanguage:             (l)     => { set({ language: l });                      scheduleSync(); },
      setNotificationsEnabled: (v)     => { set({ notificationsEnabled: v });          scheduleSync(); },
      setNotificationTime:     (t)     => { set({ notificationTime: t });              scheduleSync(); },

      loadFromDB: async () => {
        const data = await loadStoreData("settings");
        if (!data) return;
        set({
          displayName:          (data.displayName          as string)      ?? "",
          avatarColor:          (data.avatarColor          as string)      ?? "#6366f1",
          birthDate:            (data.birthDate            as string)      ?? "",
          joinedAt:             (data.joinedAt             as string)      ?? new Date().toISOString(),
          walletAddress:        (data.walletAddress        as string)      ?? "",
          zerionApiKey:         (data.zerionApiKey         as string)      ?? "",
          height:               (data.height               as number)      ?? 0,
          theme:                (data.theme                as AppTheme)    ?? "dark",
          language:             (data.language             as AppLanguage) ?? "pt",
          notificationsEnabled: (data.notificationsEnabled as boolean)     ?? false,
          notificationTime:     (data.notificationTime     as string)      ?? "08:00",
        });
      },
    }),
    { name: "segna-settings", storage: createJSONStorage(() => localStorage) }
  )
);
