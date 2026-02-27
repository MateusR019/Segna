"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, Check, X, Activity, Scale } from "lucide-react";
import { useCorporalStore } from "@/store/corporalStore";
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
      className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 space-y-4"
    >
      <p className="text-sm font-medium text-white">Nova medição</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="ex: 75.5"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Cintura (cm)
          </label>
          <input
            type="number"
            step="0.1"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="ex: 82"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Gordura Corporal (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="ex: 18.5"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Massa Muscular (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={muscleMass}
            onChange={(e) => setMuscleMass(e.target.value)}
            placeholder="ex: 42"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5 col-span-2">
          <label className="text-[10px] font-medium text-[#4a4a4a] uppercase tracking-wide">
            Nota (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observações"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1f1f1f]">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!hasValue}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={12} />
          Salvar
        </button>
      </div>
    </form>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

function WeightChart({ metrics }: { metrics: BodyMetric[] }) {
  const weightMetrics = [...metrics]
    .filter((m) => m.weight !== undefined)
    .slice(0, 30)
    .reverse(); // oldest first

  if (weightMetrics.length < 2) {
    return (
      <p className="text-xs text-[#4a4a4a] text-center py-3">
        Adicione pelo menos 2 medições de peso para ver o gráfico
      </p>
    );
  }

  const weights = weightMetrics.map((m) => m.weight as number);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 0.5;

  const W = 300;
  const H = 80;
  const pad = 8;
  const iw = W - pad * 2;
  const ih = H - pad * 2;

  const pts = weightMetrics.map((m, i) => {
    const x = pad + (i / (weightMetrics.length - 1)) * iw;
    const y = pad + (1 - ((m.weight as number) - minW) / range) * ih;
    return [x, y] as [number, number];
  });

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "80px" }}
        aria-label="Gráfico de peso"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={pad}
            x2={W - pad}
            y1={pad + (1 - r) * ih}
            y2={pad + (1 - r) * ih}
            stroke="#1f1f1f"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        <polyline
          points={`${pad},${H - pad} ${polyline} ${W - pad},${H - pad}`}
          fill="#6366f1"
          fillOpacity="0.07"
          stroke="none"
        />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last dot */}
        <circle cx={lx} cy={ly} r="3" fill="#6366f1" />
      </svg>

      <div className="flex items-center justify-between text-[10px] text-[#4a4a4a]">
        <span>
          {format(new Date(weightMetrics[0].date + "T00:00:00"), "d MMM", {
            locale: ptBR,
          })}
        </span>
        <span className="text-white text-xs font-medium">
          {weightMetrics[weightMetrics.length - 1].weight} kg
        </span>
        <span>
          {format(
            new Date(
              weightMetrics[weightMetrics.length - 1].date + "T00:00:00"
            ),
            "d MMM",
            { locale: ptBR }
          )}
        </span>
      </div>
    </div>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────

