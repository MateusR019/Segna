"use client";
import { useState } from "react";
import { CloudUpload, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { saveAllStores } from "@/lib/db";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { useDefiStore } from "@/store/defiStore";
import { useSettingsStore } from "@/store/settingsStore";

type Status = "idle" | "loading" | "done" | "error";

/**
 * Botão que migra todos os dados do localStorage para o Supabase de uma vez.
 * Aparece em Configurações ou no primeiro login para facilitar a migração.
 */
export function MigrateButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [counts, setCounts]  = useState<Record<string, number>>({});

  async function handleMigrate() {
    setStatus("loading");
    try {
      const f = useFinancasStore.getState();
      const h = useHabitosStore.getState();
      const n = useNotasStore.getState();
      const d = useDefiStore.getState();
      const s = useSettingsStore.getState();

      await saveAllStores({
        financas: {
          transactions: f.transactions,
          goals:        f.goals,
          budget:       f.budget,
          savingsGoal:  f.savingsGoal,
        },
        habitos: {
          habits:          h.habits,
          completions:     h.completions,
          counts:          h.counts,
          frequencyGoals:  h.frequencyGoals,
          habitNotes:      h.habitNotes,
          workoutSchedule: h.workoutSchedule,
          annotations:     h.annotations,
        },
        notas: {
          notes: n.notes,
          tags:  n.tags,
        },
        defi: {
          tokens:       d.tokens,
          snapshots:    d.snapshots,
          priceHistory: d.priceHistory,
          exchangeRate: d.exchangeRate,
          pools:        d.pools,
        },
        settings: {
          walletAddress: s.walletAddress,
          debankApiKey:  s.debankApiKey,
        },
      });

      setCounts({
        transactions: f.transactions.length,
        habits:       h.habits.length,
        notes:        n.notes.length,
        tokens:       d.tokens.length,
        pools:        d.pools.length,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-[#6366f1]" />
        <p className="text-sm font-medium text-white">Migrar dados locais para nuvem</p>
      </div>

      <p className="text-xs text-[#6b7280] leading-relaxed">
        Envia todos os dados salvos neste dispositivo para o Supabase. Faça isso
        uma vez ao configurar o app em um novo dispositivo ou conta.
      </p>

      {status === "done" && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-[#22c55e]">
            <CheckCircle2 size={14} />
            <span className="text-xs font-medium">Dados sincronizados com sucesso!</span>
          </div>
          <p className="text-xs text-[#4ade80]">
            {counts.transactions} transações · {counts.habits} hábitos ·{" "}
            {counts.notes} notas · {counts.tokens} tokens · {counts.pools} pools
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3 flex items-center gap-2 text-[#ef4444]">
          <AlertCircle size={14} />
          <span className="text-xs">
            Erro ao sincronizar. Verifique sua conexão e tente novamente.
          </span>
        </div>
      )}

      <button
        onClick={handleMigrate}
        disabled={status === "loading" || status === "done"}
        className="w-full flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#5855e0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg py-2 transition-colors cursor-pointer"
      >
        {status === "loading" ? (
          <>
            <span className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white" />
            Sincronizando…
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle2 size={13} />
            Sincronizado
          </>
        ) : (
          <>
            <CloudUpload size={13} />
            Migrar para nuvem
          </>
        )}
      </button>
    </div>
  );
}
