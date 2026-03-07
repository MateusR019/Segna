"use client";
import { useState, useCallback, useEffect } from "react";
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
  RefreshCw,
  Zap,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { useInvestimentosStore } from "@/store/investimentosStore";
import { useFinancasStore } from "@/store/financasStore";
import { useToast } from "@/hooks/useToast";
import { Investment, InvestmentType } from "@/types";
import { formatBRL } from "@/lib/format";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import { SYMBOL_TO_ID } from "@/lib/cryptoSymbols";

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

// ─── Hook: buscar preços cripto ────────────────────────────────────────────────

function useCryptoInvestimentosPrices() {
  const { investments, updateInvestment } = useInvestimentosStore();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const cryptoInvestments = investments.filter(
    (inv) => inv.type === "cripto" && inv.symbol && inv.quantity
  );

  const fetchPrices = useCallback(
    async (silent = false) => {
      if (cryptoInvestments.length === 0) return;

      if (!silent) setLoading(true);
      setFetchError(null);

      // Build geckoId → investmentId map
      const idMap: Record<string, string> = {};
      cryptoInvestments.forEach((inv) => {
        const geckoId = SYMBOL_TO_ID[inv.symbol!.toUpperCase()];
        if (geckoId) idMap[geckoId] = inv.id;
      });

      const geckoIds = Object.keys(idMap);
      if (geckoIds.length === 0) {
        if (!silent) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/crypto-prices?ids=${geckoIds.join(",")}`, {
          cache: "no-store",
        });

        if (res.status === 429) throw new Error("rate_limit");
        if (!res.ok) throw new Error("upstream");

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        let updated = 0;
        geckoIds.forEach((geckoId) => {
          const brl: number | undefined = data[geckoId]?.brl;
          const invId = idMap[geckoId];
          const inv = investments.find((i) => i.id === invId);
          if (brl && invId && inv?.quantity) {
            updateInvestment(invId, {
              pricePerUnit: brl,
              currentValue: brl * inv.quantity,
            });
            updated++;
          }
        });

        if (updated > 0) {
          const time = new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          setLastUpdated(time);
          if (!silent) success(`${updated} preço(s) atualizado(s)!`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "rate_limit") {
          setFetchError("Rate limit — aguarde 1 min");
        } else if (!silent) {
          setFetchError("Falha ao buscar preços");
          toastError("Não foi possível buscar os preços");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [investments, updateInvestment]
  );

  // Auto-fetch silencioso ao montar
  useEffect(() => {
    fetchPrices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, lastUpdated, fetchError, fetchPrices, hasCrypto: cryptoInvestments.length > 0 };
}

// ─── AddInvestmentDialog ──────────────────────────────────────────────────────

function AddInvestmentDialog() {
  const { addInvestment } = useInvestimentosStore();
  const { success, error: toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<InvestmentType>("renda-fixa");
  const [currentValue, setCurrentValue] = useState("");
  const [yieldRate, setYieldRate] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  // Cripto-specific
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null);

  const isCripto = type === "cripto";

  async function handleFetchPrice() {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    const geckoId = SYMBOL_TO_ID[sym];
    if (!geckoId) {
      toastError(`Símbolo "${sym}" não encontrado`);
      return;
    }
    setFetchingPrice(true);
    try {
      const res = await fetch(`/api/crypto-prices?ids=${geckoId}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const brl: number | undefined = data[geckoId]?.brl;
      if (!brl) throw new Error();
      setPricePerUnit(brl);
      // Auto-fill currentValue if quantity is set
      const qty = parseFloat(quantity.replace(",", "."));
      if (!isNaN(qty) && qty > 0) {
        setCurrentValue((brl * qty).toFixed(2).replace(".", ","));
      }
      success(`${sym}: ${formatBRL(brl)} por unidade`);
    } catch {
      toastError("Preço não encontrado");
    } finally {
      setFetchingPrice(false);
    }
  }

  // Recalculate value when quantity changes (if price already fetched)
  function handleQuantityChange(val: string) {
    setQuantity(val);
    if (pricePerUnit) {
      const qty = parseFloat(val.replace(",", "."));
      if (!isNaN(qty) && qty > 0) {
        setCurrentValue((pricePerUnit * qty).toFixed(2).replace(".", ","));
      }
    }
  }

  function handleTypeChange(v: InvestmentType) {
    setType(v);
    // Reset cripto fields
    setSymbol(""); setQuantity(""); setPricePerUnit(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(currentValue.replace(",", "."));
    if (!name.trim() || isNaN(value) || value < 0) return;
    const qty = isCripto ? parseFloat(quantity.replace(",", ".")) : undefined;
    addInvestment({
      name: name.trim(),
      type,
      currentValue: value,
      yieldRate: yieldRate ? parseFloat(yieldRate.replace(",", ".")) : undefined,
      note: note.trim() || undefined,
      color,
      ...(isCripto && symbol.trim() ? {
        symbol: symbol.trim().toUpperCase(),
        quantity: qty && !isNaN(qty) ? qty : undefined,
        pricePerUnit: pricePerUnit ?? undefined,
      } : {}),
    });
    setName(""); setType("renda-fixa"); setCurrentValue(""); setYieldRate("");
    setNote(""); setColor(PALETTE[0]); setSymbol(""); setQuantity("");
    setPricePerUnit(null);
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
              placeholder={isCripto ? "Ex: Bitcoin" : "Ex: Tesouro IPCA+ 2035"}
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => handleTypeChange(v as InvestmentType)}>
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

          {/* Cripto fields */}
          {isCripto && (
            <div className="space-y-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={12} className="text-[#a78bfa]" />
                <span className="text-[11px] text-[#9ca3af] font-medium">
                  Preço automático via CoinGecko
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Símbolo</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      placeholder="BTC"
                      className="bg-[#1a1a1a] border-[#2a2a2a] uppercase font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleFetchPrice}
                      disabled={!symbol.trim() || fetchingPrice}
                      className="border-[#6366f1]/50 text-[#a78bfa] hover:bg-[#6366f1]/10 cursor-pointer flex-shrink-0 px-2"
                    >
                      <RefreshCw size={12} className={fetchingPrice ? "animate-spin" : ""} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="0,001"
                    className="bg-[#1a1a1a] border-[#2a2a2a]"
                  />
                </div>
              </div>
              {pricePerUnit && (
                <p className="text-[10px] text-[#22c55e]">
                  Preço atual: {formatBRL(pricePerUnit)}/unidade
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{isCripto ? "Valor total (R$)" : "Valor atual (R$)"}</Label>
              <Input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0,00"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
                required
              />
            </div>
            {!isCripto && (
              <div className="space-y-1.5">
                <Label>Rendimento % a.a.</Label>
                <Input
                  value={yieldRate}
                  onChange={(e) => setYieldRate(e.target.value)}
                  placeholder="Ex: 12,5"
                  className="bg-[#0f0f0f] border-[#2a2a2a]"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Nota (opcional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isCripto ? "Ex: Compra longo prazo" : "Ex: Vence em Jan/2035"}
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

// ─── AporteDialog ─────────────────────────────────────────────────────────────

function AporteDialog({ inv }: { inv: Investment }) {
  const { addTransaction } = useFinancasStore();
  const { success } = useToast();
  const [open, setOpen] = useState(false);
  const [operationType, setOperationType] = useState<"aporte" | "resgate">("aporte");
  const [amount, setAmount] = useState("");         // always BRL
  const [cryptoQty, setCryptoQty] = useState("");  // native units (BTC, ETH, etc.)
  const [useCryptoUnit, setUseCryptoUnit] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const isCripto = inv.type === "cripto" && !!inv.symbol && !!inv.pricePerUnit;

  function handleCryptoQtyChange(val: string) {
    setCryptoQty(val);
    const qty = parseFloat(val.replace(",", "."));
    if (!isNaN(qty) && qty > 0 && inv.pricePerUnit) {
      setAmount((qty * inv.pricePerUnit).toFixed(2).replace(".", ","));
    } else {
      setAmount("");
    }
  }

  function handleClose(v: boolean) {
    setOpen(v);
    if (!v) {
      setAmount(""); setCryptoQty(""); setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      setUseCryptoUnit(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (isNaN(value) || value <= 0) return;

    addTransaction({
      type: operationType === "aporte" ? "expense" : "income",
      amount: value,
      description: description.trim() || (operationType === "aporte" ? `Aporte — ${inv.name}` : `Resgate — ${inv.name}`),
      category: operationType === "aporte" ? "investments" : "investment_return",
      date,
      investmentId: inv.id,
    });

    handleClose(false);
    success(operationType === "aporte" ? "Aporte registrado!" : "Resgate registrado!");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 rounded-md text-[#4a4a4a] hover:text-[#22c55e] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
          title="Registrar aporte ou resgate"
        >
          <Plus size={12} />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Movimentação — {inv.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Tipo: Aporte ou Resgate */}
          <div className="grid grid-cols-2 gap-2">
            {(["aporte", "resgate"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setOperationType(op)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  operationType === op
                    ? op === "aporte"
                      ? "bg-[#22c55e]/15 border-[#22c55e]/50 text-[#22c55e]"
                      : "bg-[#ef4444]/15 border-[#ef4444]/50 text-[#ef4444]"
                    : "bg-transparent border-[#2a2a2a] text-[#6b7280] hover:border-[#3a3a3a]"
                }`}
              >
                {op === "aporte"
                  ? <ArrowDownCircle size={14} />
                  : <ArrowUpCircle size={14} />
                }
                {op === "aporte" ? "Aportar" : "Resgatar"}
              </button>
            ))}
          </div>

          {/* Unidade — só para cripto com pricePerUnit */}
          {isCripto && (
            <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-[#6b7280]">Inserir em:</span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => { setUseCryptoUnit(false); setCryptoQty(""); }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    !useCryptoUnit ? "bg-[#6366f1] text-white" : "text-[#6b7280] hover:text-white"
                  }`}
                >
                  R$ BRL
                </button>
                <button
                  type="button"
                  onClick={() => { setUseCryptoUnit(true); setAmount(""); }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    useCryptoUnit ? "bg-[#f59e0b] text-black" : "text-[#6b7280] hover:text-white"
                  }`}
                >
                  {inv.symbol}
                </button>
              </div>
            </div>
          )}

          {useCryptoUnit && isCripto ? (
            <div className="space-y-1.5">
              <Label>Quantidade ({inv.symbol})</Label>
              <Input
                autoFocus
                value={cryptoQty}
                onChange={(e) => handleCryptoQtyChange(e.target.value)}
                placeholder="0.001"
                className="bg-[#0f0f0f] border-[#2a2a2a] font-mono"
                required
              />
              {amount && inv.pricePerUnit && (
                <p className="text-[11px] text-[#22c55e]">
                  ≈ R$ {amount} · {formatBRL(inv.pricePerUnit)}/{inv.symbol}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input
                autoFocus={!useCryptoUnit}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#0f0f0f] border-[#2a2a2a]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Descrição (opcional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={operationType === "aporte" ? `Aporte — ${inv.name}` : `Resgate — ${inv.name}`}
              className="bg-[#0f0f0f] border-[#2a2a2a]"
            />
          </div>

          <Button
            type="submit"
            className={`w-full font-medium cursor-pointer ${
              operationType === "aporte"
                ? "bg-[#22c55e] hover:bg-[#16a34a] text-black"
                : "bg-[#ef4444] hover:bg-[#dc2626] text-white"
            }`}
          >
            {operationType === "aporte" ? "Registrar Aporte" : "Registrar Resgate"}
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
  const [tempQuantity, setTempQuantity] = useState("");
  const [expanded, setExpanded] = useState(false);

  const isCripto = inv.type === "cripto" && inv.symbol;

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
      const qty = isCripto ? parseFloat(tempQuantity.replace(",", ".")) : undefined;
      updateInvestment(inv.id, {
        currentValue: parsed,
        ...(isCripto && !isNaN(qty!) ? { quantity: qty } : {}),
      });
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
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-white truncate">{inv.name}</p>
              {isCripto && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#6366f1]/15 text-[#a78bfa] flex-shrink-0">
                  {inv.symbol}
                </span>
              )}
            </div>
            <p className="text-xs text-[#6b7280]">{TYPE_LABEL[inv.type]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <AporteDialog inv={inv} />
          <button
            onClick={() => {
              setTempValue(String(inv.currentValue));
              setTempQuantity(String(inv.quantity ?? ""));
              setEditingValue(true);
            }}
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
          <div className="space-y-2">
            <Input
              autoFocus
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") setEditingValue(false);
              }}
              placeholder="Valor total (R$)"
              className="bg-[#0f0f0f] border-[#6366f1] text-white text-lg font-semibold h-9"
            />
            {isCripto && (
              <Input
                value={tempQuantity}
                onChange={(e) => setTempQuantity(e.target.value)}
                placeholder="Quantidade"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white text-sm h-8"
              />
            )}
          </div>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => {
              setTempValue(String(inv.currentValue));
              setTempQuantity(String(inv.quantity ?? ""));
              setEditingValue(true);
            }}
          >
            <p className="text-xl font-semibold text-white hover:text-[#a78bfa] transition-colors">
              {formatBRL(inv.currentValue)}
            </p>
            {isCripto && inv.quantity && inv.pricePerUnit && (
              <p className="text-[10px] text-[#6b7280] mt-0.5">
                {inv.quantity} {inv.symbol} · {formatBRL(inv.pricePerUnit)}/un
              </p>
            )}
          </div>
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
  const { loading, lastUpdated, fetchError, fetchPrices, hasCrypto } =
    useCryptoInvestimentosPrices();

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
        <div className="flex items-center gap-2">
          {/* Refresh cripto — só aparece se houver investimentos cripto */}
          {hasCrypto && (
            <div className="flex items-center gap-2">
              {lastUpdated && !fetchError && (
                <span className="text-[10px] text-[#6b7280]">
                  Preços: {lastUpdated}
                </span>
              )}
              {fetchError && (
                <span className="text-[10px] text-[#ef4444]">{fetchError}</span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchPrices(false)}
                disabled={loading}
                className="h-7 text-[10px] border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:text-white hover:border-[#3a3a3a] cursor-pointer px-2"
              >
                <RefreshCw
                  size={11}
                  className={`mr-1 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Buscando…" : "Atualizar cripto"}
              </Button>
            </div>
          )}
          <AddInvestmentDialog />
        </div>
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
