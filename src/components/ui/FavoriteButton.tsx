import { cn } from '@/lib/format';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toggleFavorite, isFavorite } from '@/api';

interface FavoriteButtonProps {
  listingId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FavoriteButton({ listingId, size = 'md', className }: FavoriteButtonProps) {
  const [fav, setFav] = useState(isFavorite(listingId));
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    const wasFav = fav;
    setFav(!wasFav);
    try {
      await toggleFavorite(listingId);
    } catch {
      setFav(wasFav);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all',
        'hover:bg-error-50 active:scale-90 dark:hover:bg-error-900/20',
        sizeClasses[size],
        className
      )}
      aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={fav}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-colors',
          fav ? 'fill-error-500 text-error-500' : 'text-ink-400 dark:text-ink-500'
        )}
      />
    </button>
  );
}
