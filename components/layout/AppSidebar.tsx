"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp, CheckSquare, Coins, StickyNote, LayoutDashboard,
  HelpCircle, LogOut, ClipboardList, CalendarDays, Scale, PiggyBank, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";

function ProfileAvatar({ name, color }: { name: string; color: string }) {
  const initials = name.trim()
    ? name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?";
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[11px] flex-shrink-0 select-none"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

export function AppSidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const displayName = useSettingsStore((s) => s.displayName);
  const avatarColor = useSettingsStore((s) => s.avatarColor);
  const language    = useSettingsStore((s) => s.language);
  const t           = useT(language);

  const navItems = [
    { href: "/dashboard",    label: t("dashboard"),    icon: LayoutDashboard },
    { href: "/tarefas",      label: t("tasks"),        icon: ClipboardList },
    { href: "/financas",     label: t("finances"),     icon: TrendingUp },
    { href: "/habitos",      label: t("habits"),       icon: CheckSquare },
    { href: "/defi",         label: t("defi"),         icon: Coins },
    { href: "/notas",        label: t("notes"),        icon: StickyNote },
    { href: "/revisao",      label: t("review"),       icon: CalendarDays },
    { href: "/corporal",     label: t("corporal"),     icon: Scale },
    { href: "/investimentos",label: t("investments"),  icon: PiggyBank },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 flex-col h-full border-r border-[#1f1f1f]">
      {/* Logo area */}
      <div className="px-5 py-5 flex items-center gap-3">
        <Image
          src="/icon-192.png"
          alt="Segna"
          width={28}
          height={28}
          className="rounded-lg flex-shrink-0 logo-pulse"
        />
        <div>
          <Image
            src="/logo.png"
            alt="Segna"
            width={72}
            height={18}
            className="object-contain"
          />
          <p className="text-[10px] text-[#4a4a4a] leading-none mt-1">Personal OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
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
        {/* Perfil / Configurações */}
        <Link
          href="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 btn-press",
            pathname.startsWith("/configuracoes")
              ? "bg-[#1a1a1a] text-white font-medium"
              : "text-[#6b7280] hover:text-white hover:bg-[#161616]"
          )}
        >
          <ProfileAvatar name={displayName} color={avatarColor} />
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-none truncate">{displayName || t("profile")}</p>
            <p className="text-[10px] text-[#4a4a4a] mt-0.5">{t("settings")}</p>
          </div>
          <Settings size={12} className="text-[#3a3a3a] flex-shrink-0" />
        </Link>

        <Link
          href="/ajuda"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 btn-press",
            pathname.startsWith("/ajuda")
              ? "bg-[#1a1a1a] text-white font-medium"
              : "text-[#6b7280] hover:text-white hover:bg-[#161616]"
          )}
        >
          <HelpCircle
            size={15}
            className={cn(
              "flex-shrink-0",
              pathname.startsWith("/ajuda") ? "text-[#a78bfa]" : "text-[#4a4a4a]"
            )}
          />
          {t("help")}
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-[#6b7280] hover:text-[#ef4444] hover:bg-[#161616] cursor-pointer btn-press"
        >
          <LogOut size={15} className="flex-shrink-0" />
          {t("signOut")}
        </button>
        <p className="text-[10px] text-[#3a3a3a] px-3">v1.0.0 · Segna</p>
      </div>
    </aside>
  );
}
