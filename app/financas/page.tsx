"use client";
import { useEffect, useState } from "react";
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
import { SpendingCalendar } from "@/components/financas/SpendingCalendar";
import { RecurringManager } from "@/components/financas/RecurringManager";
import { InvestimentosTab } from "@/components/financas/InvestimentosTab";
import { ExportPDFButton } from "@/components/financas/ExportPDFButton";
import { useHydrated } from "@/hooks/useHydrated";
import { useFinancasStore } from "@/store/financasStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

function MonthSelector({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const isCurrentMonth = month === format(new Date(), "yyyy-MM");

  function prev() {
    onChange(format(subMonths(parseISO(month + "-01"), 1), "yyyy-MM"));
  }
  function next() {
    if (!isCurrentMonth) onChange(format(addMonths(parseISO(month + "-01"), 1), "yyyy-MM"));
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        title="Mês anterior"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-sm font-medium text-white capitalize min-w-[110px] text-center">
        {format(parseISO(month + "-01"), "MMMM yyyy", { locale: ptBR })}
      </span>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
        title="Próximo mês"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function FinancasPage() {
  const hydrated = useHydrated();
  const generateRecurring = useFinancasStore((s) => s.generateRecurring);
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    if (hydrated) generateRecurring();
  }, [hydrated, generateRecurring]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">{t("financasTitle")}</h1>
          <p className="text-sm text-[#6b7280]">{t("financasDesc")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthSelector month={selectedMonth} onChange={setSelectedMonth} />
          <ExportPDFButton targetId="financas-pdf-target" month={selectedMonth} />
          <AddTransactionDialog />
        </div>
      </div>

      {hydrated ? (
        <>
          <FinancasSummary month={selectedMonth} />
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
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] h-9 flex-nowrap min-w-max">
            <TabsTrigger value="overview" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabOverview")}</TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabTransactions")}</TabsTrigger>
            <TabsTrigger value="investimentos" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabInvestments")}</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabCalendar")}</TabsTrigger>
            <TabsTrigger value="recurring" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabRecurring")}</TabsTrigger>
            <TabsTrigger value="metas" className="text-xs cursor-pointer whitespace-nowrap">{t("finTabGoals")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {hydrated ? (
            <div id="financas-pdf-target" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MonthlyLineChart />
                <ExpensePieChart />
              </div>
              <MonthlyReport />
            </div>
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
            <TransactionList initialMonth={selectedMonth} />
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

    </div>
  );
}
