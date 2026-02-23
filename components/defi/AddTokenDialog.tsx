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
import { Plus } from "lucide-react";
import { useDefiStore } from "@/store/defiStore";

const TOKEN_COLORS = [
  "#f59e0b",
  "#6366f1",
  "#22c55e",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

export function AddTokenDialog() {
  const addToken = useDefiStore((s) => s.addToken);
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState(TOKEN_COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const quantity = parseFloat(qty.replace(",", "."));
    const priceInBRL = parseFloat(price.replace(",", "."));
    if (isNaN(quantity) || isNaN(priceInBRL) || quantity <= 0 || priceInBRL <= 0)
      return;
    addToken({
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      quantity,
      priceInBRL,
      color,
    });
    setSymbol("");
    setName("");
    setQty("");
    setPrice("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC"
                className="bg-[#0f0f0f] border-[#2a2a2a] uppercase"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bitcoin"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantidade</Label>
              <Input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0.01"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350000"
                className="bg-[#0f0f0f] border-[#2a2a2a]"
                required
              />
            </div>
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
                    color === c
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]"
                      : ""
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer"
          >
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
