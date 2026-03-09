"use client";
import { useState, useMemo } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ArrowDownLeft, ArrowUpRight, Pencil, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { format, parseISO, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/useToast";

const EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "housing",      label: "Moradia" },
  { value: "food",         label: "Alimentação" },
  { value: "transport",    label: "Transporte" },
  { value: "fuel",         label: "Combustível" },
  { value: "health",       label: "Saúde" },
  { value: "gym",          label: "Academia / Treino" },
  { value: "supplements",  label: "Suplementos" },
  { value: "entertainment",label: "Entretenimento" },
  { value: "education",    label: "Educação" },
  { value: "shopping",     label: "Compras" },
  { value: "investments",  label: "Investimentos" },
  { value: "other",        label: "Outros" },
];

const INCOME_CATEGORIES: { value: string; label: string }[] = [
  { value: "salary",            label: "Salário / CLT" },
  { value: "freelance",         label: "Bico / Freelance" },
  { value: "gig",               label: "App / Corridas / Gig" },
  { value: "investment_return", label: "Rendimento" },
  { value: "gift",              label: "Presente / Doação" },
  { value: "other_income",      label: "Outra receita" },
];

const CATEGORY_LABELS: Record<string, string> = {
  housing:          "Moradia",
  food:             "Alimentação",
  transport:        "Transporte",
  fuel:             "Combustível",
  health:           "Saúde",
  gym:              "Academia / Treino",
  supplements:      "Suplementos",
  entertainment:    "Entretenimento",
  education:        "Educação",
  shopping:         "Compras",
  investments:      "Investimentos",
  other:            "Outros",
  salary:           "Salário / CLT",
  freelance:        "Bico / Freelance",
  gig:              "App / Corridas / Gig",
  investment_return:"Rendimento",
  gift:             "Presente / Doação",
  other_income:     "Outra receita",
};

interface EditDraft {
  description: string;
  amount: string;
  date: string;
  category: string;
  subcategory: string;
}

interface Props {
  /** Mês padrão para filtrar — "yyyy-MM". Undefined = todos. */
  initialMonth?: string;
}

