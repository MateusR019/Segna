"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Check, X, Activity, Scale, TrendingDown, TrendingUp, Pencil, AlertTriangle } from "lucide-react";
import { useCorporalStore } from "@/store/corporalStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useHydrated } from "@/hooks/useHydrated";
import { Skeleton } from "@/components/ui/skeleton";
import type { BodyMetric } from "@/types";

// ─── Add Form ─────────────────────────────────────────────────────────────────

function AddMetricForm({ onClose }: { onClose: () => void }) {
  const addMetric = useCorporalStore((s) => s.addMetric);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [note, setNote] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  const hasValue = weight || waist || bodyFat || muscleMass;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasValue) return;
    addMetric({
      date,
      weight: weight ? parseFloat(weight) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  }

  const inputClass =
    "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#6366f1] transition-colors";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-3"
    >
      <p className="text-sm font-medium text-white">Nova medição</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Peso (kg)</label>
          <input
            type="number" step="0.1" value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="ex: 75.5" className={inputClass} autoFocus
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowExtras((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
      >
        <span className={`transition-transform duration-200 ${showExtras ? "rotate-90" : ""}`}>▶</span>
        {showExtras ? "Ocultar" : "Adicionar"} cintura, gordura e músculo
      </button>

      {showExtras && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Cintura (cm)</label>
            <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="ex: 82" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Gordura (%)</label>
            <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="ex: 18.5" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Músculo (%)</label>
            <input type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} placeholder="ex: 42" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#4a4a4a] uppercase tracking-wide">Nota</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" className={inputClass} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1f1f1f]">
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer">
          Cancelar
        </button>
        <button
          type="submit" disabled={!hasValue}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={12} /> Salvar
        </button>
      </div>
    </form>
  );
}

// ─── MetricChart (genérico) ───────────────────────────────────────────────────

type MetricField = "weight" | "waist" | "bodyFat" | "muscleMass";

interface MetricChartProps {
  metrics: BodyMetric[];
  field: MetricField;
  color: string;
  unit: string;
}

function MetricChart({ metrics, field, color, unit }: MetricChartProps) {
  const filtered = [...metrics]
    .filter((m) => m[field] !== undefined)
    .slice(0, 30)
    .reverse();

  if (filtered.length < 2) {
    return (
      <p className="text-xs text-[#4a4a4a] text-center py-3">
        Adicione pelo menos 2 medições para ver o gráfico
      </p>
    );
  }

  const values = filtered.map((m) => m[field] as number);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 0.5;

  const W = 300; const H = 80; const pad = 8;
  const iw = W - pad * 2; const ih = H - pad * 2;

  const pts = filtered.map((m, i) => {
    const x = pad + (i / (filtered.length - 1)) * iw;
    const y = pad + (1 - ((m[field] as number) - minV) / range) * ih;
    return [x, y] as [number, number];
  });

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  const lastVal = filtered[filtered.length - 1][field] as number;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "80px" }}>
        {[0.25, 0.5, 0.75].map((r) => (
          <line key={r} x1={pad} x2={W - pad} y1={pad + (1 - r) * ih} y2={pad + (1 - r) * ih} stroke="#1f1f1f" strokeWidth="0.5" />
        ))}
        <polyline points={`${pad},${H - pad} ${polyline} ${W - pad},${H - pad}`} fill={color} fillOpacity="0.07" stroke="none" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lx} cy={ly} r="3" fill={color} />
      </svg>
      <div className="flex items-center justify-between text-xs text-[#4a4a4a]">
        <span>{format(new Date(filtered[0].date + "T00:00:00"), "d MMM", { locale: ptBR })}</span>
        <span className="text-white text-xs font-medium">{lastVal} {unit}</span>
        <span>{format(new Date(filtered[filtered.length - 1].date + "T00:00:00"), "d MMM", { locale: ptBR })}</span>
      </div>
    </div>
  );
}

// ─── IMC helpers ──────────────────────────────────────────────────────────────

function getImcClass(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "#f59e0b" };
  if (imc < 25)   return { label: "Peso normal",    color: "#22c55e" };
  if (imc < 30)   return { label: "Sobrepeso",      color: "#f97316" };
  return { label: "Obesidade", color: "#ef4444" };
}

// ─── Metric Row (com edição inline) ──────────────────────────────────────────

