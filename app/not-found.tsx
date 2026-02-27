import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <SearchX size={28} className="text-[#4a4a4a]" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-5xl font-bold text-[#2a2a2a] tabular-nums">404</p>
          <h1 className="text-lg font-semibold text-white">Página não encontrada</h1>
          <p className="text-sm text-[#6b7280]">
            O endereço que você acessou não existe ou foi movido.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Home size={14} />
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  );
}
