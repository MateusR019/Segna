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
  ChevronRight, Heart, Copy, Check, Star,
} from "lucide-react";

/* ─── Configuração de monetização ──────────────────────────────────────────── */
// Atualize sua chave PIX aqui:
const PIX_KEY = "mateusrogerio777@gmail.com";

/* ─── Dados ──────────────────────────────────────────────────────────────────── */
const features = [
  { icon: DollarSign, label: "Finanças",        desc: "Gastos, metas e orçamento mensal",     color: "#22c55e", bg: "rgba(34,197,94,0.12)"    },
  { icon: TrendingUp, label: "DeFi & Crypto",   desc: "Portfólio e tokens Web3",              color: "#6366f1", bg: "rgba(99,102,241,0.12)"   },
  { icon: CheckSquare,label: "Tarefas & Hábitos",desc:"Rotinas que realmente funcionam",      color: "#f59e0b", bg: "rgba(245,158,11,0.12)"   },
  { icon: FileText,   label: "Notas",           desc: "Ideias, checklists e anotações",       color: "#a78bfa", bg: "rgba(167,139,250,0.12)"  },
  { icon: Activity,   label: "Saúde Corporal",  desc: "Peso, IMC e composição corporal",      color: "#ec4899", bg: "rgba(236,72,153,0.12)"   },
  { icon: Smile,      label: "Humor & Revisão", desc: "Reflita e evolua toda semana",         color: "#14b8a6", bg: "rgba(20,184,166,0.12)"   },
];

const steps = [
  { n: "01", title: "Crie sua conta",      desc: "Cadastro gratuito em segundos. Sem cartão de crédito." },
  { n: "02", title: "Configure seu perfil",desc: "Adicione suas finanças, hábitos e metas iniciais."     },
  { n: "03", title: "Acompanhe tudo",      desc: "Dashboard unificado para ver sua vida em números."      },
];

/* ─── Componente ─────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab]           = useState<"signup" | "login">("signup");
  const [pixCopied, setPixCopied] = useState(false);

  function copyPix() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2500);
    });
  }
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState<{ text: string; ok: boolean } | null>(null);

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
        // Auto-confirm ativo — entra direto após cadastro
        await loadAllStores();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Erro ao autenticar";
      if (m.includes("Invalid login credentials")) setMsg({ text: "E-mail ou senha incorretos.", ok: false });
      else if (m.includes("User already registered")) setMsg({ text: "E-mail já cadastrado. Faça login.", ok: false });
      else if (m.includes("Password should be at least")) setMsg({ text: "A senha deve ter pelo menos 6 caracteres.", ok: false });
      else setMsg({ text: m, ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white overflow-x-hidden">

      {/* ══════════════════════════ NAVBAR ══════════════════════════════════ */}
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
          <a href="https://github.com" target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-white transition-colors">
            <Github size={14} />
            Open Source
          </a>
          <button onClick={() => { setTab("login"); document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" }); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a78bfa" }}>
            Entrar
          </button>
        </div>
      </nav>

      {/* ══════════════════════════ HERO ════════════════════════════════════ */}
      <section className="relative pt-40 pb-24 px-6 sm:px-10 overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-20 left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a78bfa" }}>
            <Zap size={11} />
            Gratuito · Open Source · Offline-first
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
            Seu sistema operacional<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa 0%, #6366f1 50%, #38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              pessoal
            </span>
          </h1>

          <p className="text-lg text-[#9ca3af] leading-relaxed max-w-xl mx-auto">
            Segna centraliza finanças, hábitos, saúde, notas e crypto em um único dashboard —
            sincronizado na nuvem e disponível offline.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setTab("signup"); document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" }); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366f1, #5855e0)" }}>
              Começar grátis
              <ArrowRight size={15} />
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <Github size={15} />
              Ver no GitHub
            </a>
          </div>

          <p className="text-xs text-[#4a4a4a]">
            Sem cartão de crédito · Funciona offline · Dados 100% seus
          </p>
        </div>
      </section>

      {/* ══════════════════════════ FEATURES ════════════════════════════════ */}
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

      {/* ══════════════════════════ COMO FUNCIONA ═══════════════════════════ */}
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

      {/* ══════════════════════════ PLANOS / DOAÇÃO ═════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Simples e transparente</h2>
            <p className="text-[#6b7280] text-sm">O Segna é gratuito. Se ele te ajuda, considere apoiar o desenvolvimento.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Plano Grátis */}
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
              <button
                onClick={() => { setTab("signup"); document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" }); }}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-80"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
                Começar grátis
              </button>
            </div>

            {/* Apoiador */}
            <div className="rounded-2xl p-6 space-y-5 flex flex-col relative"
              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(167,139,250,0.06) 100%)", border: "1px solid rgba(99,102,241,0.3)" }}>
              {/* Destaque */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)", color: "#fff" }}>
                ✨ Recomendado
              </div>
              <div>
                <p className="text-xs text-[#a78bfa] font-medium uppercase tracking-wider mb-1">Apoiador</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">Qualquer</span>
                </div>
                <p className="text-[#6b7280] text-xs mt-0.5">valor que você quiser via PIX</p>
              </div>
              <ul className="space-y-2.5 flex-1">
                {["Tudo do plano grátis", "Apoie o desenvolvimento", "Sem mensalidade obrigatória", "Contribuição única ou recorrente", "Com muito ☕ e gratidão"].map(f => (
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

            {/* Pro — em breve */}
            <div className="rounded-2xl p-6 space-y-5 flex flex-col opacity-60"
              style={{ background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-[#f59e0b] font-medium uppercase tracking-wider">Pro</p>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>Em breve</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold">R$ ?</span>
                  <span className="text-[#6b7280] text-sm mb-0.5">/mês</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1">
                {["Tudo do plano grátis", "Dashboard de insights avançados", "Exportação de dados (CSV/PDF)", "Metas e relatórios mensais", "Suporte prioritário"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <Star size={13} className="text-[#f59e0b] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button disabled
                className="w-full py-2.5 rounded-xl text-sm font-medium text-[#4a4a4a] cursor-not-allowed"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                Em breve
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════ OPEN SOURCE ═════════════════════════════ */}
      <section className="px-6 sm:px-10 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-8 sm:p-10 grid sm:grid-cols-2 gap-8 items-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>

            {/* Cloud SaaS */}
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
              <button
                onClick={() => { setTab("signup"); document.getElementById("auth-form")?.scrollIntoView({ behavior: "smooth" }); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #5855e0)" }}>
                Criar conta grátis
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block absolute left-1/2 top-10 bottom-10 w-px"
              style={{ background: "rgba(255,255,255,0.07)" }} />

            {/* Self-hosted */}
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
              <a href="https://github.com" target="_blank" rel="noreferrer"
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

      {/* ══════════════════════════ AUTH FORM ═══════════════════════════════ */}
      <section id="auth-form" className="px-6 sm:px-10 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {tab === "signup" ? "Criar conta grátis" : "Bem-vindo de volta"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {tab === "signup"
                ? "Comece a organizar sua vida hoje"
                : "Entre para acessar seu painel pessoal"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["signup", "login"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setMsg(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={tab === t
                  ? { background: "#6366f1", color: "#fff" }
                  : { color: "#6b7280" }}>
                {t === "signup" ? "Criar conta" : "Entrar"}
              </button>
            ))}
          </div>

          {/* Form */}
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
              <label className="text-xs text-[#6b7280] font-medium">Senha</label>
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
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════════════ */}
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
            <a href="https://github.com" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-[#4a4a4a] hover:text-[#9ca3af] text-xs transition-colors">
              <Github size={10} />
              Open Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
