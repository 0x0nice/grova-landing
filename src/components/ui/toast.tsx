"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  message: string;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (messageOrOptions: string | ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

interface ToastState extends ToastOptions {
  id: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback((messageOrOptions: string | ToastOptions) => {
    const opts: ToastOptions =
      typeof messageOrOptions === "string"
        ? { message: messageOrOptions }
        : messageOrOptions;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    idRef.current += 1;
    setToast({ id: idRef.current, ...opts });

    // Longer timeout when an action is offered, so the user has time to click.
    const duration = opts.action ? 5000 : 2500;
    timeoutRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]
                       bg-text text-bg font-mono text-callout
                       rounded shadow-lg
                       inline-flex items-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <span className="px-6 py-3">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss();
                }}
                className="self-stretch px-4 py-3 border-l border-bg/15
                           font-mono text-footnote uppercase tracking-[0.04em]
                           text-accent hover:bg-bg/5 active:bg-bg/10
                           transition-colors duration-[180ms] cursor-pointer rounded-r"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
