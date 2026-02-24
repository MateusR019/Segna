import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
  startExit: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = "success") => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Start exit animation at 2.8s, remove at 3s
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t),
      }));
    }, 2800);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  startExit: (id) => {
    set((s) => ({
      toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t),
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 200);
  },
  dismiss: (id) => {
    set((s) => ({
      toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t),
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 200);
  },
}));

/** Convenience hook */
export function useToast() {
  const { show } = useToastStore();
  return {
    toast: show,
    success: (msg: string) => show(msg, "success"),
    error: (msg: string) => show(msg, "error"),
    info: (msg: string) => show(msg, "info"),
  };
}