function MetricRow({
  metric,
  onRemove,
  onEdit,
}: {
  metric: BodyMetric;
  onRemove: () => void;
  onEdit: (updates: Partial<Omit<BodyMetric, "id" | "createdAt">>) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");

  // Edit state
  const [date,       setDate]       = useState(metric.date);
  const [weight,     setWeight]     = useState(metric.weight !== undefined ? String(metric.weight) : "");
  const [waist,      setWaist]      = useState(metric.waist !== undefined ? String(metric.waist) : "");
  const [bodyFat,    setBodyFat]    = useState(metric.bodyFat !== undefined ? String(metric.bodyFat) : "");
  const [muscleMass, setMuscleMass] = useState(metric.muscleMass !== undefined ? String(metric.muscleMass) : "");
  const [note,       setNoteVal]    = useState(metric.note ?? "");

  function confirmEdit() {
    onEdit({
      date,
      weight:     weight     ? parseFloat(weight)     : undefined,
      waist:      waist      ? parseFloat(waist)      : undefined,
      bodyFat:    bodyFat    ? parseFloat(bodyFat)    : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined,
      note:       note.trim() || undefined,
    });
    setMode("view");
  }

  const chips = [
    metric.weight !== undefined && `${metric.weight} kg`,
    metric.waist !== undefined && `${metric.waist} cm cintura`,
    metric.bodyFat !== undefined && `${metric.bodyFat}% gordura`,
    metric.muscleMass !== undefined && `${metric.muscleMass}% músculo`,
  ].filter(Boolean) as string[];

  const inputSm = "bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#6366f1] transition-colors w-full";

  if (mode === "edit") {
    return (
      <div className="py-2.5 border-b border-[#1f1f1f] last:border-0 space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputSm} />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Peso (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="—" className={inputSm} />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Cintura (cm)</label>
            <input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="—" className={inputSm} />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Gordura (%)</label>
            <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="—" className={inputSm} />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Músculo (%)</label>
            <input type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} placeholder="—" className={inputSm} />
          </div>
          <div className="space-y-0.5">
            <label className="text-xs text-[#4a4a4a]">Nota</label>
            <input type="text" value={note} onChange={(e) => setNoteVal(e.target.value)} placeholder="—" className={inputSm} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={confirmEdit} className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer font-medium">
            <Check size={11} /> Salvar
          </button>
          <button onClick={() => setMode("view")} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-[#1f1f1f] last:border-0">
      {/* Data */}
      <div className="flex-shrink-0 w-14">
        <p className="text-xs font-medium text-white">
          {format(new Date(metric.date + "T00:00:00"), "d MMM", { locale: ptBR })}
        </p>
        <p className="text-xs text-[#4a4a4a]">
          {format(new Date(metric.date + "T00:00:00"), "yyyy")}
        </p>
      </div>

      {/* Chips */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span key={chip} className="text-xs bg-[#141414] border border-[#2a2a2a] rounded px-2 py-0.5 text-[#9ca3af]">
              {chip}
            </span>
          ))}
        </div>
        {metric.note && <p className="text-xs text-[#4a4a4a]">{metric.note}</p>}
      </div>

      {/* Ações — sempre visíveis (discretas), destacam no hover */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {mode === "delete" ? (
          <>
            <span className="text-xs text-[#ef4444] mr-1">Remover?</span>
            <button type="button" onClick={onRemove} className="text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer p-1" aria-label="Confirmar">
              <Check size={12} />
            </button>
            <button type="button" onClick={() => setMode("view")} className="text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer p-1" aria-label="Cancelar">
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="p-1.5 rounded text-[#3a3a3a] hover:text-[#a78bfa] hover:bg-[#6366f1]/10 transition-all cursor-pointer"
              aria-label="Editar"
              title="Editar"
            >
              <Pencil size={12} />
            </button>
            <button
              type="button"
              onClick={() => setMode("delete")}
              className="p-1.5 rounded text-[#3a3a3a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all cursor-pointer"
              aria-label="Excluir"
              title="Excluir"
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stat mini-card ───────────────────────────────────────────────────────────

function StatCard({ label, value, trend }: { label: string; value: string; trend?: "up" | "down" | null }) {
  return (
    <div className="bg-[#141414] rounded-lg p-2.5 text-center">
      <p className="text-xs text-[#6b7280] mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {trend === "down" && <TrendingDown size={10} className="text-[#22c55e]" />}
        {trend === "up" && <TrendingUp size={10} className="text-[#ef4444]" />}
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "weight" | "waist" | "bodyFat" | "muscleMass";

const TAB_CONFIG: { key: Tab; label: string; field: MetricField; color: string; unit: string }[] = [
  { key: "weight",     label: "Peso",    field: "weight",     color: "#6366f1", unit: "kg" },
  { key: "waist",      label: "Cintura", field: "waist",      color: "#f59e0b", unit: "cm" },
  { key: "bodyFat",    label: "Gordura", field: "bodyFat",    color: "#ef4444", unit: "%" },
  { key: "muscleMass", label: "Músculo", field: "muscleMass", color: "#22c55e", unit: "%" },
];

export default function CorporalPage() {
  const hydrated = useHydrated();
  const metrics     = useCorporalStore((s) => s.metrics);
  const removeMetric = useCorporalStore((s) => s.removeMetric);
  const editMetric   = useCorporalStore((s) => s.editMetric);
  const height    = useSettingsStore((s) => s.height);
  const setHeight = useSettingsStore((s) => s.setHeight);
  const [showForm, setShowForm]     = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>("weight");
  const [editHeight, setEditHeight] = useState(false);
  const [tempHeight, setTempHeight] = useState("");

  const latest = metrics[0];
  const weightMetrics = metrics.filter((m) => m.weight !== undefined);
  const latestWeight  = weightMetrics[0]?.weight;
  const prevWeight    = weightMetrics[1]?.weight;
  const weightDiff    = latestWeight !== undefined && prevWeight !== undefined ? latestWeight - prevWeight : null;

  // IMC — altura deve estar em cm (> 3), se < 3 provavelmente está em metros
  const heightInMeters = height > 3 ? height / 100 : height; // tolera entrada em metros
  const heightSeemsWrong = height > 0 && height < 3; // provavelmente digitou em metros
  const imc = latestWeight && height > 0
    ? latestWeight / Math.pow(heightInMeters, 2)
    : null;
  const imcClass = imc ? getImcClass(imc) : null;

  // Stats para a aba ativa
  const activeConf   = TAB_CONFIG.find((t) => t.key === activeTab)!;
  const activeSeries = metrics
    .filter((m) => m[activeConf.field] !== undefined)
    .map((m) => m[activeConf.field] as number);
  const activeMin   = activeSeries.length > 0 ? Math.min(...activeSeries) : null;
  const activeMax   = activeSeries.length > 0 ? Math.max(...activeSeries) : null;
  const activeAvg   = activeSeries.length > 0 ? activeSeries.reduce((a, b) => a + b, 0) / activeSeries.length : null;
  const activeDelta = activeSeries.length >= 2 ? activeSeries[0] - activeSeries[activeSeries.length - 1] : null;

  function commitHeight() {
    const h = parseFloat(tempHeight);
    if (!isNaN(h) && h > 0) setHeight(h);
    setEditHeight(false);
  }

  if (!hydrated) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 bg-[#1a1a1a]" />
        <Skeleton className="h-32 bg-[#1a1a1a]" />
        <Skeleton className="h-48 bg-[#1a1a1a]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Métricas Corporais</h1>
          <p className="text-sm text-[#6b7280]">
            {metrics.length} {metrics.length === 1 ? "medição registrada" : "medições registradas"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex-shrink-0"
        >
          <Plus size={14} />
          Adicionar medida
        </button>
      </div>

      {showForm && <AddMetricForm onClose={() => setShowForm(false)} />}

      {/* Aviso de altura em metros */}
      {heightSeemsWrong && (
        <div className="flex items-start gap-2.5 bg-[#f59e0b]/10 border border-[#f59e0b]/25 rounded-xl p-3">
          <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#f59e0b]">
              Altura parece estar em metros ({height} m)
            </p>
            <p className="text-xs text-[#6b7280]">
              O campo espera centímetros. Clique em &quot;Definir altura&quot; abaixo e insira ex: <strong className="text-white">175</strong> (não 1.75).
            </p>
          </div>
        </div>
      )}

      {/* Última medição + IMC */}
      {latest && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={14} className="text-[#6366f1]" />
            <span className="text-sm font-medium text-white">Última medição</span>
            <span className="text-xs text-[#4a4a4a]">
              {format(new Date(latest.date + "T00:00:00"), "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          {/* Peso — destaque */}
          {latest.weight !== undefined && (
            <div className="flex items-end gap-3 mb-3">
              <p className="text-4xl font-bold text-white leading-none">{latest.weight}</p>
              <div className="pb-1">
                <p className="text-sm text-[#6b7280]">kg</p>
                {weightDiff !== null && (
                  <p className="text-xs font-semibold" style={{ color: weightDiff <= 0 ? "#22c55e" : "#ef4444" }}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg vs anterior
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Extras */}
          {(latest.waist !== undefined || latest.bodyFat !== undefined || latest.muscleMass !== undefined) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {latest.waist !== undefined && (
                <span className="text-xs bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#9ca3af]">
                  <span className="font-medium text-white">{latest.waist} cm</span> cintura
                </span>
              )}
              {latest.bodyFat !== undefined && (
                <span className="text-xs bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#9ca3af]">
                  <span className="font-medium text-white">{latest.bodyFat}%</span> gordura
                </span>
              )}
              {latest.muscleMass !== undefined && (
                <span className="text-xs bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-[#9ca3af]">
                  <span className="font-medium text-white">{latest.muscleMass}%</span> músculo
                </span>
              )}
            </div>
          )}

          {/* IMC */}
          <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6b7280]">Altura:</span>
              {editHeight ? (
                <input
                  autoFocus type="number" value={tempHeight}
                  onChange={(e) => setTempHeight(e.target.value)}
                  onBlur={commitHeight}
                  onKeyDown={(e) => { if (e.key === "Enter") commitHeight(); if (e.key === "Escape") setEditHeight(false); }}
                  className="w-16 bg-[#0f0f0f] border border-[#6366f1] rounded px-2 py-0.5 text-xs text-white outline-none"
                  placeholder="cm"
                />
              ) : (
                <button
                  onClick={() => { setTempHeight(height > 0 ? String(height) : ""); setEditHeight(true); }}
                  className="text-xs text-white hover:text-[#a78bfa] transition-colors cursor-pointer underline-offset-2 hover:underline"
                >
                  {height > 0 ? `${height} cm` : "Definir altura"}
                </button>
              )}
            </div>
            {imc && imcClass && !heightSeemsWrong && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6b7280]">IMC:</span>
                <span className="text-xs font-semibold" style={{ color: imcClass.color }}>
                  {imc.toFixed(1)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: `${imcClass.color}20`, color: imcClass.color }}>
                  {imcClass.label}
                </span>
              </div>
            )}
            {!imc && height === 0 && latestWeight && (
              <span className="text-xs text-[#6b7280]">Defina sua altura para calcular o IMC</span>
            )}
          </div>
        </div>
      )}

      {/* Gráfico multi-métrica com tabs */}
      {metrics.length >= 2 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#6366f1]" />
              <span className="text-sm font-medium text-white">Evolução</span>
            </div>
            {activeDelta !== null && (
              <span className="text-xs font-medium" style={{ color: activeDelta <= 0 ? "#22c55e" : "#ef4444" }}>
                {activeDelta > 0 ? "+" : ""}{activeDelta.toFixed(1)} {activeConf.unit} total
              </span>
            )}
          </div>

          <div className="flex gap-1 mb-3 bg-[#111111] rounded-lg p-1">
            {TAB_CONFIG.map((tab) => {
              const hasSeries = metrics.some((m) => m[tab.field] !== undefined);
              if (!hasSeries) return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-colors cursor-pointer font-medium ${
                    activeTab === tab.key
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#6b7280] hover:text-[#9ca3af]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <MetricChart metrics={metrics} field={activeConf.field} color={activeConf.color} unit={activeConf.unit} />

          {activeSeries.length >= 2 && activeMin !== null && activeMax !== null && activeAvg !== null && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#2a2a2a]">
              <StatCard label="Mínimo" value={`${activeMin.toFixed(1)} ${activeConf.unit}`} />
              <StatCard label="Máximo" value={`${activeMax.toFixed(1)} ${activeConf.unit}`} />
              <StatCard label="Média"  value={`${activeAvg.toFixed(1)} ${activeConf.unit}`} />
              <StatCard
                label="Variação"
                value={`${activeDelta !== null && activeDelta > 0 ? "+" : ""}${activeDelta !== null ? activeDelta.toFixed(1) : "-"} ${activeConf.unit}`}
                trend={activeDelta !== null ? (activeDelta > 0 ? "up" : "down") : null}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 sm:p-10 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <Scale size={22} className="text-[#4a4a4a]" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#4a4a4a]">Nenhuma medição registrada</p>
            <p className="text-xs text-[#3a3a3a]">Clique em &quot;Adicionar medida&quot; para começar</p>
          </div>
        </div>
      )}

      {/* Histórico */}
      {metrics.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wide mb-3">
            Histórico completo
          </p>
          <div>
            {metrics.map((metric) => (
              <MetricRow
                key={metric.id}
                metric={metric}
                onRemove={() => removeMetric(metric.id)}
                onEdit={(updates) => editMetric(metric.id, updates)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
