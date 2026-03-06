"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loadAllStores } from "@/components/AuthProvider";
import Image from "next/image";
import {
  Eye, EyeOff, LogIn, UserPlus, ArrowRight,
  DollarSign, TrendingUp, CheckSquare, FileText, Activity, Smile,
  Shield, Zap, Lock, Github, ExternalLink, Server, Cloud,
  ChevronRight, Heart, Copy, Check, Star, Mail,
  ArrowDownLeft, ArrowUpRight, Flame,
} from "lucide-react";

/* ─── Configs ──────────────────────────────────────────────────────────────── */
const PIX_KEY     = "mateusrogerio777@gmail.com";
const GITHUB_URL  = "https://github.com/MateusR019/Segna";

/* ─── Dados ──────────────────────────────────────────────────────────────────── */
const features = [
  { icon: DollarSign, label: "Finanças",         desc: "Gastos, investimentos e orçamento mensal",   color: "#22c55e", bg: "rgba(34,197,94,0.12)"    },
  { icon: TrendingUp, label: "DeFi & Crypto",    desc: "Portfólio e tokens Web3 em BRL",             color: "#6366f1", bg: "rgba(99,102,241,0.12)"   },
  { icon: CheckSquare,label: "Tarefas & Hábitos",desc: "Rotinas diárias com streaks e progresso",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)"   },
  { icon: FileText,   label: "Notas",            desc: "Ideias, checklists e markdown nativo",       color: "#a78bfa", bg: "rgba(167,139,250,0.12)"  },
  { icon: Activity,   label: "Saúde Corporal",   desc: "Peso, IMC e histórico de métricas",          color: "#ec4899", bg: "rgba(236,72,153,0.12)"   },
  { icon: Smile,      label: "Humor & Revisão",  desc: "Reflita sobre a semana e evolua sempre",     color: "#14b8a6", bg: "rgba(20,184,166,0.12)"   },
];

const steps = [
  { n: "01", title: "Crie sua conta",       desc: "Cadastro gratuito em segundos. Sem cartão de crédito."       },
  { n: "02", title: "Configure os módulos", desc: "Adicione finanças, hábitos e metas no seu ritmo."            },
  { n: "03", title: "Acompanhe tudo",       desc: "Dashboard unificado para ver sua vida em números, todo dia." },
];

