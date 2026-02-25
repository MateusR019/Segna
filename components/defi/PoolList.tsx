"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { useToast } from "@/hooks/useToast";
import { formatBRL } from "@/lib/format";
import { LiquidityPool } from "@/types";
import {
  Trash2, Check, X, Pencil, CheckCircle2, RefreshCcw,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function PnlBadge({ current, deposited }: { current: number; deposited: number }) {
  const pnl = current - deposited;
  const pct = deposited > 0 ? (pnl / deposited) * 100 : 0;
  const pos = pnl >= 0;
  return (
    <div className="text-right">
      <p
        className="text-sm font-semibold"
        style={{ color: pos ? "#22c55e" : "#ef4444" }}
      >
        {pos ? "+" : ""}
        {formatBRL(pnl)}
      </p>
      <p
        className="text-[10px]"
        style={{ color: pos ? "#16a34a" : "#dc2626" }}
      >
        {pos ? "+" : ""}
        {pct.toFixed(2)}%
      </p>
    </div>
  );
}

function NetworkBadge({ network }: { network: string }) {
  const colors: Record<string, string> = {
    Ethereum: "#627eea",
    BSC: "#f0b90b",
    Polygon: "#8247e5",
    Arbitrum: "#12aaff",
    Optimism: "#ff0420",
    Avalanche: "#e84142",
    Solana: "#9945ff",
    Base: "#0052ff",
  };
  const color = colors[network] ?? "#6b7280";
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
      style={{ background: color + "20", color }}
    >
      {network}
    </span>
  );
}

