import { cn } from '@/lib/format';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 dark:text-ink-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full h-11 px-3.5 rounded-xl border bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50',
          'placeholder:text-ink-400 dark:placeholder:text-ink-500',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150',
          error ? 'border-error-400' : 'border-ink-300 dark:border-ink-700',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink-700 dark:text-ink-200">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50',
          'placeholder:text-ink-400 dark:placeholder:text-ink-500 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150',
          error ? 'border-error-400' : 'border-ink-300 dark:border-ink-700',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink-700 dark:text-ink-200">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full h-11 px-3.5 rounded-xl border bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50',
          'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150 cursor-pointer',
          error ? 'border-error-400' : 'border-ink-300 dark:border-ink-700',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  );
}
