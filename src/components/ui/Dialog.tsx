import { cn } from '@/lib/format';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white dark:bg-ink-900 rounded-2xl shadow-2xl w-full max-w-md',
          'animate-scale-in max-h-[90vh] flex flex-col',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-ink-100 dark:border-ink-800">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
