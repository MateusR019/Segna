"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { DefiSummary } from "@/components/defi/DefiSummary";
import { AddTokenDialog } from "@/components/defi/AddTokenDialog";
import { TokenList } from "@/components/defi/TokenList";
import { TokenPieChart } from "@/components/defi/TokenPieChart";
import { CryptoRefreshButton } from "@/components/defi/CryptoRefreshButton";
import { useHydrated } from "@/hooks/useHydrated";

export default function DefiPage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">DeFi / Crypto</h1>
          <p className="text-sm text-[#6b7280]">Portfolio em BRL</p>
        </div>
        <div className="flex items-center gap-2">
          <CryptoRefreshButton />
          <AddTokenDialog />
        </div>
      </div>

      {hydrated ? (
        <>
          <DefiSummary />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <TokenList />
            </div>
            <div className="lg:col-span-2">
              <TokenPieChart />
            </div>
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
