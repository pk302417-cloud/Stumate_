import { cn } from '@/lib/format';
import type { ReactNode } from 'react';

interface TabsProps {
  tabs: { label: string; value: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto scrollbar-hide border-b border-ink-200 dark:border-ink-800', className)}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative',
            'border-b-2 -mb-px',
            active === tab.value
              ? 'text-brand-600 border-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'text-ink-500 border-transparent hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200'
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className={cn(
              'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              active === tab.value ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
