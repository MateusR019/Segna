"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, CheckSquare, Coins, StickyNote, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/financas", label: "Finanças", icon: TrendingUp },
  { href: "/habitos", label: "Hábitos", icon: CheckSquare },
  { href: "/defi", label: "DeFi", icon: Coins },
  { href: "/notas", label: "Notas", icon: StickyNote },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-[#2a2a2a] flex items-stretch">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors",
              active ? "text-white" : "text-[#6b7280]"
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span className="text-[10px] leading-none font-medium">{label}</span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
