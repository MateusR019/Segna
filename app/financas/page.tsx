"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancasSummary } from "@/components/financas/FinancasSummary";
import { AddTransactionDialog } from "@/components/financas/AddTransactionDialog";
import { TransactionList } from "@/components/financas/TransactionList";
import { ExpensePieChart } from "@/components/financas/ExpensePieChart";
import { MonthlyLineChart } from "@/components/financas/MonthlyLineChart";
import { useHydrated } from "@/hooks/useHydrated";

export default function FinancasPage() {
  const hydrated = useHydrated();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Finanças</h1>
          <p className="text-sm text-[#6b7280]">Controle de receitas e despesas</p>
        </div>
        <AddTransactionDialog />
      </div>

      {hydrated ? (
        <FinancasSummary />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 bg-[#1a1a1a]" />
          ))}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] h-9">
          <TabsTrigger value="overview" className="text-xs cursor-pointer">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs cursor-pointer">
            Transações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {hydrated ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyLineChart />
              <ExpensePieChart />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-72 bg-[#1a1a1a]" />
              <Skeleton className="h-72 bg-[#1a1a1a]" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          {hydrated ? (
            <TransactionList />
          ) : (
            <Skeleton className="h-64 bg-[#1a1a1a]" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
