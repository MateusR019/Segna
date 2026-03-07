"use client";
import { useState } from "react";
import { useDefiStore } from "@/store/defiStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useToast } from "@/hooks/useToast";
import { PoolStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, RefreshCw, AlertCircle, CheckCircle2, ExternalLink, Key } from "lucide-react";
import { formatUSD } from "@/lib/format";
import type { DetectedPool } from "@/app/api/wallet-sync/route";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#a78bfa", "#fb923c", "#ec4899",
  "#84cc16", "#f472b6", "#38bdf8", "#34d399",
];

type View = "setup" | "ready" | "syncing" | "results" | "done";

function NetworkBadge({ network }: { network: string }) {
  const colors: Record<string, string> = {
    Ethereum: "#627eea", BSC: "#f0b90b", Polygon: "#8247e5",
    Arbitrum: "#12aaff", Optimism: "#ff0420", Avalanche: "#e84142",
    Solana: "#9945ff", Base: "#0052ff", Fantom: "#1969ff",
  };
  const c = colors[network] ?? "#6b7280";
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: c + "20", color: c }}>
      {network}
    </span>
  );
}

export function WalletSyncButton() {
  const { walletAddress, setWalletAddress, zerionApiKey, setZerionApiKey } = useSettingsStore();
  const addPool = useDefiStore((s) => s.addPool);
  const { success, error: toastError } = useToast();

  const isConfigured = !!(walletAddress && zerionApiKey);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(() => isConfigured ? "ready" : "setup");

  // Setup form state
  const [inputAddress, setInputAddress] = useState(walletAddress);
  const [inputKey, setInputKey]         = useState(zerionApiKey);

  // Sync results
  const [detected, setDetected] = useState<DetectedPool[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [syncError, setSyncError] = useState<string | null>(null);

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) {
      const configured = !!(walletAddress && zerionApiKey);
      setView(configured ? "ready" : "setup");
      setInputAddress(walletAddress);
      setInputKey(zerionApiKey);
      setDetected([]);
      setSelected(new Set());
      setSyncError(null);
    }
  }

  function saveSetup() {
    if (!inputAddress.trim() || !inputKey.trim()) return;
    setWalletAddress(inputAddress);
    setZerionApiKey(inputKey);
    setView("ready");
  }

  async function runSync() {
    setView("syncing");
    setSyncError(null);
    try {
      const params = new URLSearchParams({
        address: walletAddress,
        key:     zerionApiKey,
      });
      const res = await fetch(`/api/wallet-sync?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setDetected(data.pools ?? []);
      const all = new Set<number>(Array.from({ length: data.pools.length }, (_, i) => i));
      setSelected(all);
      setView("results");
    } catch (err) {
      setSyncError(String(err instanceof Error ? err.message : err));
      setView("ready");
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function importSelected() {
    const toImport = detected.filter((_, i) => selected.has(i));
    toImport.forEach((pool, idx) => {
      addPool({
        protocol: pool.protocol,
        tokenA: pool.tokenA,
        tokenB: pool.tokenB,
        network: pool.network,
        depositedUSD: pool.depositedUSD,
        currentValueUSD: pool.currentValueUSD,
        feesEarnedUSD: undefined,
        apy: undefined,
        color: COLORS[(idx) % COLORS.length],
        status: "active" as PoolStatus,
      });
    });
    success(`${toImport.length} ${toImport.length === 1 ? "pool importada" : "pools importadas"}!`);
    setView("done");
    setTimeout(() => setOpen(false), 1200);
  }

  void toastError; // suppress unused warning

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 bg-[#6366f1]/15 hover:bg-[#6366f1]/25 text-[#a78bfa] border border-[#6366f1]/30 hover:border-[#6366f1]/50 text-xs font-medium cursor-pointer gap-1.5"
        >
          <Wallet size={13} />
          Sync Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#111111] border border-[#2a2a2a] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Wallet size={15} className="text-[#a78bfa]" />
            Sincronizar Wallet
          </DialogTitle>
        </DialogHeader>

        {/* ── SETUP ── */}
        {view === "setup" && (
          <div className="space-y-4 mt-1">
            {/* Zerion info */}
            <div className="bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Key size={12} className="text-[#a78bfa] flex-shrink-0" />
                <p className="text-xs font-medium text-[#a78bfa]">API key gratuita da Zerion</p>
              </div>
              <ol className="text-[11px] text-[#6b7280] space-y-1 list-decimal list-inside leading-relaxed">
                <li>Acesse <a href="https://dashboard.zerion.io" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#a78bfa] underline">dashboard.zerion.io</a></li>
                <li>Crie conta grátis (sem cartão)</li>
                <li>Vá em <strong className="text-[#9ca3af]">API Keys</strong> e gere uma chave</li>
                <li>Cole a chave no campo abaixo</li>
              </ol>
              <p className="text-[10px] text-[#4a4a4a]">Plano gratuito: 3.000 requisições/dia</p>
              <a
                href="https://dashboard.zerion.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#6366f1] hover:text-[#a78bfa] transition-colors font-medium"
              >
                Abrir Zerion Dashboard
                <ExternalLink size={10} />
              </a>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-[#6b7280]">Endereço da wallet (EVM)</label>
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#6b7280]">Zerion API Key</label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="zk_dev_..."
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#3a3a3a] font-mono text-xs"
                />
              </div>
            </div>

            <Button
              onClick={saveSetup}
              disabled={!inputAddress.trim() || !inputKey.trim()}
              className="w-full bg-[#6366f1] hover:bg-[#5558e8] text-white text-sm font-semibold disabled:opacity-30 cursor-pointer"
            >
              Salvar e continuar
            </Button>
          </div>
        )}

        {/* ── READY ── */}
        {view === "ready" && (
          <div className="space-y-4 mt-1">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6b7280]">Wallet</span>
                <button
                  onClick={() => setView("setup")}
                  className="text-[10px] text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer"
                >
                  editar
                </button>
              </div>
              <p className="text-xs text-white font-mono truncate">{walletAddress}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span className="text-[10px] text-[#22c55e]">Wallet configurada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                  <span className="text-[10px] text-[#a78bfa]">Zerion API key salva</span>
                </div>
              </div>
            </div>

            {syncError && (
              <div className="flex items-start gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-3">
                <AlertCircle size={14} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#ef4444]">{syncError}</p>
              </div>
            )}

            <Button
              onClick={runSync}
              className="w-full bg-[#6366f1] hover:bg-[#5558e8] text-white text-sm font-semibold cursor-pointer gap-2"
            >
              <RefreshCw size={14} />
              Sincronizar agora
            </Button>

            <p className="text-[10px] text-[#3a3a3a] text-center">
              Busca posições DeFi em todas as chains via Zerion
            </p>
          </div>
        )}

        {/* ── SYNCING ── */}
        {view === "syncing" && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#6366f1]/30 border-t-[#6366f1] animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-sm text-white font-medium">Buscando posições...</p>
              <p className="text-xs text-[#4a4a4a]">Verificando protocolos DeFi em todas as chains</p>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {view === "results" && (
          <div className="space-y-3 mt-1">
            {detected.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <p className="text-sm text-[#6b7280]">Nenhuma posição DeFi encontrada</p>
                <p className="text-xs text-[#3a3a3a]">Verifique o endereço e tente novamente</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#9ca3af]">
                    {detected.length} {detected.length === 1 ? "posição encontrada" : "posições encontradas"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-[10px] text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer"
                    >
                      desmarcar todos
                    </button>
                    <button
                      onClick={() => setSelected(new Set(detected.map((_, i) => i)))}
                      className="text-[10px] text-[#a78bfa] hover:text-white cursor-pointer"
                    >
                      marcar todos
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {detected.map((pool, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSelect(i)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        selected.has(i)
                          ? "bg-[#6366f1]/10 border-[#6366f1]/30"
                          : "bg-[#1a1a1a] border-[#2a2a2a] opacity-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                        selected.has(i) ? "bg-[#6366f1] border-[#6366f1]" : "border-[#3a3a3a]"
                      }`}>
                        {selected.has(i) && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold font-mono text-white">
                            {pool.tokenA}/{pool.tokenB}
                          </span>
                          <NetworkBadge network={pool.network} />
                        </div>
                        <p className="text-[10px] text-[#6b7280] mt-0.5">{pool.protocol}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-white">{formatUSD(pool.currentValueUSD)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-2.5">
                  <p className="text-[10px] text-[#4a4a4a]">
                    💡 O valor depositado será igual ao atual. Ajuste manualmente se desejar rastrear P&L desde a entrada.
                  </p>
                </div>

                <Button
                  onClick={importSelected}
                  disabled={selected.size === 0}
                  className="w-full bg-[#6366f1] hover:bg-[#5558e8] text-white text-sm font-semibold disabled:opacity-30 cursor-pointer"
                >
                  Importar {selected.size} {selected.size === 1 ? "posição" : "posições"}
                </Button>
              </>
            )}
          </div>
        )}

        {/* ── DONE ── */}
        {view === "done" && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-[#22c55e]" />
            </div>
            <p className="text-sm text-white font-medium">Posições importadas!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
