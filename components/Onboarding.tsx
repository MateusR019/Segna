"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHabitosStore } from "@/store/habitosStore";
import { useFinancasStore } from "@/store/financasStore";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import {
  CheckSquare, TrendingUp, StickyNote, Coins,
  ArrowRight, Sparkles, Wallet, Target,
  CheckCircle2, ChevronRight,
} from "lucide-react";

// ─── Dados estáticos ───────────────────────────────────────────────────────

const SUGGESTED_HABITS = [
  { name: "Treino",      color: "#22c55e", icon: "💪", weekDays: [1,2,3,4,5] as number[] },
  { name: "Leitura",     color: "#6366f1", icon: "📚", weekDays: [] },
  { name: "Meditação",   color: "#06b6d4", icon: "🧘", weekDays: [] },
  { name: "Água 2L",     color: "#3b82f6", icon: "💧", weekDays: [] },
  { name: "Sem açúcar",  color: "#f59e0b", icon: "🚫", weekDays: [] },
  { name: "Dormir cedo", color: "#8b5cf6", icon: "🌙", weekDays: [] },
];

const FEATURES = [
  {
    icon: <TrendingUp size={16} className="text-[#22c55e]" />,
    color: "#22c55e",
    title: "Finanças",
    desc: "Receitas, despesas e orçamento mensal.",
  },
  {
    icon: <CheckSquare size={16} className="text-[#a78bfa]" />,
    color: "#a78bfa",
    title: "Hábitos",
    desc: "Streaks diários e progresso semanal.",
  },
  {
    icon: <Coins size={16} className="text-[#f59e0b]" />,
    color: "#f59e0b",
    title: "Cripto / DeFi",
    desc: "Portfolio em USD e pools de liquidez.",
  },
  {
    icon: <StickyNote size={16} className="text-[#06b6d4]" />,
    color: "#06b6d4",
    title: "Notas",
    desc: "Markdown, checklists e tags coloridas.",
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function Onboarding() {
  const addHabit  = useHabitosStore((s) => s.addHabit);
  const setBudget = useFinancasStore((s) => s.setBudget);

  const [done, setDone]         = useState(true); // true = não mostra (evita flash SSR)
  const [step, setStep]         = useState(0);
  const [name, setName]         = useState("");
  const [budgetVal, setBudgetVal] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [finishing, setFinishing] = useState(false);

  // Verifica no Supabase se onboarding já foi feito
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && !user.user_metadata?.onboarding_done) {
        setDone(false);
      }
    });
  }, []);

  async function finish() {
    setFinishing(true);

    // 1. Adiciona hábitos escolhidos
    selected.forEach((i) => {
      const h = SUGGESTED_HABITS[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addHabit({ name: h.name, color: h.color, icon: h.icon, weekDays: h.weekDays.length > 0 ? h.weekDays as any : undefined });
    });

    // 2. Define orçamento se informado
    const num = parseFloat(budgetVal.replace(",", "."));
    if (!isNaN(num) && num > 0) {
      setBudget(num);
    }

    // 3. Marca onboarding como feito no Supabase (persiste por conta, não por dispositivo)
    await supabase.auth.updateUser({ data: { onboarding_done: true } });

    setFinishing(false);
    setStep(4); // tela de conclusão
  }

  if (done) return null;

  // Barra de progresso (steps 1–3)
  const progress = step === 0 || step === 4 ? 0 : (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Barra de progresso */}
        {step > 0 && step < 4 && (
          <div className="h-0.5 bg-[#1f1f1f]">
            <div
              className="h-full bg-[#6366f1] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Step 0: Boas-vindas ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <Image
                src="/icon-192.png"
                alt="Segna"
                width={64}
                height={64}
                className="rounded-2xl logo-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Bem-vindo ao Segna</h1>
              <p className="text-sm text-[#6b7280] mt-1">
                Seu OS pessoal. Finanças, hábitos, notas e cripto — tudo em um lugar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-2"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: f.color + "18" }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{f.title}</p>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setStep(1)}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium cursor-pointer"
            >
              Começar configuração <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* ── Step 1: Nome ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-[#6366f1]" />
                <span className="text-[11px] text-[#4a4a4a] font-medium">Passo 1 de 3</span>
              </div>
              <h2 className="text-base font-semibold text-white">Como quer ser chamado?</h2>
              <p className="text-xs text-[#6b7280]">Usado para personalizar a experiência.</p>
            </div>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome ou apelido"
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white placeholder:text-[#3a3a3a]"
              onKeyDown={(e) => e.key === "Enter" && setStep(2)}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                className="flex-1 text-[#6b7280] cursor-pointer"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer"
              >
                Continuar <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Orçamento ───────────────────────────────────────────── */}
        {step === 2 && (
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={15} className="text-[#22c55e]" />
                <span className="text-[11px] text-[#4a4a4a] font-medium">Passo 2 de 3</span>
              </div>
              <h2 className="text-base font-semibold text-white">Qual seu orçamento mensal?</h2>
              <p className="text-xs text-[#6b7280]">
                Limite de gastos por mês. Você será alertado ao se aproximar.
              </p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280] pointer-events-none">
                R$
              </span>
              <Input
                autoFocus
                type="number"
                min={0}
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                placeholder="5.000"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white pl-9 placeholder:text-[#3a3a3a]"
                onKeyDown={(e) => e.key === "Enter" && setStep(3)}
              />
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target size={12} className="text-[#a78bfa]" />
                <p className="text-xs font-medium text-white">Para que serve?</p>
              </div>
              <p className="text-[11px] text-[#6b7280] leading-relaxed">
                O Segna monitora seus gastos e exibe um alerta visual quando você estiver
                perto do limite mensal. Pode pular e configurar depois.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1 text-[#6b7280] cursor-pointer"
              >
                Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer"
              >
                Continuar <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Hábitos ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="p-8 space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare size={15} className="text-[#a78bfa]" />
                <span className="text-[11px] text-[#4a4a4a] font-medium">Passo 3 de 3</span>
              </div>
              <h2 className="text-base font-semibold text-white">
                {name ? `Oi, ${name}! ` : ""}Quais hábitos quer rastrear?
              </h2>
              <p className="text-xs text-[#6b7280]">Selecione os que fazem sentido para você.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_HABITS.map((h, i) => {
                const active = selected.includes(i);
                return (
                  <button
                    key={h.name}
                    type="button"
                    onClick={() =>
                      setSelected((s) =>
                        s.includes(i) ? s.filter((x) => x !== i) : [...s, i]
                      )
                    }
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left ${
                      active
                        ? "border-transparent text-white"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#9ca3af] hover:border-[#3a3a3a]"
                    }`}
                    style={
                      active
                        ? { background: h.color + "25", borderColor: h.color + "60", color: h.color }
                        : {}
                    }
                  >
                    <span className="text-base leading-none">{h.icon}</span>
                    <span>{h.name}</span>
                    {h.weekDays.length > 0 && (
                      <span className="text-[10px] opacity-60 ml-auto">Seg–Sex</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="flex-1 text-[#6b7280] cursor-pointer"
              >
                Voltar
              </Button>
              <Button
                onClick={finish}
                disabled={finishing}
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold cursor-pointer disabled:opacity-50"
              >
                {finishing
                  ? "Salvando..."
                  : selected.length > 0
                  ? `Adicionar ${selected.length} e começar →`
                  : "Pular e começar →"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Tudo certo! ─────────────────────────────────────────── */}
        {step === 4 && (
          <div className="p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/20 flex items-center justify-center">
                <CheckCircle2 size={34} className="text-[#22c55e]" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {name ? `Tudo certo, ${name}!` : "Tudo configurado!"}
              </h1>
              <p className="text-sm text-[#6b7280] mt-1">
                Seu dashboard está pronto. Bora começar.
              </p>
            </div>
            {/* Resumo do que foi configurado */}
            <div className="space-y-2 text-left">
              {selected.length > 0 && (
                <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={13} className="text-[#22c55e] flex-shrink-0" />
                  <p className="text-xs text-[#d1d5db]">
                    {selected.length} hábito{selected.length > 1 ? "s" : ""} adicionado{selected.length > 1 ? "s" : ""}
                  </p>
                </div>
              )}
              {(() => {
                const num = parseFloat(budgetVal.replace(",", "."));
                return !isNaN(num) && num > 0 ? (
                  <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5">
                    <CheckCircle2 size={13} className="text-[#22c55e] flex-shrink-0" />
                    <p className="text-xs text-[#d1d5db]">
                      Orçamento mensal de R${" "}
                      {num.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} configurado
                    </p>
                  </div>
                ) : null;
              })()}
              <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5">
                <CheckCircle2 size={13} className="text-[#22c55e] flex-shrink-0" />
                <p className="text-xs text-[#d1d5db]">Dados sincronizados com a nuvem ☁️</p>
              </div>
            </div>
            <Button
              onClick={() => setDone(true)}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium cursor-pointer"
            >
              Ir para o Dashboard <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
