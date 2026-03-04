"use client";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTheme } from "next-themes";

/** Sincroniza o tema do settingsStore com next-themes */
function ThemeSync() {
  const theme    = useSettingsStore((s) => s.theme);
  const { setTheme } = useTheme();

  useEffect(() => {
    // next-themes usa "system" para modo automático
    setTheme(theme === "auto" ? "system" : theme);
  }, [theme, setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light", "auto"]} enableSystem>
      <ThemeSync />
      {children}
    </ThemeProvider>
  );
}
