"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loadAllStores } from "@/components/AuthProvider";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  LogIn,
  TrendingUp,
  CheckSquare,
  FileText,
  Activity,
  Smile,
  DollarSign,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  UserPlus,
} from "lucide-react";

/* ─── Feature list ──────────────────────────────────────────────────────────── */
const features = [
  {
    icon: DollarSign,
    label: "Finanças",
    desc: "Gastos, metas e orçamento mensal",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
  {
    icon: TrendingUp,
    label: "DeFi & Crypto",
    desc: "Portfólio e tokens Web3",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
  },
  {
    icon: CheckSquare,
    label: "Tarefas & Hábitos",
    desc: "Rotinas que realmente funcionam",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    icon: FileText,
    label: "Notas",
    desc: "Ideias, checklists e anotações",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
  },
  {
    icon: Activity,
    label: "Saúde Corporal",
    desc: "Peso, IMC e composição corporal",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
  },
  {
    icon: Smile,
    label: "Humor & Revisão",
    desc: "Reflita e evolua toda semana",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
  },
];

const mobilePills = ["Finanças", "Hábitos", "DeFi", "Notas", "Saúde"];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [mode, setMode]         = useState<"login" | "signup">("login");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await loadAllStores();
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Conta criada! Verifique seu e-mail para confirmar o cadastro.");
        setMode("login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      if (msg.includes("Invalid login credentials"))
        setError("E-mail ou senha incorretos.");
      else if (msg.includes("Email not confirmed"))
        setError("Confirme seu e-mail antes de entrar.");
      else if (msg.includes("User already registered"))
        setError("Este e-mail já está cadastrado. Faça login.");
      else if (msg.includes("Password should be at least"))
        setError("A senha deve ter pelo menos 6 caracteres.");
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = error?.includes("criada") || error?.includes("Confirme");

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">

      {/* ═══ LEFT PANEL — marketing (desktop only) ═══════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 w-[58%] flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #07071c 0%, #0a0a14 60%, #0d0a0a 100%)" }}>

        {/* Gradient orbs */}
        <div className="absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[5%] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)" }} />

        {/* Top logo */}
        <div className="flex items-center gap-3 relative z-10">
          <Image src="/icon-192.png" alt="Segna" width={34} height={34} className="rounded-xl" />
          <span className="text-white font-semibold text-base tracking-tight">Segna</span>
        </div>

        {/* Main content */}
        <div className="space-y-10 relative z-10">
          {/* Headline */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#a78bfa" }}>
              <Zap size={11} />
              Gratuito · Privado · Offline-first
            </div>
            <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
              Organize sua vida<br />
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                em um só lugar.
              </span>
            </h2>
            <p className="text-[#9ca3af] text-base leading-relaxed max-w-md">
              Finanças, hábitos, saúde, notas e muito mais — tudo conectado,
              sincronizado na nuvem e sempre com você.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label}
                className="flex items-start gap-3 rounded-2xl p-4 transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                <div className="rounded-lg p-2 flex-shrink-0 mt-0.5" style={{ background: bg }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-[#6b7280] text-xs leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badges */}
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-1.5 text-[#6b7280] text-xs">
            <Shield size={11} className="text-[#22c55e]" />
            Grátis para sempre
          </div>
          <div className="flex items-center gap-1.5 text-[#6b7280] text-xs">
            <Lock size={11} className="text-[#6366f1]" />
            Dados criptografados
          </div>
          <div className="flex items-center gap-1.5 text-[#6b7280] text-xs">
            <Zap size={11} className="text-[#f59e0b]" />
            Funciona offline
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — auth form ═════════════════════════════════════════ */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[42%] p-6 sm:p-10 min-h-screen bg-[#0a0a0a]">
        <div className="w-full max-w-sm space-y-7">

          {/* ── Mobile header (logo + tagline + pills) ── */}
          <div className="lg:hidden flex flex-col items-center gap-3 pb-1">
            <Image src="/icon-192.png" alt="Segna" width={52} height={52} className="rounded-2xl" />
            <div className="text-center">
              <h1 className="text-xl font-semibold text-white">Segna</h1>
              <p className="text-sm text-[#6b7280] mt-0.5">Organize sua vida em um só lugar</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {mobilePills.map((f) => (
                <span key={f}
                  className="px-2.5 py-0.5 rounded-full text-[11px] text-[#9ca3af]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* ── Desktop header ── */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-white">
              {mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
            </h2>
            <p className="text-sm text-[#6b7280]">
              {mode === "login"
                ? "Entre para acessar seu painel pessoal"
                : "Comece a organizar sua vida hoje, de graça"}
            </p>
          </div>

          {/* ── Mobile form title ── */}
          <div className="lg:hidden text-center">
            <h2 className="text-lg font-semibold text-white">
              {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#6b7280] font-medium">E-mail</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#6b7280] font-medium">Senha</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-[#4a4a4a] px-0.5">Mínimo de 6 caracteres</p>
              )}
            </div>

            {/* Error / Info */}
            {error && (
              <div className={`flex items-start gap-2 text-xs px-3.5 py-2.5 rounded-xl ${
                isSuccess
                  ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                  : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
              }`}>
                <span className="mt-0.5 flex-shrink-0">{isSuccess ? "✓" : "⚠"}</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-xl py-2.5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #5855e0 100%)" }}
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-transparent" />
              ) : mode === "login" ? (
                <>
                  <LogIn size={14} />
                  Entrar na conta
                  <ArrowRight size={14} className="ml-auto" />
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Criar conta grátis
                  <ArrowRight size={14} className="ml-auto" />
                </>
              )}
            </button>
          </form>

          {/* ── Toggle mode ── */}
          <p className="text-center text-xs text-[#4a4a4a]">
            {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              className="text-[#a78bfa] hover:text-[#6366f1] cursor-pointer transition-colors font-medium"
            >
              {mode === "login" ? "Criar conta grátis" : "Fazer login"}
            </button>
          </p>

          {/* ── Mobile badges ── */}
          <div className="lg:hidden flex items-center justify-center gap-4 pt-2 border-t border-[#1a1a1a]">
            <div className="flex items-center gap-1 text-[#6b7280] text-[10px]">
              <Shield size={9} className="text-[#22c55e]" />
              Grátis
            </div>
            <div className="flex items-center gap-1 text-[#6b7280] text-[10px]">
              <Lock size={9} className="text-[#6366f1]" />
              Privado
            </div>
            <div className="flex items-center gap-1 text-[#6b7280] text-[10px]">
              <Zap size={9} className="text-[#f59e0b]" />
              Offline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
