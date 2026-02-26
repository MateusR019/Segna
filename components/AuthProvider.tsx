"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { useDefiStore } from "@/store/defiStore";
import { useSettingsStore } from "@/store/settingsStore";

async function loadAllStores() {
  await Promise.all([
    useFinancasStore.getState().loadFromDB(),
    useHabitosStore.getState().loadFromDB(),
    useNotasStore.getState().loadFromDB(),
    useDefiStore.getState().loadFromDB(),
    useSettingsStore.getState().loadFromDB(),
  ]);
}

/**
 * Hydrata os stores Zustand com dados do Supabase ao autenticar.
 * Não bloqueia a renderização — os dados do localStorage já estão disponíveis
 * imediatamente pelo persist middleware dos stores.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Tenta carregar dados da sessão atual (ex: refresh de página)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadAllStores();
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadAllStores();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
