"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  TrendingUp, CheckSquare, Coins, LayoutDashboard, ClipboardList,
  WifiOff, MoreHorizontal, StickyNote, Scale, CalendarDays, PiggyBank, X, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 4 itens principais + botão "Mais"
const mainItems = [
  { href: "/dashboard", label: "Home",     icon: LayoutDashboard },
  { href: "/tarefas",   label: "Tarefas",  icon: ClipboardList },
  { href: "/habitos",   label: "Hábitos",  icon: CheckSquare },
  { href: "/financas",  label: "Finanças", icon: TrendingUp },
] as const;

// Itens extras que ficam no drawer "Mais"
const extraItems = [
  { href: "/defi",            label: "DeFi",           icon: Coins },
  { href: "/notas",           label: "Notas",          icon: StickyNote },
  { href: "/corporal",        label: "Corporal",       icon: Scale },
  { href: "/investimentos",   label: "Investimentos",  icon: PiggyBank },
  { href: "/revisao",         label: "Revisão",        icon: CalendarDays },
  { href: "/configuracoes",   label: "Config.",        icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Fecha o drawer ao navegar
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Verifica se algum item "extra" está ativo (para destacar o botão Mais)
  const moreActive = extraItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Overlay do drawer "Mais" */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Drawer "Mais" */}
      <div
        className={cn(
          "md:hidden fixed left-0 right-0 z-50 bg-[#111111] border-t border-[#2a2a2a] rounded-t-2xl transition-transform duration-300",
          moreOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ bottom: "60px" }}
      >
        {/* Handle + título */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Mais seções</span>
          <button
            onClick={() => setMoreOpen(false)}
            className="p-1.5 rounded-lg text-[#4a4a4a] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Grid de links */}
        <div className="grid grid-cols-4 gap-1 px-3 pb-5 pt-1">
          {extraItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors btn-press",
                  active ? "bg-[#6366f1]/15 text-[#a78bfa]" : "text-[#6b7280] hover:bg-[#1a1a1a] hover:text-white"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Indicador offline */}
      {offline && (
        <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-50 flex items-center justify-center gap-1.5 bg-[#f59e0b]/10 border-t border-[#f59e0b]/20 py-1.5">
          <WifiOff size={11} className="text-[#f59e0b]" />
          <span className="text-[11px] text-[#f59e0b] font-medium">Sem conexão — dados salvos localmente</span>
        </div>
      )}

      {/* BottomNav principal */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#1f1f1f] flex items-stretch">
        {mainItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors btn-press",
                active ? "text-white" : "text-[#4a4a4a]"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[#6366f1]" />
              )}
              <div
                key={active ? pathname : href}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                  active ? "bg-[#6366f1]/15 nav-icon-active" : ""
                )}
              >
                <Icon
                  size={18}
                  className={active ? "text-[#a78bfa]" : "text-[#4a4a4a]"}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </div>
              <span className={cn(
                "text-[10px] leading-none font-medium transition-colors",
                active ? "text-[#a78bfa]" : "text-[#4a4a4a]"
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Botão "Mais" */}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[60px] transition-colors btn-press cursor-pointer",
            (moreOpen || moreActive) ? "text-white" : "text-[#4a4a4a]"
          )}
        >
          {moreActive && !moreOpen && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-[#6366f1]" />
          )}
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
              (moreOpen || moreActive) ? "bg-[#6366f1]/15" : ""
            )}
          >
            {moreOpen ? (
              <X size={18} className="text-[#a78bfa]" strokeWidth={2.5} />
            ) : (
              <MoreHorizontal
                size={18}
                className={moreActive ? "text-[#a78bfa]" : "text-[#4a4a4a]"}
                strokeWidth={1.75}
              />
            )}
          </div>
          <span className={cn(
            "text-[10px] leading-none font-medium transition-colors",
            (moreOpen || moreActive) ? "text-[#a78bfa]" : "text-[#4a4a4a]"
          )}>
            Mais
          </span>
        </button>
      </nav>
    </>
  );
}
