"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { loadAllStores } from "@/components/AuthProvider";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";

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
      // Traduz mensagens comuns
      if (msg.includes("Invalid login credentials"))
        setError("E-mail ou senha incorretos.");
      else if (msg.includes("Email not confirmed"))
        setError("Confirme seu e-mail antes de entrar.");
      else if (msg.includes("User already registered"))
        setError("Este e-mail já está cadastrado. Faça login.");
      else
        setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/icon-192.png"
            alt="Segna"
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">Segna</h1>
            <p className="text-sm text-[#4a4a4a]">
              {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#6b7280]">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#6366f1] transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#6b7280]">Senha</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder:text-[#3a3a3a] focus:outline-none focus:border-[#6366f1] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-[#9ca3af] cursor-pointer"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error / Info */}
          {error && (
            <p className={`text-xs px-3 py-2 rounded-lg ${
              error.includes("criada") || error.includes("Confirme")
                ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
            }`}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#5855e0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-colors cursor-pointer"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
            ) : (
              <>
                <LogIn size={15} />
                {mode === "login" ? "Entrar" : "Criar conta"}
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-xs text-[#4a4a4a]">
          {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="text-[#6366f1] hover:text-[#a78bfa] cursor-pointer transition-colors"
          >
            {mode === "login" ? "Criar conta" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
}
