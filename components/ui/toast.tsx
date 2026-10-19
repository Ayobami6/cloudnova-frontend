"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { MaterialIcon } from "./material-icon";

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
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-[22px] bg-white dark:bg-[#1C2029] border border-[#E7E4DF] dark:border-[#282D3A] shadow-xl transition-all duration-300"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === "provisioning"
                  ? "bg-[#F8D568] text-[#1E1E1E]"
                  : toast.type === "success"
                  ? "bg-[#D5EBD9] text-[#4EA871]"
                  : toast.type === "error"
                  ? "bg-[#FADBD8] text-[#D94E4E]"
                  : toast.type === "warning"
                  ? "bg-[#F8D568] text-[#1E1E1E]"
                  : "bg-[#CFE0EC] text-[#1E1E1E]"
              }`}
            >
              {toast.type === "provisioning" && (
                <MaterialIcon name="progress_activity" size={18} className="animate-spin" />
              )}
              {toast.type === "success" && <MaterialIcon name="check_circle" size={18} />}
              {toast.type === "error" && <MaterialIcon name="error" size={18} />}
              {toast.type === "warning" && <MaterialIcon name="warning" size={18} />}
              {toast.type === "info" && <MaterialIcon name="info" size={18} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold tracking-tight text-[#1E1E1E] dark:text-white">
                  {toast.title}
                </h4>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="text-[#8C8B87] hover:text-[#1E1E1E] dark:hover:text-white p-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>
              {toast.message && (
                <p className="mt-1 text-[11px] text-[#5A5A58] dark:text-slate-300 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
              {toast.type === "provisioning" && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-[#EFECE8] dark:bg-[#232834] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F8D568] rounded-full w-2/3 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-[#E09F3E] font-mono font-semibold tracking-wider">
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
