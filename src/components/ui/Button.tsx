import { cn } from '@/lib/format';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'btn-gradient',
  secondary: 'bg-brand-500/15 text-brand-200 hover:bg-brand-500/25 active:bg-brand-500/30',
  outline: 'border border-ink-300 text-ink-700 hover:bg-ink-50 active:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800',
  ghost: 'text-ink-600 hover:bg-ink-100 active:bg-ink-200 dark:text-ink-300 dark:hover:bg-ink-800',
  danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm',
  accent: 'btn-gradient',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-lg',
};

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
