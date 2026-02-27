"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, CheckSquare, Coins, LayoutDashboard, ClipboardList, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile: 5 itens mais usados diariamente. DeFi e Notas ficam acessíveis pelo sidebar.
const navItems = [
  { href: "/dashboard", label: "Home",     icon: LayoutDashboard },
  { href: "/tarefas",   label: "Tarefas",  icon: ClipboardList },
  { href: "/habitos",   label: "Hábitos",  icon: CheckSquare },
  { href: "/financas",  label: "Finanças", icon: TrendingUp },
  { href: "/defi",      label: "DeFi",     icon: Coins },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <>
      {offline && (
        <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-50 flex items-center justify-center gap-1.5 bg-[#f59e0b]/10 border-t border-[#f59e0b]/20 py-1.5">
          <WifiOff size={11} className="text-[#f59e0b]" />
          <span className="text-[11px] text-[#f59e0b] font-medium">Sem conexão — dados salvos localmente</span>
        </div>
      )}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#1f1f1f] flex items-stretch">
      {navItems.map(({ href, label, icon: Icon }) => {
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
            {/* key={pathname} forces re-mount → re-triggers the bounce animation */}
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
    </nav>
    </>
  );
}
