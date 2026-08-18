"use client";

import { useState, useCallback, createContext, useContext } from "react";

type ToastType = "success" | "error" | "info" | "loading";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
  txHash?: string;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, txHash?: string) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, message: string, txHash?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message, txHash }]);

      if (type !== "loading") {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 6000);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "loading"
              ? "bg-zinc-800 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toast.type === "loading" && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {toast.type === "success" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}

          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${toast.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline opacity-90 hover:opacity-100"
              >
                View on ArcScan
              </a>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function parseTxError(error: any): string {
  const msg = error?.message || error?.toString() || "";

  if (msg.includes("user rejected") || msg.includes("User denied")) {
    return "Transaction rejected by user";
  }
  if (msg.includes("insufficient funds") || msg.includes("insufficient USDC")) {
    return "Insufficient USDC for gas";
  }
  if (msg.includes("Already responded")) {
    return "You have already responded to this survey";
  }
  if (msg.includes("Max responses reached")) {
    return "This survey has reached maximum responses";
  }
  if (msg.includes("Survey not active")) {
    return "This survey is no longer active";
  }
  if (msg.includes("Only creator")) {
    return "Only the survey creator can do this";
  }
  if (msg.includes("No remaining balance")) {
    return "No remaining balance to withdraw";
  }

  return "Transaction failed. Please try again.";
}
