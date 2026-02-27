"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, TrendingUp, TrendingDown } from "lucide-react";
import { formatUSD } from "@/lib/format";
import { TokenAvgCost } from "./TokenAvgCost";
import { PriceHistoryPanel } from "./PriceHistoryPanel";

export function TokenList() {
  const { tokens, removeToken, updatePrice, updatePriceUSD, updateQuantity, setAlertPrice, exchangeRate } = useDefiStore();
  const { success } = useToast();

  const total = tokens.reduce((acc, t) => {
    if (t.priceInUSD) return acc + t.quantity * t.priceInUSD;
    if (exchangeRate?.usdToBRL) return acc + (t.quantity * t.priceInBRL) / exchangeRate.usdToBRL;
    return acc;
  }, 0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function startEdit(id: string, priceInBRL: number, qty: number, priceInUSD?: number) {
    setEditingId(id);
    if (priceInUSD) {
      setEditPrice(priceInUSD.toFixed(6));
    } else if (exchangeRate?.usdToBRL) {
      setEditPrice((priceInBRL / exchangeRate.usdToBRL).toFixed(6));
    } else {
      setEditPrice("");
    }
    setEditQty(qty.toString());
  }

  function confirmEdit(id: string) {
    const p = parseFloat(editPrice.replace(",", "."));
    const q = parseFloat(editQty.replace(",", "."));
    if (!isNaN(p) && p > 0) {
      updatePriceUSD(id, p);
      // Mantém BRL sincronizado para o dashboard
      if (exchangeRate?.usdToBRL) {
        updatePrice(id, p * exchangeRate.usdToBRL);
      }
    }
    if (!isNaN(q) && q > 0) updateQuantity(id, q);
    setEditingId(null);
    success("Token atualizado!");
  }

  // Calcula variação vs preço base (priceAtAlert) em USD
  function calcVariation(token: typeof tokens[0]): number | null {
    if (!token.priceAtAlert || token.priceAtAlert === 0) return null;
    const current = token.priceInUSD
      ?? (exchangeRate?.usdToBRL ? token.priceInBRL / exchangeRate.usdToBRL : null);
    if (!current) return null;
    return ((current - token.priceAtAlert) / token.priceAtAlert) * 100;
  }

  if (tokens.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a] rounded-xl">
        <CardContent className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-sm text-[#4a4a4a]">Nenhum token adicionado</p>
          <p className="text-xs text-[#3a3a3a]">Use &quot;Adicionar Token&quot; para rastrear seu portfolio.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] rounded-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {tokens.map((token, idx) => {
          const valueUSD = token.priceInUSD
            ? token.quantity * token.priceInUSD
            : exchangeRate?.usdToBRL
            ? (token.quantity * token.priceInBRL) / exchangeRate.usdToBRL
            : 0;
          const pct = total > 0 ? ((valueUSD / total) * 100).toFixed(1) : "0";
          const editing = editingId === token.id;
          const variation = calcVariation(token);
          const hasAlert = variation !== null;
          const alertPositive = variation !== null && variation >= 0;

          return (
            <div
              key={token.id}
              className="list-item p-3 bg-[#141414] rounded-xl border border-[#2a2a2a] space-y-2 hover:border-[#3a3a3a] transition-colors"
              style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
            >
              {/* Main row */}
              <div className="flex items-center justify-between">
                {/* Symbol */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                    style={{ background: token.color + "30", color: token.color }}
                  >
                    {token.symbol.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-white">{token.symbol}</p>
                      {hasAlert && (
                        <span
                          className="flex items-center gap-0.5 text-xs font-medium"
                          style={{ color: alertPositive ? "#22c55e" : "#ef4444" }}
                        >
                          {alertPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {alertPositive ? "+" : ""}{variation!.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6b7280] truncate">{token.name}</p>
                  </div>
                </div>

                {/* Edit / display */}
                {editing ? (
                  <div className="flex items-center gap-1.5 mx-2 flex-wrap justify-end">
                    <Input
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="h-7 w-16 text-xs bg-[#1a1a1a] border-[#2a2a2a] px-2"
                      placeholder="Qtd"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#6b7280]">$</span>
                      <Input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="h-7 w-24 text-xs bg-[#1a1a1a] border-[#2a2a2a] px-2"
                        placeholder="Preço USD"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#22c55e] hover:bg-transparent cursor-pointer" onClick={() => confirmEdit(token.id)}>
                      <Check size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6b7280] hover:bg-transparent cursor-pointer" onClick={() => setEditingId(null)}>
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-right mx-2">
                    <p className="text-sm text-white font-medium">{formatUSD(valueUSD)}</p>
                    {token.priceInUSD && (
                      <p className="text-xs text-[#9ca3af]">{formatUSD(token.priceInUSD)} / token</p>
                    )}
                    <p className="text-xs text-[#6b7280]">{token.quantity} · {pct}%</p>
                  </div>
                )}

                {/* Action buttons */}
                {!editing && (
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost" size="icon"
                      title={token.priceAtAlert ? `Base: $${token.priceAtAlert.toFixed(4)}` : "Definir preço base (USD atual)"}
                      className="h-9 w-9 hover:bg-transparent cursor-pointer"
                      style={{ color: token.priceAtAlert ? "#f59e0b" : "#3a3a3a" }}
                      onClick={() => {
                        const priceUSD = token.priceInUSD ?? (exchangeRate?.usdToBRL ? token.priceInBRL / exchangeRate.usdToBRL : 0);
                        setAlertPrice(token.id, priceUSD);
                        success("Preço base definido!");
                      }}
                    >
                      <TrendingUp size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-[#6b7280] hover:text-white hover:bg-transparent cursor-pointer" onClick={() => startEdit(token.id, token.priceInBRL, token.quantity, token.priceInUSD)}>
                      <Pencil size={14} />
                    </Button>
                    {/* Delete com confirmação */}
                    {confirmDeleteId === token.id ? (
                      <>
                        <span className="text-xs text-[#ef4444] mx-1">Excluir?</span>
                        <Button variant="ghost" size="icon"
                          className="h-9 w-9 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer"
                          onClick={() => { removeToken(token.id); setConfirmDeleteId(null); success("Token removido"); }}
                        >
                          <Check size={14} />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-9 w-9 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon"
                        className="h-9 w-9 text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                        onClick={() => setConfirmDeleteId(token.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Extra row: avg cost + price history */}
              {!editing && (
                <div className="flex items-center gap-4 pl-5 flex-wrap">
                  <TokenAvgCost
                    tokenId={token.id}
                    symbol={token.symbol}
                    currentPriceUSD={token.priceInUSD ?? null}
                    avgCostUSD={token.avgCostUSD}
                    avgCostBRL={token.avgCostBRL}
                  />
                  <PriceHistoryPanel tokenId={token.id} symbol={token.symbol} />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
