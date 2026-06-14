"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      remove(id);
    }, 3000);
  }, [remove]);

  const success = useCallback((message: string) => add(message, "success"), [add]);
  const error = useCallback((message: string) => add(message, "error"), [add]);

  return (
    <ToastContext.Provider value={{ success, error, remove }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
            ) : (
              <AlertCircle size={18} style={{ color: "var(--danger)" }} />
            )}
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
              {toast.message}
            </span>
            <button
              onClick={() => remove(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
