import { cn } from '@/lib/format';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-ink-900 rounded-card shadow-card overflow-hidden">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
