"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Trash2,
  Check,
} from "lucide-react";
import { useDefiStore } from "@/store/defiStore";
import type { TradeType } from "@/types";

// ─── Add Trade Dialog ─────────────────────────────────────────────────────────

interface TradeDialogProps {
  onAdded?: () => void;
}

export function TradeDialog({ onAdded }: TradeDialogProps) {
  const [open, setOpen] = useState(false);

  const tokens = useDefiStore((s) => s.tokens);
  const addTrade = useDefiStore((s) => s.addTrade);

  const [tokenId, setTokenId] = useState("");
  const [type, setType] = useState<TradeType>("buy");
  const [quantity, setQuantity] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");

  const totalUSD =
    (parseFloat(quantity) || 0) * (parseFloat(priceUSD) || 0);

  function handleOpen() {
    setTokenId(tokens[0]?.id ?? "");
    setType("buy");
    setQuantity("");
    setPriceUSD("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setNote("");
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenId || !quantity || !priceUSD) return;
    addTrade({
      tokenId,
      type,
      quantity: parseFloat(quantity),
      priceUSD: parseFloat(priceUSD),
      date,
      note: note.trim() || undefined,
    });
    setOpen(false);
    onAdded?.();
  }

  if (tokens.length === 0) return null;

  const inputClass =
    "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#6366f1] transition-colors";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] text-[#9ca3af] hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
      >
        <ArrowRightLeft size={12} />
        Registrar trade
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={15} className="text-[#a78bfa]" />
                <h2 className="text-sm font-semibold text-white">
                  Registrar Trade
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#4a4a4a] hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Token */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Token
                </label>
                <select
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1] transition-colors cursor-pointer"
                >
                  {tokens.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: "#1a1a1a" }}>
                      {t.symbol} — {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("buy")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={
                      type === "buy"
                        ? {
                            background: "#22c55e22",
                            color: "#22c55e",
                            border: "1px solid #22c55e44",
                          }
                        : { color: "#4a4a4a", border: "1px solid #2a2a2a" }
                    }
                  >
                    <TrendingUp size={13} />
                    Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("sell")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={
                      type === "sell"
                        ? {
                            background: "#ef444422",
                            color: "#ef4444",
                            border: "1px solid #ef444444",
                          }
                        : { color: "#4a4a4a", border: "1px solid #2a2a2a" }
                    }
                  >
                    <TrendingDown size={13} />
                    Venda
                  </button>
                </div>
              </div>

              {/* Quantity + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                    Preço USD
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value)}
                    placeholder="0.00"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Total */}
              {totalUSD > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                  <span className="text-xs text-[#6b7280]">Total</span>
                  <span className="text-sm font-semibold text-white">
                    $
                    {totalUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-[#6b7280] uppercase tracking-wide">
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Observações sobre a trade"
                  className={inputClass}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 text-sm text-[#6b7280] hover:text-white transition-colors cursor-pointer border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!tokenId || !quantity || !priceUSD}
                  className="flex-1 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: type === "buy" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {type === "buy" ? "Registrar Compra" : "Registrar Venda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Trade History List ───────────────────────────────────────────────────────

export function TradeHistory() {
  const trades = useDefiStore((s) => s.trades);
  const removeTrade = useDefiStore((s) => s.removeTrade);
  const tokens = useDefiStore((s) => s.tokens);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const tokenMap = Object.fromEntries(tokens.map((t) => [t.id, t]));
  const sortedTrades = [...trades].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  if (sortedTrades.length === 0) {
    return (
      <p className="text-sm text-[#4a4a4a] text-center py-4">
        Nenhuma trade registrada
      </p>
    );
  }

  return (
    <div>
      {sortedTrades.map((trade) => {
        const token = tokenMap[trade.tokenId];
        if (!token) return null;

        return (
          <div
            key={trade.id}
            className="group flex items-center gap-3 py-2.5 border-b border-[#1f1f1f] last:border-0"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: token.color }}
            />

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-white">
                  {token.symbol}
                </span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background:
                      trade.type === "buy" ? "#22c55e22" : "#ef444422",
                    color: trade.type === "buy" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {trade.type === "buy" ? "Compra" : "Venda"}
                </span>
                <span className="text-xs text-[#6b7280]">{trade.date}</span>
              </div>
              <p className="text-xs text-[#6b7280]">
                {trade.quantity} ×{" "}
                {trade.priceUSD < 1
                  ? `$${trade.priceUSD.toFixed(6)}`
                  : `$${trade.priceUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}`}{" "}
                ={" "}
                <span className="text-white font-medium">
                  $
                  {trade.totalUSD.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
              {trade.note && (
                <p className="text-[11px] text-[#6b7280]">{trade.note}</p>
              )}
            </div>

            {/* Delete */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {confirmDelete === trade.id ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      removeTrade(trade.id);
                      setConfirmDelete(null);
                    }}
                    className="text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer"
                    aria-label="Confirmar exclusão"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
                    aria-label="Cancelar"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(trade.id)}
                  className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer"
                  aria-label="Remover trade"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
