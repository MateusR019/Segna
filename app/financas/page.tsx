"use client";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FinancasSummary } from "@/components/financas/FinancasSummary";
import { AddTransactionDialog } from "@/components/financas/AddTransactionDialog";
import { TransactionList } from "@/components/financas/TransactionList";
import { ExpensePieChart } from "@/components/financas/ExpensePieChart";
import { MonthlyLineChart } from "@/components/financas/MonthlyLineChart";
import { CategoryGoals } from "@/components/financas/CategoryGoals";
import { MonthlyReport } from "@/components/financas/MonthlyReport";
import { MonthlyBudget } from "@/components/financas/MonthlyBudget";
import { SavingsGoalWidget } from "@/components/financas/SavingsGoalWidget";
import { ImportExportButton } from "@/components/financas/ImportExportButton";
import { SpendingCalendar } from "@/components/financas/SpendingCalendar";
import { RecurringManager } from "@/components/financas/RecurringManager";
import { InvestimentosTab } from "@/components/financas/InvestimentosTab";
import { useHydrated } from "@/hooks/useHydrated";
import { useFinancasStore } from "@/store/financasStore";

export default function FinancasPage() {
  const hydrated = useHydrated();
  const generateRecurring = useFinancasStore((s) => s.generateRecurring);

  useEffect(() => {
    if (hydrated) generateRecurring();
  }, [hydrated, generateRecurring]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Finanças</h1>
          <p className="text-sm text-[#6b7280]">Receitas, despesas e investimentos</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportButton />
          <AddTransactionDialog />
        </div>
      </div>

      {hydrated ? (
        <>
          <FinancasSummary />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MonthlyBudget />
            <SavingsGoalWidget />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 bg-[#1a1a1a]" />
          ))}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] h-9 flex-wrap">
          <TabsTrigger value="overview" className="text-xs cursor-pointer">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs cursor-pointer">
            Transações
          </TabsTrigger>
          <TabsTrigger value="investimentos" className="text-xs cursor-pointer">
            Investimentos
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs cursor-pointer">
            Calendário
          </TabsTrigger>
          <TabsTrigger value="recurring" className="text-xs cursor-pointer">
            Fixos
          </TabsTrigger>
          <TabsTrigger value="metas" className="text-xs cursor-pointer">
            Metas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {hydrated ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyLineChart />
                <ExpensePieChart />
              </div>
              <MonthlyReport />
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-72 bg-[#1a1a1a]" />
                <Skeleton className="h-72 bg-[#1a1a1a]" />
              </div>
              <Skeleton className="h-40 bg-[#1a1a1a]" />
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

        <TabsContent value="investimentos" className="mt-4">
          <InvestimentosTab />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          {hydrated ? (
            <SpendingCalendar />
          ) : (
            <Skeleton className="h-96 bg-[#1a1a1a]" />
          )}
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          {hydrated ? (
            <RecurringManager />
          ) : (
            <Skeleton className="h-64 bg-[#1a1a1a]" />
          )}
        </TabsContent>

        <TabsContent value="metas" className="mt-4">
          {hydrated ? (
            <CategoryGoals />
          ) : (
            <Skeleton className="h-64 bg-[#1a1a1a]" />
          )}
        </TabsContent>
      </Tabs>

      {/* FAB mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <AddTransactionDialog trigger="fab" />
      </div>
    </div>
  );
}
