"use client";
import { useFinancasStore } from "@/store/financasStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_LABELS: Record<string, string> = {
  // Despesas
  housing: "Moradia",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  entertainment: "Entretenimento",
  education: "Educação",
  shopping: "Compras",
  investments: "Investimentos",
  other: "Outros",
  // Receitas
  salary: "Salário",
  freelance: "Bico / Freelance",
  investment_return: "Rendimento",
  gift: "Presente / Doação",
  other_income: "Outra receita",
};

export function TransactionList() {
  const { transactions, removeTransaction } = useFinancasStore();
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12 text-[#6b7280] text-sm">
        Nenhuma transação registrada ainda
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((t) => (
        <Card key={t.id} className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`text-base font-semibold flex-shrink-0 ${
                  t.type === "income" ? "text-[#22c55e]" : "text-[#ef4444]"
                }`}
              >
                {t.type === "income" ? "+" : "−"}
                {formatBRL(t.amount)}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white leading-none truncate">
                  {t.description || "Sem descrição"}
                </p>
                <p className="text-xs text-[#6b7280] mt-0.5">
                  {format(parseISO(t.date), "d MMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="outline"
                className="border-[#2a2a2a] text-[#9ca3af] text-xs hidden sm:flex"
              >
                {CATEGORY_LABELS[t.category] ?? t.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTransaction(t.id)}
                className="h-10 w-10 text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
