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
import { Plus, Loader2 } from "lucide-react";
import { useDefiStore } from "@/store/defiStore";
import { SYMBOL_TO_ID, isKnownSymbol } from "@/lib/cryptoSymbols";

const TOKEN_COLORS = [
  "#f59e0b", "#6366f1", "#22c55e", "#ec4899",
  "#06b6d4", "#8b5cf6", "#ef4444", "#14b8a6",
];

export function AddTokenDialog() {
  const addToken = useDefiStore((s) => s.addToken);
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [color, setColor] = useState(TOKEN_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbolUpper = symbol.toUpperCase();
  const known = symbolUpper.length > 0 && isKnownSymbol(symbolUpper);

  async function fetchPrice(sym: string): Promise<number | null> {
    const geckoId = SYMBOL_TO_ID[sym];
    if (!geckoId) return null;
    try {
      const res = await fetch(`/api/crypto-prices?ids=${geckoId}`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      return data[geckoId]?.brl ?? null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const quantity = parseFloat(qty.replace(",", "."));
    if (isNaN(quantity) || quantity <= 0) {
      setError("Quantidade inválida");
      return;
    }
    if (!isKnownSymbol(symbolUpper)) {
      setError(`Símbolo "${symbolUpper}" não reconhecido. Verifique e tente novamente.`);
      return;
    }

    setLoading(true);
    const price = await fetchPrice(symbolUpper);
    setLoading(false);

    if (price === null) {
      setError("Não foi possível buscar o preço agora. Tente novamente.");
      return;
    }

    addToken({
      symbol: symbolUpper,
      name: name.trim() || symbolUpper,
      quantity,
      priceInBRL: price,
      color,
    });

    setSymbol("");
    setName("");
    setQty("");
    setError(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          Adicionar Token
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Token</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Símbolo</Label>
              <Input
                value={symbol}
                onChange={(e) => { setSymbol(e.target.value); setError(null); }}
                placeholder="BTC, ETH, SOL..."
                className="bg-[#0f0f0f] border-[#2a2a2a] uppercase"
                required
              />
              {symbolUpper.length > 1 && (
                <p className={`text-xs ${known ? "text-[#22c55e]" : "text-[#f59e0b]"}`}>
                  {known ? "✓ Preço automático" : "⚠ Símbolo não reconhecido"}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                Nome
                <span className="text-[#4a4a4a] font-normal text-xs">(opcional)</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bitcoin"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Quantidade</Label>
            <Input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Ex: 0.01"
              className="bg-[#0f0f0f] border-[#2a2a2a]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {TOKEN_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]" : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-[#ef4444]">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !symbol.trim() || !qty.trim()}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer disabled:opacity-50"
          >
            {loading
              ? <><Loader2 size={13} className="mr-1.5 animate-spin" />Buscando preço...</>
              : "Adicionar"
            }
          </Button>

          <p className="text-xs text-[#4a4a4a] text-center -mt-1">
            Preço buscado automaticamente via CoinGecko
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
