import { cn } from '@/lib/format';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-ink-900 rounded-card shadow-card',
        hover && 'transition-all duration-200 hover:shadow-card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
