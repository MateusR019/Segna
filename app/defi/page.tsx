"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { DefiSummary } from "@/components/defi/DefiSummary";
import { AddTokenDialog } from "@/components/defi/AddTokenDialog";
import { TokenList } from "@/components/defi/TokenList";
import { TokenPieChart } from "@/components/defi/TokenPieChart";
import { CryptoRefreshButton } from "@/components/defi/CryptoRefreshButton";
import { PortfolioChart } from "@/components/defi/PortfolioChart";
import { ExchangeRateWidget } from "@/components/defi/ExchangeRateWidget";
import { AddPoolDialog } from "@/components/defi/AddPoolDialog";
import { PoolList } from "@/components/defi/PoolList";
import { PoolSummary } from "@/components/defi/PoolSummary";
import { WalletSyncButton } from "@/components/defi/WalletSyncButton";
import { WatchlistSection } from "@/components/defi/WatchlistSection";
import { useHydrated } from "@/hooks/useHydrated";
import { Droplets } from "lucide-react";

export default function DefiPage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">DeFi / Crypto</h1>
          <ExchangeRateWidget />
        </div>
        <AddTokenDialog />
      </div>

      {hydrated ? (
        <>
          <DefiSummary />
          {/* Refresh — abaixo do resumo, alinhado à direita */}
          <div className="flex justify-end -mt-2">
            <CryptoRefreshButton />
          </div>
          <PortfolioChart />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <TokenList />
            </div>
            <div className="lg:col-span-2">
              <TokenPieChart />
            </div>
          </div>

          {/* ── Pools de Liquidez ── */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets size={15} className="text-[#06b6d4]" />
                <span className="text-base font-semibold text-white">
                  Pools de Liquidez
                </span>
              </div>
              <div className="flex items-center gap-2">
                <WalletSyncButton />
                <AddPoolDialog />
              </div>
            </div>
            <PoolSummary />
            <PoolList />
          </div>

          {/* ── Watchlist ── */}
          <div className="pt-2">
            <WatchlistSection />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-20 bg-[#1a1a1a]" />
            <Skeleton className="h-20 bg-[#1a1a1a]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Skeleton className="lg:col-span-3 h-64 bg-[#1a1a1a]" />
            <Skeleton className="lg:col-span-2 h-64 bg-[#1a1a1a]" />
          </div>
        </div>
      )}
    </div>
  );
}
