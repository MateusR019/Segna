"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
            <AlertTriangle size={28} className="text-[#ef4444]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-white">Algo deu errado</h1>
          <p className="text-sm text-[#6b7280]">
            Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
          </p>
          {error.digest && (
            <p className="text-[11px] text-[#3a3a3a] font-mono">#{error.digest}</p>
          )}
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
