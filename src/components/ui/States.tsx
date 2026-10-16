import { cn } from '@/lib/format';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {icon && (
        <div className="mb-4 text-ink-300 dark:text-ink-600">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink-700 dark:text-ink-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-400 dark:text-ink-500 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', description = 'Please try again in a moment.', onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      <div className="mb-4 w-16 h-16 rounded-full bg-error-50 dark:bg-error-900/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-ink-700 dark:text-ink-200 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 dark:text-ink-500 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
