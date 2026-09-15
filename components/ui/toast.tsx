"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "info" | "success" | "warning" | "error" | "provisioning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  resourceId?: string;
  durationMs?: number;
  timestamp: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id" | "timestamp">) => string;
  dismissToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<ToastItem, "id">>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, resourceId, durationMs }: Omit<ToastItem, "id" | "timestamp">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        resourceId,
        durationMs: durationMs ?? (type === "provisioning" ? 0 : 5000),
        timestamp: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.durationMs && newToast.durationMs > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, newToast.durationMs);
      }

      return id;
    },
    []
  );

  const updateToast = useCallback((id: string, updates: Partial<Omit<ToastItem, "id">>) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updated.durationMs && updated.durationMs > 0 && updates.type !== "provisioning") {
            setTimeout(() => {
              setToasts((current) => current.filter((item) => item.id !== id));
            }, updated.durationMs);
          }
          return updated;
        }
        return t;
      })
    );
  }, []);

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      updateToast,
    }),
    [toasts, showToast, dismissToast, updateToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === "provisioning"
                ? "bg-slate-950/95 border-amber-500/40 text-amber-100 shadow-amber-950/20"
                : toast.type === "success"
                ? "bg-slate-950/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/20"
                : toast.type === "error"
                ? "bg-slate-950/95 border-rose-500/40 text-rose-100 shadow-rose-950/20"
                : toast.type === "warning"
                ? "bg-slate-950/95 border-yellow-500/40 text-yellow-100 shadow-yellow-950/20"
                : "bg-slate-950/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/20"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "provisioning" && (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              )}
              {toast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
              {toast.type === "error" && (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-cyan-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold tracking-tight text-white">
                  {toast.title}
                </h4>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {toast.message && (
                <p className="mt-1 text-xs text-slate-300 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.type === "provisioning" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full w-2/3 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono tracking-wider">
                    PROVISIONING
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
