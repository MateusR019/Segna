"use client";
import { useToastStore } from "@/hooks/useToast";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 size={15} className="text-[#22c55e] flex-shrink-0" />,
  error: <AlertCircle size={15} className="text-[#ef4444] flex-shrink-0" />,
  info: <Info size={15} className="text-[#06b6d4] flex-shrink-0" />,
};

const BORDER = {
  success: "border-[#22c55e]/30",
  error: "border-[#ef4444]/30",
  info: "border-[#06b6d4]/30",
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2.5 bg-[#1a1a1a] border ${BORDER[t.type]} rounded-xl px-4 py-2.5 shadow-xl shadow-black/40 animate-in slide-in-from-right-4 fade-in duration-200 min-w-[200px] max-w-xs`}
        >
          {ICONS[t.type]}
          <span className="text-sm text-white flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-[#4a4a4a] hover:text-[#9ca3af] transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
