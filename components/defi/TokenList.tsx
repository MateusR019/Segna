"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, TrendingUp, TrendingDown } from "lucide-react";
import { formatBRL } from "@/lib/format";

export function TokenList() {
  const { tokens, removeToken, updatePrice, updateQuantity, setAlertPrice } = useDefiStore();
  const total = tokens.reduce((acc, t) => acc + t.quantity * t.priceInBRL, 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");

  function startEdit(id: string, price: number, qty: number) {
    setEditingId(id);
    setEditPrice(price.toString());
    setEditQty(qty.toString());
  }

  function confirmEdit(id: string) {
    const p = parseFloat(editPrice.replace(",", "."));
    const q = parseFloat(editQty.replace(",", "."));
    if (!isNaN(p) && p > 0) updatePrice(id, p);
    if (!isNaN(q) && q > 0) updateQuantity(id, q);
    setEditingId(null);
  }

  function calcVariation(token: typeof tokens[0]): number | null {
    if (!token.priceAtAlert || token.priceAtAlert === 0) return null;
    return ((token.priceInBRL - token.priceAtAlert) / token.priceAtAlert) * 100;
  }

  if (tokens.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="flex items-center justify-center h-48 text-[#6b7280] text-sm">
          Nenhum token adicionado
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#9ca3af]">
          Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        {tokens.map((token) => {
          const value = token.quantity * token.priceInBRL;
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
          const editing = editingId === token.id;

          const variation = calcVariation(token);
          const hasAlert = variation !== null;
          const alertPositive = variation !== null && variation >= 0;

          return (
            <div
              key={token.id}
              className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-md border border-[#2a2a2a]"
            >
              {/* Symbol + color dot */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: token.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
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

              {/* Editable fields or display */}
              {editing ? (
                <div className="flex items-center gap-1.5 mx-3">
                  <Input
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="h-7 w-20 text-xs bg-[#1a1a1a] border-[#2a2a2a] px-2"
                    placeholder="Qtd"
                  />
                  <Input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="h-7 w-24 text-xs bg-[#1a1a1a] border-[#2a2a2a] px-2"
                    placeholder="Preço"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#22c55e] hover:bg-transparent cursor-pointer"
                    onClick={() => confirmEdit(token.id)}
                  >
                    <Check size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#6b7280] hover:bg-transparent cursor-pointer"
                    onClick={() => setEditingId(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="text-right mx-3">
                  <p className="text-sm text-white font-medium">
                    {formatBRL(value)}
                  </p>
                  <p className="text-xs text-[#6b7280]">
                    {token.quantity} · {pct}%
                  </p>
                </div>
              )}

              {!editing && (
                <div className="flex items-center gap-0.5">
                  {/* Set alert base price */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title={token.priceAtAlert ? `Base: ${formatBRL(token.priceAtAlert)}` : "Definir preço base para alerta"}
                    className="h-9 w-9 hover:bg-transparent cursor-pointer"
                    style={{ color: token.priceAtAlert ? "#f59e0b" : "#3a3a3a" }}
                    onClick={() => setAlertPrice(token.id, token.priceInBRL)}
                  >
                    <TrendingUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#6b7280] hover:text-white hover:bg-transparent cursor-pointer"
                    onClick={() => startEdit(token.id, token.priceInBRL, token.quantity)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#6b7280] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
                    onClick={() => removeToken(token.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
