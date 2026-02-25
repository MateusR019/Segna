"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { useToast } from "@/hooks/useToast";
import { PoolStatus } from "@/types";
import { Droplets, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#a78bfa", "#fb923c", "#ec4899",
];

const NETWORKS = [
  "Ethereum",
  "BSC",
  "Polygon",
  "Arbitrum",
  "Optimism",
  "Avalanche",
  "Solana",
  "Base",
  "Outro",
];

export function AddPoolDialog() {
  const addPool = useDefiStore((s) => s.addPool);
  const { success } = useToast();

  const [open, setOpen] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [deposited, setDeposited] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [apy, setApy] = useState("");
  const [fees, setFees] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  function reset() {
    setProtocol("");
    setTokenA("");
    setTokenB("");
    setNetwork("Ethereum");
    setDeposited("");
    setCurrentValue("");
    setApy("");
    setFees("");
    setColor(COLORS[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const dep = parseFloat(deposited.replace(",", "."));
    const cur = currentValue
      ? parseFloat(currentValue.replace(",", "."))
      : dep;
    if (!protocol.trim() || !tokenA.trim() || !tokenB.trim() || isNaN(dep) || dep <= 0) return;

    addPool({
      protocol: protocol.trim(),
      tokenA: tokenA.trim().toUpperCase(),
      tokenB: tokenB.trim().toUpperCase(),
      network,
      depositedBRL: dep,
      currentValueBRL: isNaN(cur) ? dep : cur,
      feesEarnedBRL: fees ? parseFloat(fees.replace(",", ".")) || undefined : undefined,
      apy: apy ? parseFloat(apy.replace(",", ".")) || undefined : undefined,
      color,
      status: "active" as PoolStatus,
    });
    success(`Pool ${tokenA.toUpperCase()}/${tokenB.toUpperCase()} adicionada`);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-8 px-3 bg-[#06b6d4]/15 hover:bg-[#06b6d4]/25 text-[#06b6d4] border border-[#06b6d4]/30 hover:border-[#06b6d4]/50 text-xs font-medium cursor-pointer"
          variant="ghost"
        >
          <Plus size={13} className="mr-1" />
          Nova pool
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#111111] border border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Droplets size={16} className="text-[#06b6d4]" />
            Adicionar pool de liquidez
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          {/* Protocol */}
          <div className="space-y-1">
            <label className="text-xs text-[#6b7280]">Protocolo</label>
            <input
              type="text"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="Ex: Uniswap V3"
              required
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a]"
            />
          </div>

          {/* Token pair */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">Token A</label>
              <input
                type="text"
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value.toUpperCase())}
                placeholder="ETH"
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">Token B</label>
              <input
                type="text"
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value.toUpperCase())}
                placeholder="USDC"
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] font-mono"
              />
            </div>
          </div>

          {/* Network */}
          <div className="space-y-1">
            <label className="text-xs text-[#6b7280]">Rede</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white outline-none focus:border-[#3a3a3a] cursor-pointer"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Deposited / Current value */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">Depositado (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={deposited}
                onChange={(e) => setDeposited(e.target.value)}
                placeholder="0,00"
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">Valor atual (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder={deposited || "0,00"}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a]"
              />
            </div>
          </div>

          {/* APY + Fees */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">APY % (opcional)</label>
              <input
                type="text"
                inputMode="decimal"
                value={apy}
                onChange={(e) => setApy(e.target.value)}
                placeholder="12,5"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#6b7280]">Fees ganhas (R$)</label>
              <input
                type="text"
                inputMode="decimal"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a]"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#6b7280]">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all cursor-pointer"
                  style={{
                    background: c,
                    borderColor: color === c ? "white" : "transparent",
                    transform: color === c ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!protocol || !tokenA || !tokenB || !deposited}
            className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-black font-semibold text-sm disabled:opacity-30 cursor-pointer"
          >
            Adicionar pool
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
