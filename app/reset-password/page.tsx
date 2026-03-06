"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase v2: after clicking the email link, the code is in the URL
    // The client automatically exchanges it for a session on first load
    const { data: listener } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Also check existing session (covers both PKCE and implicit flows)
    void supabase.auth.getSession().then(
      ({ data: sd }: { data: { session: unknown } }) => {
        if (sd.session) setReady(true);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateErr) {
      setError(updateErr.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center">
          <Image
            src="/icon-192.png"
            alt="Segna"
            width={32}
            height={32}
            className="rounded-xl"
          />
          <Image
            src="/logo.png"
            alt="Segna"
            width={80}
            height={20}
            className="object-contain"
          />
        </div>

        {done ? (
          /* ── Sucesso ── */
          <div className="bg-[#1a1a1a] border border-[#22c55e]/30 rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-[#22c55e]/10 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-[#22c55e]" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Senha redefinida!</p>
              <p className="text-sm text-[#6b7280] mt-1">
                Redirecionando para o dashboard…
              </p>
            </div>
          </div>
        ) : !ready ? (
          /* ── Aguardando sessão ── */
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-[#f59e0b]/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={28} className="text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-white font-semibold">Verificando link…</p>
              <p className="text-sm text-[#6b7280] mt-1">
                Aguarde um momento ou acesse o link enviado por e-mail novamente.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="text-xs text-[#6366f1] hover:text-[#a78bfa] transition-colors cursor-pointer"
            >
              ← Voltar para o login
            </button>
          </div>
        ) : (
          /* ── Formulário ── */
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 space-y-6">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-white">Nova senha</h1>
              <p className="text-sm text-[#6b7280]">
                Escolha uma senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nova senha */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#6b7280]">Nova senha</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]"
                  />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-[#4a4a4a] outline-none focus:border-[#6366f1] transition-colors"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] hover:text-white transition-colors cursor-pointer"
                  >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#6b7280]">Confirmar senha</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a]"
                  />
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a4a4a] outline-none focus:border-[#6366f1] transition-colors"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Indicador de força */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => {
                      const strength =
                        password.length >= 12
                          ? 4
                          : password.length >= 8
                          ? 3
                          : password.length >= 6
                          ? 2
                          : 1;
                      return (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            background:
                              i <= strength
                                ? strength === 1
                                  ? "#ef4444"
                                  : strength === 2
                                  ? "#f59e0b"
                                  : strength === 3
                                  ? "#22c55e"
                                  : "#6366f1"
                                : "#2a2a2a",
                          }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#4a4a4a]">
                    {password.length < 6
                      ? "Muito curta"
                      : password.length < 8
                      ? "Fraca"
                      : password.length < 12
                      ? "Boa"
                      : "Forte"}
                  </p>
                </div>
              )}

              {/* Erro */}
              {error && (
                <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                {loading ? "Salvando…" : "Redefinir senha"}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push("/login")}
                className="text-xs text-[#4a4a4a] hover:text-[#6b7280] transition-colors cursor-pointer"
              >
                ← Voltar para o login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
