import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/Toaster";
import { CommandPalette } from "@/components/CommandPalette";
import { Onboarding } from "@/components/Onboarding";
import { AuthProvider } from "@/components/AuthProvider";

const geist = Geist({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Segna",
  description: "Dashboard pessoal de finanças, hábitos, notas e cripto",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Segna",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={geist.className}>
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