function MetricRow({
  metric,
  onRemove,
}: {
  metric: BodyMetric;
  onRemove: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const chips = [
    metric.weight !== undefined && `${metric.weight} kg`,
    metric.waist !== undefined && `${metric.waist} cm cintura`,
    metric.bodyFat !== undefined && `${metric.bodyFat}% gordura`,
    metric.muscleMass !== undefined && `${metric.muscleMass}% músculo`,
  ].filter(Boolean) as string[];

  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-[#1f1f1f] last:border-0">
      {/* Date */}
      <div className="flex-shrink-0 w-14">
        <p className="text-xs font-medium text-white">
          {format(new Date(metric.date + "T00:00:00"), "d MMM", {
            locale: ptBR,
          })}
        </p>
        <p className="text-[10px] text-[#4a4a4a]">
          {format(new Date(metric.date + "T00:00:00"), "yyyy")}
        </p>
      </div>

      {/* Chips */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="text-xs bg-[#141414] border border-[#2a2a2a] rounded px-2 py-0.5 text-[#9ca3af]"
            >
              {chip}
            </span>
          ))}
        </div>
        {metric.note && (
          <p className="text-[11px] text-[#4a4a4a]">{metric.note}</p>
        )}
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRemove}
              className="text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer"
              aria-label="Confirmar exclusão"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
              aria-label="Cancelar"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-[#3a3a3a] hover:text-[#ef4444] transition-colors cursor-pointer"
            aria-label="Remover medição"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CorporalPage() {
  const hydrated = useHydrated();
  const metrics = useCorporalStore((s) => s.metrics);
  const removeMetric = useCorporalStore((s) => s.removeMetric);
  const [showForm, setShowForm] = useState(false);

  const latest = metrics[0]; // sorted desc by date
  const weightMetrics = metrics.filter((m) => m.weight !== undefined);
  const latestWeight = weightMetrics[0]?.weight;
  const prevWeight = weightMetrics[1]?.weight;
  const weightDiff =
    latestWeight !== undefined && prevWeight !== undefined
      ? latestWeight - prevWeight
      : null;

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
          <h1 className="text-xl font-semibold text-white">
            Métricas Corporais
          </h1>
          <p className="text-sm text-[#6b7280]">
            {metrics.length}{" "}
            {metrics.length === 1 ? "medição registrada" : "medições registradas"}
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

      {/* Inline add form */}
      {showForm && <AddMetricForm onClose={() => setShowForm(false)} />}

      {/* Latest metrics */}
      {latest && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={14} className="text-[#6366f1]" />
            <span className="text-sm font-medium text-white">
              Última medição
            </span>
            <span className="text-xs text-[#4a4a4a]">
              {format(new Date(latest.date + "T00:00:00"), "d 'de' MMMM", {
                locale: ptBR,
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {latest.weight !== undefined && (
              <div className="bg-[#141414] rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">
                  {latest.weight}
                </p>
                <p className="text-[10px] text-[#4a4a4a] mt-0.5">kg peso</p>
                {weightDiff !== null && (
                  <p
                    className="text-[10px] font-semibold mt-1.5"
                    style={{ color: weightDiff <= 0 ? "#22c55e" : "#ef4444" }}
                  >
                    {weightDiff > 0 ? "+" : ""}
                    {weightDiff.toFixed(1)} kg
                  </p>
                )}
              </div>
            )}
            {latest.waist !== undefined && (
              <div className="bg-[#141414] rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">
                  {latest.waist}
                </p>
                <p className="text-[10px] text-[#4a4a4a] mt-0.5">cm cintura</p>
              </div>
            )}
            {latest.bodyFat !== undefined && (
              <div className="bg-[#141414] rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">
                  {latest.bodyFat}%
                </p>
                <p className="text-[10px] text-[#4a4a4a] mt-0.5">
                  gordura corporal
                </p>
              </div>
            )}
            {latest.muscleMass !== undefined && (
              <div className="bg-[#141414] rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">
                  {latest.muscleMass}%
                </p>
                <p className="text-[10px] text-[#4a4a4a] mt-0.5">
                  massa muscular
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weight chart */}
      {weightMetrics.length >= 2 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[#6366f1]" />
              <span className="text-sm font-medium text-white">
                Evolução do peso
              </span>
            </div>
            {weightDiff !== null && (
              <span
                className="text-xs font-medium"
                style={{ color: weightDiff <= 0 ? "#22c55e" : "#ef4444" }}
              >
                {weightDiff > 0 ? "+" : ""}
                {weightDiff.toFixed(1)} kg vs anterior
              </span>
            )}
          </div>
          <WeightChart metrics={metrics} />
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-10 text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <Scale size={22} className="text-[#4a4a4a]" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-[#4a4a4a]">
              Nenhuma medição registrada
            </p>
            <p className="text-xs text-[#3a3a3a]">
              Clique em &quot;Adicionar medida&quot; para começar
            </p>
          </div>
        </div>
      )}

      {/* History */}
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
