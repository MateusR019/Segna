"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Tag } from "lucide-react";
import { useFinancasStore } from "@/store/financasStore";
import { useInvestimentosStore } from "@/store/investimentosStore";
import { useToast } from "@/hooks/useToast";
import { ExpenseCategory, IncomeCategory, TransactionType } from "@/types";

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
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

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: "salary", label: "Salário" },
  { value: "freelance", label: "Bico / Freelance" },
  { value: "investment_return", label: "Rendimento" },
  { value: "gift", label: "Presente / Doação" },
  { value: "other_income", label: "Outra receita" },
];

interface Props {
  trigger?: "fab" | "default";
}

export function AddTransactionDialog({ trigger = "default" }: Props) {
  const addTransaction           = useFinancasStore((s) => s.addTransaction);
  const addCustomCategory        = useFinancasStore((s) => s.addCustomCategory);
  const customExpenseCategories  = useFinancasStore((s) => s.customExpenseCategories);
  const customIncomeCategories   = useFinancasStore((s) => s.customIncomeCategories);
  const investments              = useInvestimentosStore((s) => s.investments);
  const { success, error: toastError } = useToast();

  const [open, setOpen]             = useState(false);
  const [type, setType]             = useState<TransactionType>("expense");
  const [amount, setAmount]         = useState("");
  const [description, setDesc]      = useState("");
  const [category, setCategory]     = useState<string>("other");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate]             = useState(new Date().toISOString().slice(0, 10));
  const [recurring, setRecurring]   = useState(false);
  const [investmentId, setInvestmentId] = useState<string>("none");
  const [newCatInput, setNewCatInput]   = useState("");
  const [showNewCat, setShowNewCat]     = useState(false);

  const customCats = type === "income" ? customIncomeCategories : customExpenseCategories;
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const showInvestmentField =
    (type === "expense" && category === "investments") ||
    (type === "income" && category === "investment_return");

  function handleTypeChange(t: TransactionType) {
    setType(t);
    setCategory(t === "income" ? "salary" : "other");
    setSubcategory("");
    setInvestmentId("none");
    setShowNewCat(false);
    setNewCatInput("");
  }

  function handleCategoryChange(v: string) {
    setCategory(v);
    setInvestmentId("none");
  }

  function handleAddCustomCategory() {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    addCustomCategory(type, trimmed);
    setCategory(trimmed);
    setNewCatInput("");
    setShowNewCat(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toastError("Informe um valor válido maior que zero.");
      return;
    }
    addTransaction({
      type,
      category,
      subcategory: subcategory.trim() || undefined,
      description,
      amount: parsedAmount,
      date,
      recurring,
      investmentId: investmentId !== "none" ? investmentId : undefined,
    });
    setAmount("");
    setDesc("");
    setCategory("other");
    setSubcategory("");
    setRecurring(false);
    setInvestmentId("none");
    setOpen(false);
    success(type === "income" ? "Receita adicionada!" : "Despesa adicionada!");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "fab" ? (
          <button
            className="w-12 h-12 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black flex items-center justify-center shadow-lg shadow-[#22c55e]/20 transition-colors cursor-pointer"
            aria-label="Adicionar transação"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <Button
            size="sm"
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
          >
            <Plus size={14} className="mr-1.5" />
            Adicionar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-2">
            {(["income", "expense"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer
                  ${
                    type === t
                      ? t === "income"
                        ? "bg-[#22c55e] text-black border-[#22c55e]"
                        : "bg-[#ef4444] text-white border-[#ef4444]"
                      : "bg-transparent text-[#9ca3af] border-[#2a2a2a] hover:border-[#4a4a4a]"
                  }`}
              >
                {t === "income" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Aluguel"
              className="bg-[#0f0f0f] border-[#2a2a2a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
                {customCats.length > 0 && (
                  <>
                    <div className="mx-2 my-1 border-t border-[#2a2a2a]" />
                    {customCats.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-1.5">
                          <Tag size={11} className="text-[#a78bfa]" />
                          {c}
                        </span>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Adicionar nova categoria inline */}
            {!showNewCat ? (
              <button type="button" onClick={() => setShowNewCat(true)}
                className="text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors flex items-center gap-1 mt-1">
                <Plus size={11} />
                Nova categoria
              </button>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomCategory(); } }}
                  placeholder="Ex: Pets, Academia..."
                  className="bg-[#0f0f0f] border-[#2a2a2a] text-sm h-8"
                  autoFocus
                />
                <button type="button" onClick={handleAddCustomCategory}
                  className="px-3 h-8 rounded-md text-xs font-medium bg-[#6366f1] text-white hover:bg-[#5855e0] transition-colors flex-shrink-0">
                  Criar
                </button>
                <button type="button" onClick={() => { setShowNewCat(false); setNewCatInput(""); }}
                  className="px-2 h-8 rounded-md text-xs text-[#6b7280] hover:text-white transition-colors flex-shrink-0">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Subcategoria */}
          <div className="space-y-1.5">
            <Label htmlFor="subcategory">
              Subcategoria
              <span className="text-[#6b7280] ml-1 font-normal text-[11px]">(opcional)</span>
            </Label>
            <Input
              id="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder={type === "income" ? "Ex: Salário CLT, 13°..." : "Ex: Mercado, Delivery, Uber..."}
              className="bg-[#0f0f0f] border-[#2a2a2a] text-sm"
            />
          </div>

          {/* Vínculo com investimento — só aparece para categorias de investimento */}
          {showInvestmentField && investments.length > 0 && (
            <div className="space-y-1.5">
              <Label>
                {type === "expense" ? "Em qual investimento?" : "De qual investimento?"}
                <span className="text-[#6b7280] ml-1 font-normal">(opcional)</span>
              </Label>
              <Select value={investmentId} onValueChange={(v) => setInvestmentId(v)}>
                <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <SelectItem value="none">Nenhum</SelectItem>
                  {investments.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          {/* Recorrência */}
          <button
            type="button"
            onClick={() => setRecurring((r) => !r)}
            className={`w-full py-2 rounded-md text-sm border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              recurring
                ? "bg-[#1f2937] border-[#6366f1] text-[#818cf8]"
                : "bg-transparent border-[#2a2a2a] text-[#9ca3af] hover:border-[#3a3a3a]"
            }`}
          >
            <span>{recurring ? "✓" : "○"}</span>
            Lançar automaticamente todo mês
          </button>

          <Button
            type="submit"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
          >
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