export function TransactionList({ initialMonth }: Props) {
  const { transactions, removeTransaction, editTransaction,
          customExpenseCategories, customIncomeCategories } = useFinancasStore();
  const { success } = useToast();
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [draft, setDraft]               = useState<EditDraft>({ description: "", amount: "", date: "", category: "", subcategory: "" });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState<"all" | "income" | "expense">("all");
  const [filterMonth, setFilterMonth]   = useState(initialMonth ?? "");

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions]
  );

  const filtered = useMemo(() => {
    return sorted.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterMonth && !t.date.startsWith(filterMonth)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          (CATEGORY_LABELS[t.category] ?? t.category).toLowerCase().includes(q) ||
          (t.subcategory?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [sorted, filterType, filterMonth, search]);

  // Navegar mês para o filtro
  function prevMonth() {
    const base = filterMonth ? parseISO(filterMonth + "-01") : new Date();
    setFilterMonth(format(subMonths(base, 1), "yyyy-MM"));
  }
  function nextMonth() {
    const base = filterMonth ? parseISO(filterMonth + "-01") : new Date();
    const next = addMonths(base, 1);
    if (next > new Date()) return;
    setFilterMonth(format(next, "yyyy-MM"));
  }
  const isCurrentMonth = filterMonth === format(new Date(), "yyyy-MM");
  const monthLabel = filterMonth
    ? format(parseISO(filterMonth + "-01"), "MMM yyyy", { locale: ptBR })
    : "Todos";

  function startEdit(t: typeof sorted[0]) {
    setEditingId(t.id);
    setDraft({
      description: t.description,
      amount: String(t.amount),
      date: t.date,
      category: t.category,
      subcategory: t.subcategory ?? "",
    });
  }

  function cancelEdit() { setEditingId(null); }

  function confirmEdit(id: string) {
    const amount = parseFloat(draft.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) return;
    editTransaction(id, {
      description: draft.description.trim(),
      amount,
      date: draft.date,
      category: draft.category,
      subcategory: draft.subcategory.trim() || undefined,
    });
    setEditingId(null);
    success("Transação atualizada!");
  }

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Barra de filtros */}
      <div className="space-y-2">
        {/* Busca */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descrição, categoria..."
            className="pl-8 h-9 text-sm bg-[#1a1a1a] border-[#2a2a2a] placeholder:text-[#4a4a4a]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tipo + Mês */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tipo */}
          {(["all", "income", "expense"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterType(v)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filterType === v
                  ? v === "income"
                    ? "bg-[#22c55e]/15 text-[#22c55e]"
                    : v === "expense"
                    ? "bg-[#ef4444]/15 text-[#ef4444]"
                    : "bg-[#2a2a2a] text-white"
                  : "text-[#6b7280] hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              {v === "all" ? "Todos" : v === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}

          {/* Separador */}
          <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

          {/* Navegação de mês */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setFilterMonth(filterMonth ? "" : format(new Date(), "yyyy-MM"))}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                filterMonth
                  ? "bg-[#6366f1]/15 text-[#a78bfa]"
                  : "text-[#6b7280] hover:text-white hover:bg-[#1f1f1f]"
              }`}
            >
              {monthLabel}
            </button>
            <button
              onClick={nextMonth}
              disabled={isCurrentMonth || !filterMonth}
              className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#6b7280] hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Contador de resultados */}
          <span className="text-xs text-[#4a4a4a] ml-auto">
            {filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"}
          </span>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 space-y-1">
          <p className="text-sm text-[#4a4a4a]">Nenhuma transação encontrada</p>
          <p className="text-xs text-[#3a3a3a]">Tente outro filtro ou período.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t, idx) => {
            const isIncome  = t.type === "income";
            const isEditing = editingId === t.id;
            const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const customCats = isIncome ? customIncomeCategories : customExpenseCategories;
            const delay = `${Math.min(idx * 20, 250)}ms`;

            if (isEditing) {
              return (
                <div
                  key={t.id}
                  className="list-item bg-[#1a1a1a] border border-[#6366f1]/40 rounded-xl px-4 py-3 space-y-3"
                  style={{ animationDelay: delay }}
                >
                  {/* Row 1: icon + description + amount */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isIncome ? "#22c55e18" : "#ef444418" }}
                    >
                      {isIncome
                        ? <ArrowDownLeft size={16} className="text-[#22c55e]" />
                        : <ArrowUpRight size={16} className="text-[#ef4444]" />}
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="Descrição"
                      className="flex-1 min-w-0 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#6366f1]/60"
                    />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-xs text-[#6b7280]">R$</span>
                      <input
                        type="number"
                        value={draft.amount}
                        onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                        placeholder="0,00"
                        className="w-20 sm:w-24 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#6366f1]/60"
                      />
                    </div>
                  </div>

                  {/* Row 2: subcategory */}
                  <input
                    type="text"
                    value={draft.subcategory}
                    onChange={(e) => setDraft({ ...draft, subcategory: e.target.value })}
                    placeholder="Subcategoria (opcional)"
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]/60 placeholder:text-[#4a4a4a]"
                  />

                  {/* Row 3: date + category + actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                      className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]/60 cursor-pointer"
                    />
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                      className="flex-1 min-w-0 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#6366f1]/60 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      {customCats.length > 0 && (
                        <optgroup label="── Personalizadas ──" style={{ color: "#a78bfa" }}>
                          {customCats.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                      <Button size="icon" variant="ghost" onClick={() => confirmEdit(t.id)}
                        className="h-8 w-8 text-[#22c55e] hover:text-[#16a34a] hover:bg-transparent cursor-pointer">
                        <Check size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}
                        className="h-8 w-8 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer">
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={t.id}
                className="list-item bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center gap-3 px-4 py-3 hover:border-[#3a3a3a] transition-colors group"
                style={{ animationDelay: delay }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isIncome ? "#22c55e18" : "#ef444418" }}
                >
                  {isIncome
                    ? <ArrowDownLeft size={16} className="text-[#22c55e]" />
                    : <ArrowUpRight size={16} className="text-[#ef4444]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-none truncate">
                    {t.description || "Sem descrição"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-xs text-[#4a4a4a]">
                      {format(parseISO(t.date), "d MMM yyyy", { locale: ptBR })}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#2a2a2a] text-[#6b7280]">
                      {CATEGORY_LABELS[t.category] ?? t.category}
                    </span>
                    {t.subcategory && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#6366f1]/10 text-[#a78bfa]">
                        {t.subcategory}
                      </span>
                    )}
                    {t.recurring && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#6366f1]/15 text-[#a78bfa]">
                        recorrente
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className="text-base font-semibold mr-1"
                    style={{ color: isIncome ? "#22c55e" : "#ef4444" }}
                  >
                    {isIncome ? "+" : "−"}{formatBRL(t.amount)}
                  </span>
                  {confirmDeleteId === t.id ? (
                    <>
                      <span className="text-xs text-[#ef4444] mr-0.5">Excluir?</span>
                      <Button variant="ghost" size="icon"
                        onClick={() => { removeTransaction(t.id); setConfirmDeleteId(null); success("Transação excluída"); }}
                        className="h-8 w-8 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer">
                        <Check size={13} />
                      </Button>
                      <Button variant="ghost" size="icon"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-8 w-8 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer">
                        <X size={13} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(t)}
                        className="h-8 w-8 text-[#3a3a3a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer transition-colors">
                        <Pencil size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(t.id)}
                        className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer transition-colors">
                        <Trash2 size={13} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
