"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "btn-joe",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xl p-0 sm:p-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="glass-elevated rounded-t-3xl sm:rounded-3xl p-6 pb-8 sm:pb-6 max-w-sm w-full safe-bottom
                   animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-5 sm:hidden" />

        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-400">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 text-center">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed text-center">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="h-12 rounded-xl btn-ghost text-slate-300 font-semibold
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-12 rounded-xl text-white font-semibold
                       active:scale-[0.96] transition-all duration-150
                       cursor-pointer ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
