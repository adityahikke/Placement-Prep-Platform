import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-200 dark:border-emerald-900',
    iconColor: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    ring: 'border-red-200 dark:border-red-900',
    iconColor: 'text-red-500',
    bar: 'bg-red-500',
  },
  info: {
    icon: Info,
    ring: 'border-blue-200 dark:border-blue-900',
    iconColor: 'text-blue-500',
    bar: 'bg-blue-500',
  },
};

/**
 * Lightweight, dependency-free toast system. Wrap the app once with
 * {@link ToastProvider}, then call {@code const toast = useToast()} and use
 * {@code toast.success(msg)}, {@code toast.error(msg)}, {@code toast.info(msg)}.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    // Mark as leaving so the exit animation can play, then remove.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const push = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const api = {
    show: push,
    success: (msg, duration) => push(msg, 'success', duration),
    error: (msg, duration) => push(msg, 'error', duration ?? 6000),
    info: (msg, duration) => push(msg, 'info', duration),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast viewport */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const style = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 pl-4 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border ${style.ring} shadow-lg shadow-slate-900/5 ${
                t.leaving ? 'pp-toast-out' : 'pp-toast-in'
              }`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
              <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug break-words">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
