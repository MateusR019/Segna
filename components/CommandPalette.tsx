"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { Search, TrendingUp, CheckSquare, StickyNote, Coins, LayoutDashboard, HelpCircle, ArrowRight } from "lucide-react";

type Result = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ReactNode;
  action: () => void;
};

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",   icon: <LayoutDashboard size={14} /> },
  { href: "/financas",   label: "Finanças",     icon: <TrendingUp size={14} /> },
  { href: "/habitos",    label: "Hábitos",      icon: <CheckSquare size={14} /> },
  { href: "/defi",       label: "DeFi / Crypto",icon: <Coins size={14} /> },
  { href: "/notas",      label: "Notas",        icon: <StickyNote size={14} /> },
  { href: "/ajuda",      label: "Como funciona?",icon: <HelpCircle size={14} /> },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const transactions = useFinancasStore((s) => s.transactions);
  const habits = useHabitosStore((s) => s.habits);
  const notes = useNotasStore((s) => s.notes);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const q = query.toLowerCase().trim();

  const results: Result[] = [];

  // Navegação
  NAV_ITEMS
    .filter((n) => !q || n.label.toLowerCase().includes(q))
    .forEach((n) => results.push({
      id: "nav-" + n.href,
      label: n.label,
      sub: "Página",
      icon: n.icon,
      action: () => { router.push(n.href); setOpen(false); },
    }));

  // Transações
  if (q) {
    transactions
      .filter((t) => t.description.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach((t) => results.push({
        id: "tx-" + t.id,
        label: t.description,
        sub: `${t.type === "income" ? "Receita" : "Despesa"} · ${t.date}`,
        icon: <TrendingUp size={14} className={t.type === "income" ? "text-[#22c55e]" : "text-[#ef4444]"} />,
        action: () => { router.push("/financas"); setOpen(false); },
      }));

    // Hábitos
    habits
      .filter((h) => h.name.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((h) => results.push({
        id: "habit-" + h.id,
        label: h.name,
        sub: "Hábito",
        icon: <CheckSquare size={14} style={{ color: h.color }} />,
        action: () => { router.push("/habitos"); setOpen(false); },
      }));

    // Notas
    notes
      .filter((n) => n.content.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((n) => results.push({
        id: "note-" + n.id,
        label: n.content.slice(0, 60) + (n.content.length > 60 ? "…" : ""),
        sub: "Nota",
        icon: <StickyNote size={14} className="text-[#06b6d4]" />,
        action: () => { router.push("/notas"); setOpen(false); },
      }));
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a2a]">
          <Search size={15} className="text-[#4a4a4a] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas, transações, hábitos, notas..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#4a4a4a] outline-none"
          />
          <kbd className="text-[10px] text-[#3a3a3a] border border-[#2a2a2a] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <p className="text-xs text-[#4a4a4a] text-center py-8">Nenhum resultado encontrado</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={r.action}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1f1f1f] transition-colors cursor-pointer group text-left"
              >
                <span className="text-[#6b7280] flex-shrink-0 group-hover:text-white transition-colors">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{r.label}</p>
                  {r.sub && <p className="text-xs text-[#4a4a4a]">{r.sub}</p>}
                </div>
                <ArrowRight size={12} className="text-[#3a3a3a] group-hover:text-[#6b7280] transition-colors flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-[#1f1f1f] px-4 py-2 flex items-center gap-3 text-[10px] text-[#3a3a3a]">
          <span><kbd className="font-mono border border-[#2a2a2a] rounded px-1">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono border border-[#2a2a2a] rounded px-1">↵</kbd> abrir</span>
          <span><kbd className="font-mono border border-[#2a2a2a] rounded px-1">Ctrl K</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