/* ─── Mockup do produto ───────────────────────────────────────────────────── */
function ProductMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none pointer-events-none">
      {/* Glow atrás */}
      <div className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />

      {/* Janela do app */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Topbar simulada */}
        <div className="flex items-center gap-1.5 px-4 py-3"
          style={{ background: "#111111", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
          <div className="flex-1 mx-3 h-5 rounded-md flex items-center px-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-[10px] text-[#4a4a4a]">segna.space/dashboard</span>
          </div>
        </div>

        {/* App content */}
        <div className="flex">
          {/* Sidebar mini */}
          <div className="w-10 flex flex-col items-center gap-3 py-4"
            style={{ background: "#0a0a0a", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { color: "#a78bfa", active: true },
              { color: "#6b7280" },
              { color: "#6b7280" },
              { color: "#6b7280" },
              { color: "#6b7280" },
            ].map((item, i) => (
              <div key={i} className="w-5 h-5 rounded-md"
                style={{ background: item.active ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)" }}>
                <div className="w-full h-full rounded-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
            {/* Saudação */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-white">Dashboard</p>
                <p className="text-[9px] text-[#4a4a4a]">sexta, 6 de março</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-[#6366f1]/20 flex items-center justify-center">
                <span className="text-[8px] text-[#a78bfa] font-bold">M</span>
              </div>
            </div>

            {/* Cards de saldo */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Receitas",  value: "R$ 6.000", color: "#22c55e" },
                { label: "Despesas",  value: "R$ 2.891", color: "#ef4444" },
                { label: "Saldo",     value: "R$ 3.109", color: "#a78bfa" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg p-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-[8px] text-[#6b7280] mb-1">{label}</p>
                  <p className="text-[10px] font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Hábitos */}
            <div className="rounded-lg p-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-medium text-[#9ca3af]">Hábitos hoje</p>
                <span className="text-[9px] text-[#22c55e] font-bold">4/6</span>
              </div>
              <div className="flex gap-1.5">
                {["💧","🏋️","📚","🧘","💡","💰"].map((emoji, i) => (
                  <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px]"
                    style={{
                      background: i < 4 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${i < 4 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.06)"}`,
                    }}>
                    {emoji}
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div className="h-full rounded-full bg-[#22c55e]" style={{ width: "67%" }} />
              </div>
            </div>

            {/* Transações recentes */}
            <div className="rounded-lg p-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[9px] font-medium text-[#9ca3af] mb-2">Transações recentes</p>
              <div className="space-y-1.5">
                {[
                  { label: "Salário",      cat: "Receita",    value: "+R$ 5.200", color: "#22c55e", income: true  },
                  { label: "Aluguel",      cat: "Moradia",    value: "−R$ 1.500", color: "#ef4444", income: false },
                  { label: "iFood",        cat: "Delivery",   value: "−R$ 85,00", color: "#ef4444", income: false },
                ].map(({ label, cat, value, color, income }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: income ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)" }}>
                      {income
                        ? <ArrowDownLeft size={8} className="text-[#22c55e]" />
                        : <ArrowUpRight  size={8} className="text-[#ef4444]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white truncate">{label}</p>
                      <p className="text-[8px] text-[#4a4a4a]">{cat}</p>
                    </div>
                    <p className="text-[9px] font-semibold flex-shrink-0" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <Flame size={11} className="text-[#f59e0b]" />
              <p className="text-[9px] text-[#d97706]"><span className="font-bold">14 dias</span> em sequência — continue assim!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge flutuante */}
      <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium shadow-lg"
        style={{ background: "#1a1a1a", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
        Sync em tempo real
      </div>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  // Auth state
  const [tab, setTab]         = useState<"signup" | "login">("signup");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState<{ text: string; ok: boolean } | null>(null);

  // Password reset state
  const [forgotMode, setForgotMode]         = useState(false);
  const [forgotEmail, setForgotEmail]       = useState("");
  const [forgotLoading, setForgotLoading]   = useState(false);
  const [forgotMsg, setForgotMsg]           = useState<{ text: string; ok: boolean } | null>(null);

  // PIX
  const [pixCopied, setPixCopied] = useState(false);
  function copyPix() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadAllStores();
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await loadAllStores();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Erro ao autenticar";
      if (m.includes("Invalid login credentials")) setMsg({ text: "E-mail ou senha incorretos.", ok: false });
      else if (m.includes("User already registered"))  setMsg({ text: "E-mail já cadastrado. Faça login.", ok: false });
      else if (m.includes("Password should be at least")) setMsg({ text: "A senha deve ter pelo menos 6 caracteres.", ok: false });
      else setMsg({ text: m, ok: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotMsg({ text: "Link enviado! Verifique seu e-mail.", ok: true });
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Erro ao enviar link";
      setForgotMsg({ text: m, ok: false });
    } finally {
      setForgotLoading(false);
    }
  }

  function scrollToAuth(t: "signup" | "login") {
    setTab(t);
    setForgotMode(false);
    document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white overflow-x-hidden">

      {/* ══════ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-16"
        style={{ background: "rgba(7,7,16,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <Image src="/icon-192.png" alt="Segna" width={28} height={28} className="rounded-lg" />
          <span className="font-semibold text-sm tracking-tight">Segna</span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ml-1"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.25)" }}>
            Personal OS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href={GITHUB_URL} target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white transition-colors">
            <Github size={14} />
            Open Source
          </a>
          <button onClick={() => scrollToAuth("login")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}>
            Entrar
          </button>
        </div>
      </nav>

      {/* ══════ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 px-6 sm:px-10 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
        <div className="absolute top-20 left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)" }} />
        <div className="absolute top-10 right-[5%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a78bfa" }}>
                <Zap size={11} />
                Gratuito · Open Source · Offline-first
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                Seu sistema<br />operacional{" "}
                <span style={{ background: "linear-gradient(90deg, #a78bfa 0%, #6366f1 50%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  pessoal
                </span>
              </h1>

              <p className="text-lg text-[#9ca3af] leading-relaxed max-w-lg">
                Segna centraliza finanças, hábitos, saúde, notas e crypto em um único dashboard —
                sincronizado na nuvem e disponível offline.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <button onClick={() => scrollToAuth("signup")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #5855e0)" }}>
                  Começar grátis
                  <ArrowRight size={15} />
                </button>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Github size={15} />
                  Ver no GitHub
                </a>
              </div>

              <p className="text-xs text-[#4a4a4a]">
                Sem cartão · Funciona offline · Dados 100% seus
              </p>

              {/* Social proof simples */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                  <Shield size={12} className="text-[#22c55e]" />
                  Open source no GitHub
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                  <Zap size={12} className="text-[#6366f1]" />
                  Feito no Brasil 🇧🇷
                </div>
              </div>
            </div>

            {/* Mockup do produto */}
            <div className="hidden lg:block">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Tudo que você precisa, em um lugar</h2>
            <p className="text-[#6b7280] text-sm">6 módulos integrados que se conversam entre si</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className="group rounded-2xl p-5 transition-all duration-200 cursor-default"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${color}40`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl p-2.5" style={{ background: bg }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COMO FUNCIONA ═══════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Como funciona</h2>
            <p className="text-[#6b7280] text-sm">Três passos para começar a organizar sua vida</p>
          </div>
          <div className="space-y-5">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-5 p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-3xl font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {n}
                </span>
                <div>
                  <p className="font-semibold mb-1">{title}</p>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PLANOS ══════════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Simples e transparente</h2>
            <p className="text-[#6b7280] text-sm">O Segna é gratuito. Se ele te ajuda, considere apoiar o desenvolvimento.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Grátis */}
            <div className="rounded-2xl p-6 space-y-5 flex flex-col"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wider mb-1">Grátis</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">R$ 0</span>
                  <span className="text-[#6b7280] text-sm mb-0.5">/sempre</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1">
                {["Todos os 6 módulos", "Sync na nuvem", "Offline-first (PWA)", "Sem limite de dados", "Atualizações incluídas"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Check size={13} className="text-[#22c55e] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollToAuth("signup")}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                Começar grátis
              </button>
            </div>

            {/* Apoiador */}
            <div className="rounded-2xl p-6 space-y-5 flex flex-col relative"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(167,139,250,0.06) 100%)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)", color: "#fff" }}>
                ✨ Recomendado
              </div>
              <div>
                <p className="text-xs text-[#a78bfa] font-medium uppercase tracking-wider mb-1">Apoiador</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">Qualquer</span>
                </div>
                <p className="text-[#6b7280] text-xs mt-0.5">valor via PIX — uma vez ou recorrente</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {["Tudo do plano grátis", "Apoia o desenvolvimento ativo", "Sem mensalidade obrigatória", "Uma vez ou recorrente", "Com muito ☕ e gratidão"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <Heart size={13} className="text-[#a78bfa] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <div className="w-full px-3 py-2.5 rounded-xl text-xs text-center font-mono text-[#9ca3af] select-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {PIX_KEY}
                </div>
                <button onClick={copyPix}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #5855e0)", color: "#fff" }}>
                  {pixCopied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar chave PIX</>}
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 space-y-5 flex flex-col relative"
              style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                🚀 Em breve
              </div>
              <div>
                <p className="text-xs text-[#f59e0b] font-medium uppercase tracking-wider mb-1">Pro</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">R$ 99,99</span>
                </div>
                <p className="text-[#6b7280] text-xs mt-0.5">/ano · equivale a R$ 8,33/mês</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {["Tudo do plano grátis", "Import de extrato bancário (CSV)", "Relatórios em PDF mensais", "Insights com IA", "Suporte prioritário"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <Star size={13} className="text-[#f59e0b] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button disabled
                className="w-full py-2.5 rounded-xl text-sm font-medium text-[#6b7280] cursor-not-allowed"
                style={{ border: "1px solid rgba(245,158,11,0.15)" }}>
                Notifique-me quando lançar
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════ OPEN SOURCE ═════════════════════════════════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-10 grid sm:grid-cols-2 gap-8 items-center relative"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a78bfa" }}>
                <Cloud size={11} />
                SaaS Cloud
              </div>
              <h3 className="text-xl font-bold">Use agora, sem configuração</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Crie sua conta e comece em segundos. Dados sincronizados na nuvem,
                disponíveis em qualquer dispositivo. Gratuito para sempre.
              </p>
              <ul className="space-y-2">
                {["Sync automático entre dispositivos", "Backup na nuvem incluído", "Atualizações automáticas", "Suporte a PWA / mobile"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <ChevronRight size={13} className="text-[#6366f1] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => scrollToAuth("signup")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #5855e0)" }}>
                Criar conta grátis
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                <Server size={11} />
                Self-hosted · Open Source
              </div>
              <h3 className="text-xl font-bold">Prefere rodar localmente?</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                O Segna é open source. Fork o repositório, configure seu próprio Supabase
                e rode onde quiser — VPS, Vercel, Raspberry Pi.
              </p>
              <ul className="space-y-2">
                {["Código 100% aberto no GitHub", "Dados ficam no seu servidor", "Personalize à vontade", "Next.js + Supabase + Zustand"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#9ca3af]">
                    <ChevronRight size={13} className="text-[#22c55e] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:bg-[#2a2a2a]"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                <Github size={14} />
                Ver repositório
                <ExternalLink size={12} className="text-[#4a4a4a]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ AUTH FORM ═══════════════════════════════════════════════════════ */}
      <section id="auth-form" className="px-6 sm:px-10 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {forgotMode ? "Recuperar senha" : tab === "signup" ? "Criar conta grátis" : "Bem-vindo de volta"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {forgotMode
                ? "Enviaremos um link para redefinir sua senha"
                : tab === "signup"
                ? "Comece a organizar sua vida hoje"
                : "Entre para acessar seu painel pessoal"}
            </p>
          </div>

          {!forgotMode && (
            <div className="flex rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {(["signup", "login"] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setMsg(null); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={tab === t ? { background: "#6366f1", color: "#fff" } : { color: "#6b7280" }}>
                  {t === "signup" ? "Criar conta" : "Entrar"}
                </button>
              ))}
            </div>
          )}

          {/* Formulário de login/cadastro */}
          {!forgotMode ? (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-[#6b7280] font-medium">E-mail</label>
                <input type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#6b7280] font-medium">Senha</label>
                  {tab === "login" && (
                    <button type="button" onClick={() => { setForgotMode(true); setForgotEmail(email); }}
                      className="text-[11px] text-[#6366f1] hover:text-[#a78bfa] transition-colors cursor-pointer">
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {tab === "signup" && <p className="text-[10px] text-[#4a4a4a]">Mínimo de 6 caracteres</p>}
              </div>

              {msg && (
                <div className={`flex items-start gap-2 text-xs px-4 py-3 rounded-xl ${
                  msg.ok
                    ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                    : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                }`}>
                  <span className="mt-0.5 flex-shrink-0">{msg.ok ? "✓" : "⚠"}</span>
                  <span>{msg.text}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #5855e0 100%)" }}>
                {loading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-transparent" />
                  : tab === "login"
                    ? <><LogIn size={14} /> Entrar na conta <ArrowRight size={14} className="ml-auto" /></>
                    : <><UserPlus size={14} /> Criar conta grátis <ArrowRight size={14} className="ml-auto" /></>
                }
              </button>
            </form>
          ) : (
            /* Formulário de recuperação de senha */
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-[#6b7280] font-medium">E-mail da conta</label>
                <input type="email" required autoComplete="email"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")} />
              </div>

              {forgotMsg && (
                <div className={`flex items-start gap-2 text-xs px-4 py-3 rounded-xl ${
                  forgotMsg.ok
                    ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                    : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                }`}>
                  <span className="mt-0.5 flex-shrink-0">{forgotMsg.ok ? "✓" : "⚠"}</span>
                  <span>{forgotMsg.text}</span>
                </div>
              )}

              <button type="submit" disabled={forgotLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1 0%, #5855e0 100%)" }}>
                {forgotLoading
                  ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-transparent" />
                  : <><Mail size={14} /> Enviar link de recuperação</>
                }
              </button>

              <button type="button" onClick={() => { setForgotMode(false); setForgotMsg(null); }}
                className="w-full text-center text-xs text-[#6b7280] hover:text-white transition-colors py-2 cursor-pointer">
                ← Voltar para o login
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══════ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="px-6 sm:px-10 py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Image src="/icon-192.png" alt="Segna" width={22} height={22} className="rounded-md opacity-60" />
            <span className="text-xs text-[#4a4a4a]">© 2026 Segna · Personal OS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-[#4a4a4a] text-xs">
              <Shield size={10} className="text-[#22c55e]" />
              Grátis para sempre
            </div>
            <div className="flex items-center gap-1.5 text-[#4a4a4a] text-xs">
              <Lock size={10} className="text-[#6366f1]" />
              Dados privados
            </div>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[#4a4a4a] hover:text-[#9ca3af] text-xs transition-colors">
              <Github size={10} />
              Open Source
            </a>
            <a href="/privacidade"
              className="text-[#4a4a4a] hover:text-[#9ca3af] text-xs transition-colors">
              Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
