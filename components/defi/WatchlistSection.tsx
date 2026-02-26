"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { SYMBOL_TO_ID, isKnownSymbol } from "@/lib/cryptoSymbols";
import { formatUSD } from "@/lib/format";
import {
  Eye, Plus, Trash2, RefreshCw, TrendingDown, TrendingUp,
  Check, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const WATCH_COLORS = [
  "#f59e0b", "#6366f1", "#22c55e", "#ec4899",
  "#06b6d4", "#8b5cf6", "#ef4444", "#14b8a6",
];

// Cache de preços: symbol → { usd, brl, ts }
type PriceCache = Record<string, { usd: number; ts: number }>;

export function WatchlistSection() {
  const { watchlist, addWatch, removeWatch, exchangeRate } = useDefiStore();

  const [prices, setPrices]           = useState<PriceCache>({});
  const [refreshing, setRefreshing]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [confirmDelId, setConfirmDelId] = useState<string | null>(null);

  // ── Add dialog state
  const [open, setOpen]             = useState(false);
  const [sym, setSym]               = useState("");
  const [watchName, setWatchName]   = useState("");
  const [targetStr, setTargetStr]   = useState("");
  const [color, setColor]           = useState(WATCH_COLORS[0]);
  const [addError, setAddError]     = useState<string | null>(null);

  const symUpper = sym.toUpperCase();
  const known    = symUpper.length > 1 && isKnownSymbol(symUpper);

  // ── Refresh preços via CoinGecko
  async function refreshPrices() {
    if (watchlist.length === 0) return;
    setRefreshing(true);

    const geckoIds = watchlist
      .map((w) => SYMBOL_TO_ID[w.symbol.toUpperCase()])
      .filter(Boolean)
      .join(",");

    if (!geckoIds) { setRefreshing(false); return; }

    try {
      const res  = await fetch(`/api/crypto-prices?ids=${geckoIds}`, { cache: "no-store" });
      const data = await res.json();
      const now  = Date.now();
      const next: PriceCache = { ...prices };
      watchlist.forEach((w) => {
        const id = SYMBOL_TO_ID[w.symbol.toUpperCase()];
        if (id && data[id]?.usd) {
          next[w.symbol.toUpperCase()] = { usd: data[id].usd, ts: now };
        }
      });
      setPrices(next);
    } catch { /* silently ignore */ }
    finally { setRefreshing(false); }
  }

  // ── Adicionar à watchlist
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!symUpper) return;
    if (!known) { setAddError(`"${symUpper}" não reconhecido`); return; }
    if (watchlist.some((w) => w.symbol.toUpperCase() === symUpper)) {
      setAddError("Já está na watchlist");
      return;
    }
    const target = parseFloat(targetStr.replace(",", "."));
    addWatch({
      symbol: symUpper,
      name:   watchName.trim() || symUpper,
      targetPriceUSD: !isNaN(target) && target > 0 ? target : undefined,
      color,
    });
    setSym(""); setWatchName(""); setTargetStr(""); setAddError(null);
    setOpen(false);
  }

  if (watchlist.length === 0 && !open) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#a78bfa]" />
            <span className="text-sm font-semibold text-white">Watchlist</span>
          </div>
          <AddWatchDialog
            open={open} setOpen={setOpen}
            sym={sym} setSym={setSym} symUpper={symUpper} known={known}
            watchName={watchName} setWatchName={setWatchName}
            targetStr={targetStr} setTargetStr={setTargetStr}
            color={color} setColor={setColor}
            addError={addError} setAddError={setAddError}
            onSubmit={handleAdd}
          />
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-dashed rounded-xl px-4 py-6 text-center space-y-2">
          <p className="text-sm text-[#4a4a4a]">Nenhum token na watchlist</p>
          <p className="text-xs text-[#3a3a3a]">Acompanhe tokens antes de comprar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <Eye size={14} className="text-[#a78bfa]" />
          <span className="text-sm font-semibold text-white group-hover:text-[#a78bfa] transition-colors">
            Watchlist
          </span>
          <span className="text-xs text-[#4a4a4a]">({watchlist.length})</span>
          {collapsed
            ? <ChevronDown size={13} className="text-[#4a4a4a]" />
            : <ChevronUp   size={13} className="text-[#4a4a4a]" />}
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            onClick={refreshPrices}
            disabled={refreshing}
            className="h-7 text-xs text-[#6b7280] hover:text-white gap-1 cursor-pointer"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            Atualizar
          </Button>
          <AddWatchDialog
            open={open} setOpen={setOpen}
            sym={sym} setSym={setSym} symUpper={symUpper} known={known}
            watchName={watchName} setWatchName={setWatchName}
            targetStr={targetStr} setTargetStr={setTargetStr}
            color={color} setColor={setColor}
            addError={addError} setAddError={setAddError}
            onSubmit={handleAdd}
          />
        </div>
      </div>

      {/* Lista */}
      {!collapsed && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl divide-y divide-[#1f1f1f]">
          {watchlist.map((w) => {
            const cached    = prices[w.symbol.toUpperCase()];
            const priceNow  = cached?.usd ?? null;
            const hasTarget = !!w.targetPriceUSD;
            const diff      = hasTarget && priceNow != null
              ? ((priceNow - w.targetPriceUSD!) / w.targetPriceUSD!) * 100
              : null;
            const belowTarget = diff !== null && diff <= 0;

            return (
              <div key={w.id} className="flex items-center gap-3 px-4 py-3">
                {/* Color dot + symbol */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: w.color + "30", color: w.color }}
                >
                  {w.symbol.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white">{w.symbol}</p>
                    {priceNow != null && (
                      <p className="text-sm text-[#9ca3af]">{formatUSD(priceNow)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {hasTarget && (
                      <span className="text-xs text-[#4a4a4a]">
                        Alvo: {formatUSD(w.targetPriceUSD!)}
                      </span>
                    )}
                    {diff !== null && (
                      <span
                        className="flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: belowTarget ? "#22c55e" : "#ef4444" }}
                      >
                        {belowTarget ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                        {belowTarget ? "" : "+"}{diff.toFixed(1)}%
                        {belowTarget ? " abaixo do alvo ✓" : " acima do alvo"}
                      </span>
                    )}
                    {!priceNow && (
                      <span className="text-xs text-[#3a3a3a]">clique Atualizar</span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                {confirmDelId === w.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#ef4444]">Excluir?</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[#ef4444] hover:bg-transparent cursor-pointer"
                      onClick={() => { removeWatch(w.id); setConfirmDelId(null); }}
                    ><Check size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-[#4a4a4a] hover:bg-transparent cursor-pointer"
                      onClick={() => setConfirmDelId(null)}
                    ><X size={12} /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon"
                    className="h-8 w-8 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer flex-shrink-0"
                    onClick={() => setConfirmDelId(w.id)}
                  ><Trash2 size={13} /></Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sub-componente: dialog de adicionar à watchlist ────────────────────────

interface AddDialogProps {
  open: boolean; setOpen: (v: boolean) => void;
  sym: string; setSym: (v: string) => void;
  symUpper: string; known: boolean;
  watchName: string; setWatchName: (v: string) => void;
  targetStr: string; setTargetStr: (v: string) => void;
  color: string; setColor: (v: string) => void;
  addError: string | null; setAddError: (v: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function AddWatchDialog({
  open, setOpen, sym, setSym, symUpper, known,
  watchName, setWatchName, targetStr, setTargetStr,
  color, setColor, addError, setAddError, onSubmit,
}: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAddError(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"
          className="h-7 text-xs border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:text-white hover:border-[#4a4a4a] gap-1 cursor-pointer"
        >
          <Plus size={11} /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Adicionar à Watchlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#6b7280]">Símbolo</label>
              <Input
                value={sym}
                onChange={(e) => { setSym(e.target.value); setAddError(null); }}
                placeholder="BTC, ETH..."
                className="bg-[#0f0f0f] border-[#2a2a2a] uppercase"
                required
              />
              {symUpper.length > 1 && (
                <p className={`text-xs ${known ? "text-[#22c55e]" : "text-[#f59e0b]"}`}>
                  {known ? "✓ Reconhecido" : "⚠ Desconhecido"}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-[#6b7280]">Nome <span className="text-[#4a4a4a]">(opcional)</span></label>
              <Input
                value={watchName}
                onChange={(e) => setWatchName(e.target.value)}
                placeholder="Bitcoin"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#6b7280]">Preço alvo USD <span className="text-[#4a4a4a]">(opcional)</span></label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6b7280]">$</span>
              <Input
                type="number"
                min={0}
                step="any"
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                placeholder="Ex: 80000"
                className="bg-[#0f0f0f] border-[#2a2a2a] pl-6"
              />
            </div>
            <p className="text-xs text-[#4a4a4a]">Mostra se preço está abaixo do alvo (oportunidade de compra)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#6b7280]">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {WATCH_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-all ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {addError && <p className="text-xs text-[#ef4444]">{addError}</p>}

          <Button type="submit" disabled={!sym.trim()}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer disabled:opacity-50"
          >
            Adicionar à Watchlist
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
