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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useInvestimentosStore } from "@/store/investimentosStore";
import { useFinancasStore } from "@/store/financasStore";
import { useToast } from "@/hooks/useToast";
import { Investment, InvestmentType } from "@/types";
import { formatBRL } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Constantes ───────────────────────────────────────────────────────────────

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "renda-fixa", label: "Renda Fixa" },
  { value: "acoes", label: "Ações" },
  { value: "fundos", label: "Fundos" },
  { value: "cripto", label: "Cripto" },
  { value: "previdencia", label: "Previdência" },
  { value: "poupanca", label: "Poupança" },
  { value: "outro", label: "Outro" },
];

const TYPE_LABEL: Record<InvestmentType, string> = {
  "renda-fixa": "Renda Fixa",
  acoes: "Ações",
  fundos: "Fundos",
  cripto: "Cripto",
  previdencia: "Previdência",
  poupanca: "Poupança",
  outro: "Outro",
};

const PALETTE = [
  "#6366f1", "#22c55e", "#f59e0b", "#ec4899",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6",
];

// ─── AddInvestmentDialog ──────────────────────────────────────────────────────

function AddInvestmentDialog() {
  const { addInvestment } = useInvestimentosStore();
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<InvestmentType>("renda-fixa");
  const [currentValue, setCurrentValue] = useState("");
  const [yieldRate, setYieldRate] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(currentValue.replace(",", "."));
    if (!name.trim() || isNaN(value) || value < 0) return;
    addInvestment({
      name: name.trim(),
      type,
      currentValue: value,
      yieldRate: yieldRate ? parseFloat(yieldRate.replace(",", ".")) : undefined,
      note: note.trim() || undefined,
      color,
    });
    setName(""); setType("renda-fixa"); setCurrentValue(""); setYieldRate("");
    setNote(""); setColor(PALETTE[0]);
    setOpen(false);
    success("Investimento adicionado!");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium cursor-pointer">
          <Plus size={14} className="mr-1.5" />
          Novo investimento
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Investimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tesouro IPCA+ 2035"
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as InvestmentType)}>
              <SelectTrigger className="bg-[#0f0f0f] border-[#2a2a2a] w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                {INVESTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor atual (R$)</Label>
              <Input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0,00"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rendimento % a.a.</Label>
              <Input
                value={yieldRate}
                onChange={(e) => setYieldRate(e.target.value)}
                placeholder="Ex: 12,5"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nota (opcional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Vence em Jan/2035"
              className="bg-[#0f0f0f] border-[#2a2a2a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform cursor-pointer"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium cursor-pointer">
            Salvar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── InvestmentCard ───────────────────────────────────────────────────────────

function InvestmentCard({ inv }: { inv: Investment }) {
  const { updateInvestment, removeInvestment } = useInvestimentosStore();
  const transactions = useFinancasStore((s) => s.transactions);
  const { success } = useToast();

  const [editingValue, setEditingValue] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const [expanded, setExpanded] = useState(false);

  const linked = transactions.filter((t) => t.investmentId === inv.id);
  const totalAported = linked
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = linked
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const netInvested = totalAported - totalWithdrawn;
  const gain = inv.currentValue - netInvested;
  const gainPct = netInvested > 0 ? (gain / netInvested) * 100 : 0;
  const isPositive = gain >= 0;

  function commitEdit() {
    const parsed = parseFloat(tempValue.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) {
      updateInvestment(inv.id, { currentValue: parsed });
      success("Valor atualizado!");
    }
    setEditingValue(false);
  }

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: inv.color }} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{inv.name}</p>
            <p className="text-xs text-[#6b7280]">{TYPE_LABEL[inv.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => { setTempValue(String(inv.currentValue)); setEditingValue(true); }}
            className="p-1.5 rounded-md text-[#4a4a4a] hover:text-white hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => { removeInvestment(inv.id); success("Removido."); }}
            className="p-1.5 rounded-md text-[#4a4a4a] hover:text-[#ef4444] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Valor atual */}
      <div>
        {editingValue ? (
          <Input
            autoFocus
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingValue(false); }}
            className="bg-[#0f0f0f] border-[#6366f1] text-white text-lg font-semibold h-9"
          />
        ) : (
          <p
            className="text-xl font-semibold text-white cursor-pointer hover:text-[#a78bfa] transition-colors"
            onClick={() => { setTempValue(String(inv.currentValue)); setEditingValue(true); }}
          >
            {formatBRL(inv.currentValue)}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#2a2a2a]">
        <div>
          <p className="text-[10px] text-[#6b7280] mb-0.5">Aportado</p>
          <p className="text-xs font-medium text-[#9ca3af]">{formatBRL(netInvested)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#6b7280] mb-0.5">Rendimento</p>
          <div className="flex items-center gap-1">
            {isPositive
              ? <TrendingUp size={10} className="text-[#22c55e]" />
              : <TrendingDown size={10} className="text-[#ef4444]" />
            }
            <p className={`text-xs font-medium ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {gainPct > 0 ? "+" : ""}{gainPct.toFixed(1)}%
            </p>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#6b7280] mb-0.5">Ganho</p>
          <p className={`text-xs font-medium ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {gain >= 0 ? "+" : ""}{formatBRL(Math.abs(gain))}
          </p>
        </div>
      </div>

      {/* Taxa e nota */}
      {(inv.yieldRate || inv.note) && (
        <div className="flex items-center gap-3 flex-wrap">
          {inv.yieldRate && (
            <span className="text-[10px] text-[#6b7280] bg-[#1a1a1a] px-2 py-0.5 rounded-md">
              {inv.yieldRate}% a.a.
            </span>
          )}
          {inv.note && (
            <span className="text-[10px] text-[#6b7280] truncate">{inv.note}</span>
          )}
        </div>
      )}

      {/* Movimentações vinculadas */}
      {linked.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((x) => !x)}
            className="flex items-center gap-1 text-[11px] text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {linked.length} movimentaç{linked.length === 1 ? "ão" : "ões"} vinculada{linked.length === 1 ? "" : "s"}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              {linked.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === "expense" ? "bg-[#ef4444]" : "bg-[#22c55e]"}`} />
                    <span className="text-[#9ca3af] truncate">{t.description || (t.type === "expense" ? "Aporte" : "Resgate")}</span>
                    <span className="text-[#6b7280] flex-shrink-0">{t.date}</span>
                  </div>
                  <span className={`font-medium flex-shrink-0 ml-2 ${t.type === "expense" ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                    {t.type === "expense" ? "-" : "+"}{formatBRL(t.amount)}
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

// ─── InvestimentosTab ─────────────────────────────────────────────────────────

export function InvestimentosTab() {
  const hydrated    = useHydrated();
  const investments = useInvestimentosStore((s) => s.investments);
  const transactions = useFinancasStore((s) => s.transactions);

  const totalCurrentValue = investments.reduce((s, inv) => s + inv.currentValue, 0);

  const totalAported = investments.reduce((s, inv) =>
    s + transactions
      .filter((t) => t.investmentId === inv.id && t.type === "expense")
      .reduce((x, t) => x + t.amount, 0), 0);

  const totalWithdrawn = investments.reduce((s, inv) =>
    s + transactions
      .filter((t) => t.investmentId === inv.id && t.type === "income")
      .reduce((x, t) => x + t.amount, 0), 0);

  const netInvested   = totalAported - totalWithdrawn;
  const totalGain     = totalCurrentValue - netInvested;
  const totalGainPct  = netInvested > 0 ? (totalGain / netInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Sub-header com botão */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6b7280]">Reservas e aportes</p>
        <AddInvestmentDialog />
      </div>

      {/* Summary cards */}
      {hydrated ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-[#9ca3af]">Total Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-white">{formatBRL(totalCurrentValue)}</p>
              <p className="text-xs text-[#6b7280] mt-1">
                {investments.length} investimento{investments.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-[#9ca3af]">Total Aportado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-white">{formatBRL(netInvested)}</p>
              <p className="text-xs text-[#6b7280] mt-1">Líquido (aportes − resgates)</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-[#9ca3af]">Rendimento Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-semibold ${totalGain >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {totalGain >= 0 ? "+" : ""}{formatBRL(Math.abs(totalGain))}
              </p>
              <p className={`text-xs mt-1 ${totalGain >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {totalGainPct >= 0 ? "+" : ""}{totalGainPct.toFixed(2)}% sobre o aportado
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 bg-[#1a1a1a]" />)}
        </div>
      )}

      {/* Lista */}
      {hydrated ? (
        investments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PiggyBank size={36} className="text-[#3a3a3a] mb-3" />
            <p className="text-[#6b7280] text-sm">Nenhum investimento cadastrado</p>
            <p className="text-[#4a4a4a] text-xs mt-1">
              Clique em &quot;Novo investimento&quot; para adicionar sua primeira reserva
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {investments.map((inv) => (
              <InvestmentCard key={inv.id} inv={inv} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 bg-[#1a1a1a]" />)}
        </div>
      )}
    </div>
  );
}
