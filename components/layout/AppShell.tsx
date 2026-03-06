"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { CommandPalette } from "@/components/CommandPalette";
import { Onboarding } from "@/components/Onboarding";
import { Toaster } from "@/components/ui/Toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";

/** Rotas que NÃO devem ter sidebar/nav (páginas públicas/marketing) */
const PUBLIC_PATHS = ["/login", "/reset-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-[#0f0f0f]">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 pb-20 md:pb-5">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
        <CommandPalette />
        <Onboarding />
      </TooltipProvider>
    </AuthProvider>
  );
}
