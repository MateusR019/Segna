"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  useFinancasStore,
  calcCategorySpendThisMonth,
} from "@/store/financasStore";
import { ExpenseCategory } from "@/types";
import { formatBRL } from "@/lib/format";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "housing", label: "Moradia" },
  { value: "food", label: "Alimentação" },
  { value: "transport", label: "Transporte" },
  { value: "health", label: "Saúde" },
  { value: "entertainment", label: "Entretenimento" },
  { value: "education", label: "Educação" },
  { value: "shopping", label: "Compras" },
  { value: "investments", label: "Investimentos" },
  { value: "other", label: "Outros" },
];

const CATEGORY_COLORS: Record<string, string> = {
  housing: "#6366f1",
  food: "#22c55e",
  transport: "#f59e0b",
  health: "#ec4899",
  entertainment: "#8b5cf6",
  education: "#06b6d4",
  shopping: "#f97316",
  investments: "#14b8a6",
  other: "#6b7280",
};

export function CategoryGoals() {
  const { goals, transactions, addGoal, removeGoal } = useFinancasStore();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [limit, setLimit] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limitAmount = parseFloat(limit.replace(",", "."));
    if (isNaN(limitAmount) || limitAmount <= 0) return;
    addGoal({ category, limitAmount });
    setLimit("");
    setOpen(false);
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Metas por Categoria
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-[#9ca3af] hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer"
            >
              <Plus size={12} className="mr-1" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
            <DialogHeader>
              <DialogTitle>Definir Meta Mensal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ExpenseCategory)}
                >
                  <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Limite Mensal (R$)</Label>
                <Input
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="Ex: 500"
                  className="bg-[#0f0f0f] border-[#2a2a2a]"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
              >
                Salvar Meta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-sm text-[#6b7280] text-center py-4">
            Nenhuma meta definida
          </p>
        ) : (
          goals.map((goal) => {
            const spent = calcCategorySpendThisMonth(transactions, goal.category);
            const pct = Math.min((spent / goal.limitAmount) * 100, 100);
            const over = spent > goal.limitAmount;
            const label =
              CATEGORIES.find((c) => c.value === goal.category)?.label ??
              goal.category;
            const color = CATEGORY_COLORS[goal.category] ?? "#6b7280";

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ background: color }}
                    />
                    <span className="text-xs text-white">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${over ? "text-[#ef4444]" : "text-[#9ca3af]"}`}
                    >
                      {formatBRL(spent)} / {formatBRL(goal.limitAmount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGoal(goal.id)}
                      className="h-5 w-5 text-[#4a4a4a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </Button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: over ? "#ef4444" : color,
                    }}
                  />
                </div>
                {over && (
                  <p className="text-xs text-[#ef4444]">
                    {formatBRL(spent - goal.limitAmount)} acima do limite
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
