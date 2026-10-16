import { useId } from 'react';
import { cn } from '@/lib/format';

/** Stumate logo: a price tag — what every item on the marketplace wears. */
export function BrandMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={cn('w-8 h-8', className)} role="img" aria-label="Stumate">
      <defs>
        <linearGradient id={id} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="#121626" stroke="rgba(255,255,255,0.12)" />
      <path
        d="M9.5 8h7.2c.4 0 .8.2 1.1.5l5.2 5.2c.6.6.6 1.5 0 2.1l-5.4 5.4c-.6.6-1.5.6-2.1 0l-5.2-5.2c-.3-.3-.5-.7-.5-1.1V9.5c0-.8.7-1.5 1.7-1.5z"
        fill={`url(#${id})`}
      />
      <circle cx="12.6" cy="12.6" r="1.7" fill="#121626" />
    </svg>
  );
}
