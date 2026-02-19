"use client";

import { useEffect, useState } from "react";

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

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none safe-bottom">
      {toasts.map((toast) => {
        const style =
          toast.type === "success"
            ? "bg-emerald-500/90 border-emerald-400/20 shadow-emerald-500/20"
            : toast.type === "undo"
              ? "bg-amber-500/90 border-amber-400/20 shadow-amber-500/20"
              : "bg-slate-700/90 border-slate-600/20 shadow-slate-700/20";

        return (
          <div
            key={toast.id}
            className={`${style} text-white text-[13px] font-semibold px-5 py-3 rounded-2xl
                        shadow-2xl border backdrop-blur-md animate-bounce-in pointer-events-auto`}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
