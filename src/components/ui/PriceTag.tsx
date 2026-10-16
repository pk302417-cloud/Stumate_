import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/format';

interface PriceTagProps {
  price: number;
  negotiable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function PriceTag({ price, negotiable, size = 'md', className }: PriceTagProps) {
  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <span className={cn('font-bold text-ink-900 dark:text-ink-50', sizeClasses[size])}>
        {price === 0 ? 'Free' : formatPrice(price)}
      </span>
      {negotiable && (
        <span className="text-xs font-medium text-accent-600 dark:text-accent-400">Negotiable</span>
      )}
    </div>
  );
}
