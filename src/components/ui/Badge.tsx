import { cn } from '@/lib/format';
import type { ReactNode } from 'react';

type BadgeVariant = 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'neutral' | 'condition_like_new' | 'condition_good' | 'condition_okay';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
  error: 'bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-300',
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
  condition_like_new: 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300',
  condition_good: 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',
  condition_okay: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
};

export function Badge({ variant = 'neutral', children, className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ConditionBadge({ condition, size }: { condition: string; size?: 'sm' | 'md' }) {
  const variant = `condition_${condition}` as BadgeVariant;
  const labels: Record<string, string> = { like_new: 'Like New', good: 'Good', okay: 'Okay' };
  return (
    <Badge variant={variant} size={size}>
      {labels[condition] ?? condition}
    </Badge>
  );
}

export function StatusBadge({ status, size }: { status: string; size?: 'sm' | 'md' }) {
  const variantMap: Record<string, BadgeVariant> = {
    available: 'success',
    reserved: 'warning',
    sold: 'neutral',
    removed: 'neutral',
    expired: 'neutral',
  };
  const labels: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    removed: 'Removed',
    expired: 'Expired',
  };
  return (
    <Badge variant={variantMap[status] ?? 'neutral'} size={size}>
      {labels[status] ?? status}
    </Badge>
  );
}