function PoolRow({ pool }: { pool: LiquidityPool }) {
  const { updatePool, removePool } = useDefiStore();
  const { success } = useToast();

  const [editingValue, setEditingValue] = useState(false);
  const [editingFees, setEditingFees] = useState(false);
  const [valueInput, setValueInput] = useState(String(pool.currentValueBRL));
  const [feesInput, setFeesInput] = useState(String(pool.feesEarnedBRL ?? ""));
  const [confirmDelete, setConfirmDelete] = useState(false);

  function saveValue() {
    const v = parseFloat(valueInput.replace(",", "."));
    if (!isNaN(v) && v >= 0) {
      updatePool(pool.id, { currentValueBRL: v });
      success("Valor atualizado");
    }
    setEditingValue(false);
  }

  function saveFees() {
    const v = parseFloat(feesInput.replace(",", "."));
    updatePool(pool.id, { feesEarnedBRL: isNaN(v) ? undefined : v });
    success("Fees atualizadas");
    setEditingFees(false);
  }

  function toggleStatus() {
    const next = pool.status === "active" ? "closed" : "active";
    updatePool(pool.id, { status: next });
    success(next === "closed" ? "Pool fechada" : "Pool reativada");
  }

  return (
    <div
      className={`bg-[#141414] border rounded-xl p-3 space-y-2 transition-all ${
        pool.status === "closed"
          ? "border-[#2a2a2a] opacity-60"
          : "border-[#2a2a2a] hover:border-[#3a3a3a]"
      }`}
    >
      {/* Top row: color + pair + network + P&L */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: pool.color }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white font-mono">
                {pool.tokenA}/{pool.tokenB}
              </span>
              <NetworkBadge network={pool.network} />
              {pool.apy !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#22c55e]/10 text-[#22c55e] font-medium">
                  {pool.apy}% APY
                </span>
              )}
              {pool.status === "closed" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#3a3a3a] text-[#6b7280]">
                  fechada
                </span>
              )}
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5">{pool.protocol}</p>
          </div>
        </div>
        <PnlBadge current={pool.currentValueBRL} deposited={pool.depositedBRL} />
      </div>

      {/* Values row */}
      <div className="flex items-center gap-4 text-xs">
        {/* Deposited */}
        <div>
          <p className="text-[10px] text-[#4a4a4a]">Depositado</p>
          <p className="text-white font-medium">{formatBRL(pool.depositedBRL)}</p>
        </div>

        {/* Current value — inline editable */}
        <div>
          <p className="text-[10px] text-[#4a4a4a]">Valor atual</p>
          {editingValue ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={valueInput}
                onChange={(e) => setValueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveValue();
                  if (e.key === "Escape") setEditingValue(false);
                }}
                onBlur={saveValue}
                className="w-20 px-1.5 py-0.5 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-xs text-white outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => { setValueInput(String(pool.currentValueBRL)); setEditingValue(true); }}
              className="text-white font-medium hover:text-[#06b6d4] transition-colors cursor-pointer flex items-center gap-1 group"
            >
              {formatBRL(pool.currentValueBRL)}
              <Pencil size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          )}
        </div>

        {/* Fees — inline editable */}
        <div>
          <p className="text-[10px] text-[#4a4a4a]">Fees</p>
          {editingFees ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={feesInput}
                onChange={(e) => setFeesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveFees();
                  if (e.key === "Escape") setEditingFees(false);
                }}
                onBlur={saveFees}
                className="w-20 px-1.5 py-0.5 bg-[#1a1a1a] border border-[#3a3a3a] rounded text-xs text-white outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => { setFeesInput(String(pool.feesEarnedBRL ?? "")); setEditingFees(true); }}
              className="text-[#f59e0b] font-medium hover:text-[#fbbf24] transition-colors cursor-pointer flex items-center gap-1 group"
            >
              {pool.feesEarnedBRL ? formatBRL(pool.feesEarnedBRL) : <span className="text-[#3a3a3a]">—</span>}
              <Pencil size={9} className="opacity-0 group-hover:opacity-50 transition-opacity text-[#6b7280]" />
            </button>
          )}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-end gap-1 pt-0.5">
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#ef4444] mr-1">Excluir?</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { removePool(pool.id); success("Pool removida"); }}
              className="h-6 w-6 text-[#ef4444] hover:text-[#dc2626] hover:bg-transparent cursor-pointer"
            >
              <Check size={12} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(false)}
              className="h-6 w-6 text-[#4a4a4a] hover:text-[#9ca3af] hover:bg-transparent cursor-pointer"
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <>
            {/* Toggle open/closed */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleStatus}
              title={pool.status === "active" ? "Fechar pool" : "Reativar pool"}
              className="h-7 w-7 text-[#3a3a3a] hover:text-[#22c55e] hover:bg-transparent cursor-pointer"
            >
              {pool.status === "active" ? (
                <CheckCircle2 size={13} />
              ) : (
                <RefreshCcw size={13} />
              )}
            </Button>
            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              className="h-7 w-7 text-[#3a3a3a] hover:text-[#ef4444] hover:bg-transparent cursor-pointer"
            >
              <Trash2 size={13} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function PoolList() {
  const pools = useDefiStore((s) => s.pools);
  const [showClosed, setShowClosed] = useState(false);

  if (pools.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 text-center space-y-1.5">
        <p className="text-sm text-[#4a4a4a]">Nenhuma pool cadastrada</p>
        <p className="text-xs text-[#3a3a3a]">
          Clique em &quot;Nova pool&quot; para adicionar sua primeira posição.
        </p>
      </div>
    );
  }

  const active = pools.filter((p) => p.status === "active");
  const closed = pools.filter((p) => p.status === "closed");

  return (
    <div className="space-y-2">
      {/* Active pools */}
      {active.length === 0 && (
        <p className="text-xs text-[#4a4a4a] py-2">Nenhuma pool ativa</p>
      )}
      {active.map((pool) => (
        <PoolRow key={pool.id} pool={pool} />
      ))}

      {/* Closed pools (collapsible) */}
      {closed.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowClosed((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer py-1"
          >
            {showClosed ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
            Pools fechadas ({closed.length})
          </button>
          {showClosed && closed.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </div>
      )}
    </div>
  );
}
