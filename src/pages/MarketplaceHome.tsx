import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';
import { fetchCategories, fetchListings } from '@/api';
import { ListingGrid } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useAuth } from '@/hooks/useAuth';

export function MarketplaceHome() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const [q, setQ] = useState('');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 300000 });
  const {
    data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['listings', 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchListings({ sort: 'newest', page: pageParam }),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? all.length + 1 : undefined;
    },
  });

  const items = data?.pages.flatMap(p => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-ink-50">
          What are you looking for?
        </h1>
        {account?.college_name && <p className="text-sm text-ink-500">Listed by students at {account.college_name}</p>}
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search table, books, cycle…"
            className="w-full h-12 pl-10 pr-3 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <Button type="submit" size="lg">Search</Button>
      </form>

      {categories && categories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.slug}`}
              className="flex flex-col items-center justify-center gap-1.5 min-w-[76px] p-3 rounded-2xl bg-white dark:bg-ink-900 shadow-soft hover:shadow-card-hover transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <CategoryIcon slug={cat.slug} className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <span className="text-xs font-medium text-ink-600 dark:text-ink-300 text-center whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-ink-800 dark:text-ink-100">
            All items {total > 0 && <span className="text-sm font-normal text-ink-400">({total})</span>}
          </h2>
          <Link to="/search" className="text-sm text-brand-600 dark:text-brand-400 font-medium">Filters & sort</Link>
        </div>

        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <ListingGridSkeleton count={10} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nothing listed yet"
            description="Be the first to list something for your campus."
            action={<Button onClick={() => navigate('/sell')}><Plus className="w-4 h-4" /> Sell an item</Button>}
          />
        ) : (
          <>
            <ListingGrid listings={items} />
            {hasNextPage && (
              <div className="text-center mt-6">
                <Button variant="outline" loading={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
