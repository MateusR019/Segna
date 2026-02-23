"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, CheckSquare, Coins, StickyNote, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col h-full border-r border-[#2a2a2a]">
      <div className="px-5 py-5">
        <span className="text-sm font-semibold tracking-widest uppercase text-white">
          Segna App
        </span>
        <p className="text-xs text-[#6b7280] mt-0.5">Mateus Segna</p>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-[#1f1f1f] text-white font-medium"
                  : "text-[#9ca3af] hover:text-white hover:bg-[#1f1f1f]"
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-[#2a2a2a]">
        <p className="text-xs text-[#4a4a4a]">v1.0.0</p>
      </div>
    </aside>
  );
}
