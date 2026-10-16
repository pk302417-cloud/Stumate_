import { cn } from '@/lib/format';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  toasts: Toast[];
  show: (message: string, variant?: Toast['variant']) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, variant: Toast['variant'] = 'default') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, variant }]);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  const variantClasses = {
    default: 'bg-ink-800 text-white',
    success: 'bg-success-600 text-white',
    error: 'bg-error-600 text-white',
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up pointer-events-auto',
        variantClasses[toast.variant ?? 'default']
      )}
      onClick={() => dismiss(toast.id)}
    >
      {toast.message}
    </div>
  );
}
