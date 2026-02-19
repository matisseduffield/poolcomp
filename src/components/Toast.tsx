"use client";

import { useEffect, useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "undo";
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function showToast(message: string, type: Toast["type"] = "info") {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

const ICON_MAP = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  undo: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3 8h10M3 8l3-3M3 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4M8 5.5v0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none safe-bottom">
      {toasts.map((toast) => {
        const base =
          toast.type === "success"
            ? "bg-emerald-500/90 border-emerald-400/20"
            : toast.type === "undo"
              ? "bg-amber-500/90 border-amber-400/20"
              : "bg-slate-700/90 border-slate-600/20";

        return (
          <div
            key={toast.id}
            role="status"
            onClick={() => dismiss(toast.id)}
            className={`${base} text-white text-[13px] font-semibold px-4 py-2.5 rounded-2xl
                        shadow-2xl border backdrop-blur-md animate-bounce-in pointer-events-auto
                        cursor-pointer active:scale-95 transition-transform
                        flex items-center gap-2 max-w-[90vw]`}
          >
            {ICON_MAP[toast.type]}
            <span className="truncate">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
