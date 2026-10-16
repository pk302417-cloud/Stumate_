import { useQuery } from '@tanstack/react-query';
import { fetchFavorites } from '@/api';
import { ListingGrid } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function FavoritesPage() {
  const { data: listings, isLoading, isError, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-4">Saved items</h1>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListingGridSkeleton count={8} />
      ) : !listings || listings.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-12 h-12" />}
          title="No saved items yet"
          description="Tap the heart icon on any listing to save it for later."
          action={<Link to="/home"><Button>Browse listings</Button></Link>}
        />
      ) : (
        <ListingGrid listings={listings} />
      )}
    </div>
  );
}
