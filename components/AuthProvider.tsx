"use client";
import { useEffect } from "react";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { supabase, getAuthUser } from "@/lib/supabase";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { useDefiStore } from "@/store/defiStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useTarefasStore } from "@/store/tarefasStore";
import { useMoodStore } from "@/store/moodStore";
import { useCorporalStore } from "@/store/corporalStore";

async function loadAllStores() {
  await Promise.all([
    useFinancasStore.getState().loadFromDB(),
    useHabitosStore.getState().loadFromDB(),
    useNotasStore.getState().loadFromDB(),
    useDefiStore.getState().loadFromDB(),
    useSettingsStore.getState().loadFromDB(),
    useTarefasStore.getState().loadFromDB(),
    useMoodStore.getState().loadFromDB(),
    useCorporalStore.getState().loadFromDB(),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void getAuthUser().then((user) => {
      if (user) void loadAllStores();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") void loadAllStores();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
