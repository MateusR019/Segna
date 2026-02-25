"use client";
import { useState } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { formatBRL } from "@/lib/format";
import { format, getDaysInMonth, startOfMonth, getDay, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function SpendingCalendar() {
  const transactions = useFinancasStore((s) => s.transactions);
  const [ref, setRef] = useState(new Date());

  const monthStr = format(ref, "yyyy-MM");
  const daysInMonth = getDaysInMonth(ref);
  const firstDow = getDay(startOfMonth(ref)); // 0=Sun

  // Build daily totals
  const dailyExpenses: Record<number, number> = {};
  const dailyIncome: Record<number, number> = {};
  const dailyTxs: Record<number, typeof transactions> = {};

  transactions.forEach((t) => {
    if (!t.date.startsWith(monthStr)) return;
    const day = parseInt(t.date.split("-")[2]);
    if (!dailyTxs[day]) dailyTxs[day] = [];
    dailyTxs[day].push(t);
    if (t.type === "expense") {
      dailyExpenses[day] = (dailyExpenses[day] ?? 0) + t.amount;
    } else {
      dailyIncome[day] = (dailyIncome[day] ?? 0) + t.amount;
    }
  });

  const maxExpense = Math.max(...Object.values(dailyExpenses), 1);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthLabel = format(ref, "MMMM yyyy", { locale: ptBR });

  const selectedTxs = selectedDay ? (dailyTxs[selectedDay] ?? []) : [];
  const totalExpense = Object.values(dailyExpenses).reduce((a, b) => a + b, 0);
  const totalIncome = Object.values(dailyIncome).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white capitalize">{monthLabel}</h3>
          <p className="text-[10px] text-[#4a4a4a] mt-0.5">
            <span className="text-[#ef4444]">{formatBRL(totalExpense)}</span> gastos ·{" "}
            <span className="text-[#22c55e]">{formatBRL(totalIncome)}</span> receitas
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setRef((d) => subMonths(d, 1)); setSelectedDay(null); }}
            className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#3a3a3a] cursor-pointer transition-colors"
          >
            <ChevronLeft size={13} className="text-[#6b7280]" />
          </button>
          <button
            onClick={() => { setRef(new Date()); setSelectedDay(null); }}
            className="px-2 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] text-[10px] text-[#6b7280] hover:border-[#3a3a3a] cursor-pointer transition-colors"
          >
            hoje
          </button>
          <button
            onClick={() => { setRef((d) => addMonths(d, 1)); setSelectedDay(null); }}
            className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#3a3a3a] cursor-pointer transition-colors"
          >
            <ChevronRight size={13} className="text-[#6b7280]" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#3a3a3a] font-medium py-1">
            {d}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const expense = dailyExpenses[day] ?? 0;
          const income = dailyIncome[day] ?? 0;
          const hasTx = (dailyTxs[day]?.length ?? 0) > 0;
          const intensity = expense > 0 ? Math.max(0.15, expense / maxExpense) : 0;
          const isToday =
            format(new Date(), "yyyy-MM-dd") === `${monthStr}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-[11px] font-medium ${
                isSelected
                  ? "ring-2 ring-[#6366f1] ring-offset-1 ring-offset-[#1a1a1a]"
                  : ""
              } ${isToday ? "ring-1 ring-[#6366f1]/40" : ""}`}
              style={{
                background: expense > 0
                  ? `rgba(239,68,68,${intensity * 0.4})`
                  : income > 0
                  ? "rgba(34,197,94,0.08)"
                  : "#141414",
              }}
            >
              <span className={isToday ? "text-[#a78bfa] font-bold" : hasTx ? "text-white" : "text-[#3a3a3a]"}>
                {day}
              </span>
              {hasTx && (
                <div className="flex gap-0.5">
                  {expense > 0 && <div className="w-1 h-1 rounded-full bg-[#ef4444]/70" />}
                  {income > 0 && <div className="w-1 h-1 rounded-full bg-[#22c55e]/70" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#4a4a4a]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#ef4444]/30" />
          <span>despesas (mais escuro = mais)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#22c55e]/15" />
          <span>receitas</span>
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="border-t border-[#2a2a2a] pt-3 space-y-2">
          <p className="text-xs text-[#9ca3af] font-medium">
            {selectedDay} de {format(ref, "MMMM", { locale: ptBR })} — {selectedTxs.length} {selectedTxs.length === 1 ? "lançamento" : "lançamentos"}
          </p>
          {selectedTxs.length === 0 ? (
            <p className="text-xs text-[#3a3a3a]">Nenhum lançamento neste dia</p>
          ) : (
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {selectedTxs
                .sort((a, b) => b.amount - a.amount)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#1f1f1f] last:border-0"
                  >
                    <span className="text-[#9ca3af] truncate pr-2">{t.description}</span>
                    <span className={`font-medium flex-shrink-0 ${t.type === "income" ? "text-[#22c55e]" : "text-white"}`}>
                      {t.type === "income" ? "+" : "-"}{formatBRL(t.amount)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
