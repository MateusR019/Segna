"use client";
import { useRef, useState, useEffect } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { useDefiStore } from "@/store/defiStore";
import { useToast } from "@/hooks/useToast";
import { Download, ChevronDown } from "lucide-react";
import { format } from "date-fns";

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  const financas = useFinancasStore.getState();
  const habitos = useHabitosStore.getState();
  const notas = useNotasStore.getState();
  const defi = useDefiStore.getState();
  const date = format(new Date(), "yyyy-MM-dd");
  downloadFile(JSON.stringify({ financas, habitos, notas, defi }, null, 2), `segna-backup-${date}.json`, "application/json");
}

function exportCSV() {
  const financas = useFinancasStore.getState();
  const headers = ["Data", "Tipo", "Categoria", "Descrição", "Valor"];
  const rows = financas.transactions.map((t) => [
    t.date,
    t.type === "income" ? "Receita" : "Despesa",
    t.category,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace(".", ","),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
  const date = format(new Date(), "yyyy-MM-dd");
  downloadFile("\uFEFF" + csv, `segna-transacoes-${date}.csv`, "text/csv;charset=utf-8");
}

export function ExportDataButton() {
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white hover:bg-[#1f1f1f] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <Download size={13} />
        Exportar
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          <button
            className="w-full text-left px-3 py-2.5 text-xs text-[#9ca3af] hover:text-white hover:bg-[#222] transition-colors cursor-pointer flex items-center gap-2"
            onClick={() => { exportJSON(); success("Backup JSON exportado!"); setOpen(false); }}
          >
            <span>📦</span> Backup completo (JSON)
          </button>
          <button
            className="w-full text-left px-3 py-2.5 text-xs text-[#9ca3af] hover:text-white hover:bg-[#222] transition-colors cursor-pointer flex items-center gap-2"
            onClick={() => { exportCSV(); success("Transações exportadas!"); setOpen(false); }}
          >
            <span>📊</span> Transações (CSV)
          </button>
        </div>
      )}
    </div>
  );
}
