import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { PomodoroWidget } from "@/components/pomodoro/PomodoroWidget";

const geist = Geist({ subsets: ["latin"] });

const APP_URL = "https://segna.space";
const DESCRIPTION =
  "Dashboard pessoal para organizar finanças, hábitos, notas, cripto e muito mais. Open source e grátis.";

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Segna — Dashboard Pessoal",
    template: "%s · Segna",
  },
  description: DESCRIPTION,
  keywords: [
    "dashboard pessoal",
    "finanças pessoais",
    "controle de hábitos",
    "cripto portfolio",
    "notas",
    "produtividade",
    "open source",
  ],
  authors: [{ name: "Mateus", url: APP_URL }],
  creator: "Mateus",
  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Segna",
    title: "Segna — Dashboard Pessoal",
    description: DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
    title: "Segna — Dashboard Pessoal",
    description: DESCRIPTION,
  },

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
          <AppShell>{children}</AppShell>
          <PomodoroWidget />
        </Providers>
      </body>
    </html>
  );
}
