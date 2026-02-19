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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => {
        const bgColor =
          toast.type === "success"
            ? "bg-emerald-600"
            : toast.type === "undo"
              ? "bg-amber-600"
              : "bg-slate-700";

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg
                        border border-white/10 animate-bounce-in pointer-events-auto`}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
