"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, CheckSquare, Coins, StickyNote, LayoutDashboard, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/financas", label: "Finanças", icon: TrendingUp },
  { href: "/habitos", label: "Hábitos", icon: CheckSquare },
  { href: "/defi", label: "DeFi", icon: Coins },
  { href: "/notas", label: "Notas", icon: StickyNote },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col h-full border-r border-[#1f1f1f]">
      {/* Logo area */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center flex-shrink-0 logo-pulse">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <div>
          <span className="text-sm font-semibold text-white tracking-tight">Segna</span>
          <p className="text-[10px] text-[#4a4a4a] leading-none mt-0.5">Personal OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                "btn-press",
                active
                  ? "bg-[#1a1a1a] text-white font-medium"
                  : "text-[#6b7280] hover:text-white hover:bg-[#161616]"
              )}
            >
              {active && (
                <span className="nav-pill absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#6366f1]" />
              )}
              <Icon
                size={15}
                className={cn(
                  "transition-colors flex-shrink-0",
                  active ? "text-[#a78bfa]" : "text-[#4a4a4a] group-hover:text-white"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#1f1f1f] space-y-1">
        <Link
          href="/ajuda"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 btn-press",
            pathname.startsWith("/ajuda")
              ? "bg-[#1a1a1a] text-white font-medium"
              : "text-[#6b7280] hover:text-white hover:bg-[#161616]"
          )}
        >
          {pathname.startsWith("/ajuda") && (
            <span className="nav-pill absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#6366f1]" />
          )}
          <HelpCircle
            size={15}
            className={cn(
              "flex-shrink-0",
              pathname.startsWith("/ajuda") ? "text-[#a78bfa]" : "text-[#4a4a4a]"
            )}
          />
          Como funciona?
        </Link>
        <p className="text-[10px] text-[#3a3a3a] px-3">v1.0.0 · Mateus Segna</p>
      </div>
    </aside>
  );
}
