import { cn } from '@/lib/format';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-14 w-14 text-lg',
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium overflow-hidden flex-shrink-0',
        'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
