"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHabitosStore } from "@/store/habitosStore";
import { CheckSquare, TrendingUp, StickyNote, Coins, ArrowRight, Sparkles } from "lucide-react";

const SUGGESTED_HABITS = [
  { name: "Treino", color: "#22c55e", weekDays: [1,2,3,4,5] },
  { name: "Leitura", color: "#6366f1", weekDays: [] },
  { name: "Meditação", color: "#06b6d4", weekDays: [] },
  { name: "Água 2L", color: "#3b82f6", weekDays: [] },
  { name: "Sem açúcar", color: "#f59e0b", weekDays: [] },
  { name: "Dormir cedo", color: "#8b5cf6", weekDays: [] },
];

const FEATURES = [
  { icon: <TrendingUp size={20} className="text-[#22c55e]" />, title: "Finanças", desc: "Registre receitas e despesas, defina orçamento mensal." },
  { icon: <CheckSquare size={20} className="text-[#a78bfa]" />, title: "Hábitos", desc: "Rastreie hábitos diários, veja streaks e progresso." },
  { icon: <Coins size={20} className="text-[#f59e0b]" />, title: "DeFi / Crypto", desc: "Acompanhe seu portfolio em BRL e USD." },
  { icon: <StickyNote size={20} className="text-[#06b6d4]" />, title: "Notas", desc: "Anote ideias com markdown, checklists e tags." },
];

const STORAGE_KEY = "segna-onboarding-done";

export function Onboarding() {
  const addHabit = useHabitosStore((s) => s.addHabit);
  const [done, setDone] = useState(true); // começa true pra não piscar no SSR
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const isDone = localStorage.getItem(STORAGE_KEY);
    if (!isDone) setDone(false);
  }, []);

  function finish() {
    // Adiciona hábitos selecionados
    selected.forEach((i) => {
      const h = SUGGESTED_HABITS[i];
      addHabit({
        name: h.name,
        color: h.color,
        icon: "check",
        weekDays: h.weekDays.length > 0 ? h.weekDays as any : undefined,
      });
    });
    localStorage.setItem(STORAGE_KEY, "1");
    setDone(true);
  }

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Step 0 — Boas-vindas */}
        {step === 0 && (
          <div className="p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#6366f1] flex items-center justify-center logo-pulse">
                <span className="text-white text-2xl font-bold">S</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">Bem-vindo ao Segna</h1>
              <p className="text-sm text-[#6b7280]">Seu dashboard pessoal para finanças, hábitos, notas e cripto.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 space-y-1.5">
                  {f.icon}
                  <p className="text-xs font-medium text-white">{f.title}</p>
                  <p className="text-[11px] text-[#6b7280] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep(1)} className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium cursor-pointer">
              Começar <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step 1 — Nome */}
        {step === 1 && (
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#6366f1]" />
              <h2 className="text-base font-semibold text-white">Como posso te chamar?</h2>
            </div>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="bg-[#0f0f0f] border-[#2a2a2a] text-white"
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(0)} className="flex-1 text-[#6b7280] cursor-pointer">Voltar</Button>
              <Button onClick={() => setStep(2)} disabled={!name.trim()} className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white cursor-pointer">
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Hábitos sugeridos */}
        {step === 2 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white">
                {name ? `Oi, ${name}! ` : ""}Quais hábitos quer rastrear?
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">Pode adicionar mais depois — ou pular agora.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTED_HABITS.map((h, i) => {
                const active = selected.includes(i);
                return (
                  <button
                    key={h.name}
                    type="button"
                    onClick={() => setSelected((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i])}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer text-left ${
                      active ? "border-transparent text-white" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#9ca3af] hover:border-[#3a3a3a]"
                    }`}
                    style={active ? { background: h.color + "25", borderColor: h.color + "60", color: h.color } : {}}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color }} />
                    {h.name}
                    {h.weekDays.length > 0 && (
                      <span className="text-[10px] opacity-60 ml-auto">Seg–Sex</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 text-[#6b7280] cursor-pointer">Voltar</Button>
              <Button onClick={finish} className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-medium cursor-pointer">
                {selected.length > 0 ? `Adicionar ${selected.length} hábito${selected.length > 1 ? "s" : ""} →` : "Pular →"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
