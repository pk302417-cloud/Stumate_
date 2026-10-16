import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchListings, fetchCategories } from '@/api';
import { ListingGrid } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn, formatPrice } from '@/lib/format';

const priceChips = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–2000', min: 500, max: 2000 },
  { label: '₹2000–5000', min: 2000, max: 5000 },
  { label: '₹5000+', min: 5000, max: undefined },
];

const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
  { label: 'Leaving soon', value: 'leaving_soon' },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 300000 });

  const params = useMemo(() => ({
    search: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    minPrice: searchParams.get('min') ? Number(searchParams.get('min')) : undefined,
    maxPrice: searchParams.get('max') ? Number(searchParams.get('max')) : undefined,
    condition: searchParams.get('condition') ?? undefined,
    negotiable: searchParams.get('negotiable') === 'true' ? true : undefined,
    sort: (searchParams.get('sort') ?? 'newest') as 'newest' | 'price_low' | 'price_high' | 'leaving_soon',
  }), [searchParams]);

  const {
    data: pages, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['listings', 'search', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchListings({ ...params, page: pageParam }),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? all.length + 1 : undefined;
    },
  });
  const data = pages
    ? { items: pages.pages.flatMap(p => p.items), total: pages.pages[0]?.total ?? 0 }
    : undefined;

  useEffect(() => {
    const t = setTimeout(() => {
      const current = searchParams.get('q') ?? '';
      if (current !== searchInput) {
        updateParam('q', searchInput || null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (params.category) activeFilters.push({ label: params.category, clear: () => updateParam('category', null) });
  if (params.minPrice != null) activeFilters.push({ label: `Min ${formatPrice(params.minPrice)}`, clear: () => updateParam('min', null) });
  if (params.maxPrice != null) activeFilters.push({ label: `Max ${formatPrice(params.maxPrice)}`, clear: () => updateParam('max', null) });
  if (params.condition) activeFilters.push({ label: params.condition, clear: () => updateParam('condition', null) });
  if (params.negotiable) activeFilters.push({ label: 'Negotiable', clear: () => updateParam('negotiable', null) });

  const filterContent = (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <h4 className="font-medium text-sm text-ink-700 dark:text-ink-200 mb-2">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories?.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', params.category === cat.slug ? null : cat.slug)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                params.category === cat.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-medium text-sm text-ink-700 dark:text-ink-200 mb-2">Price range</h4>
        <div className="flex flex-wrap gap-2">
          {priceChips.map(chip => {
            const active = params.minPrice === chip.min && params.maxPrice === chip.max;
            return (
              <button
                key={chip.label}
                onClick={() => {
                  updateParam('min', active ? null : String(chip.min));
                  updateParam('max', active ? null : (chip.max != null ? String(chip.max) : null));
                }}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full transition-colors',
                  active ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="font-medium text-sm text-ink-700 dark:text-ink-200 mb-2">Condition</h4>
        <div className="flex gap-2">
          {['like_new', 'good', 'okay'].map(c => (
            <button
              key={c}
              onClick={() => updateParam('condition', params.condition === c ? null : c)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full transition-colors',
                params.condition === c ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
              )}
            >
              {c === 'like_new' ? 'Like New' : c === 'good' ? 'Good' : 'Okay'}
            </button>
          ))}
        </div>
      </div>

      {/* Negotiable */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={params.negotiable ?? false}
            onChange={e => updateParam('negotiable', e.target.checked ? 'true' : null)}
            className="w-5 h-5 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          />
          <span className="text-sm text-ink-700 dark:text-ink-200">Negotiable only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search for items..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="flex-1 h-11 px-4 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          className="lg:hidden"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-20 bg-white dark:bg-ink-900 rounded-2xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ink-800 dark:text-ink-100">Filters</h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-xs text-brand-600 dark:text-brand-400 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort + count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-ink-500 dark:text-ink-400">
              {data ? `${data.total} results` : 'Loading...'}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={params.sort}
                onChange={e => updateParam('sort', e.target.value)}
                className="h-9 px-3 text-sm rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activeFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-xs font-medium rounded-full"
                >
                  {f.label} <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <ListingGridSkeleton count={10} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No listings found"
              description="Try adjusting your search or filters."
            />
          ) : (
            <>
              <ListingGrid listings={data.items} />
              {hasNextPage && (
                <div className="text-center mt-6">
                  <Button variant="outline" loading={isFetchingNextPage} onClick={() => void fetchNextPage()}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        {filterContent}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => setSearchParams(new URLSearchParams())} className="flex-1">
            Clear all
          </Button>
          <Button onClick={() => setShowFilters(false)} className="flex-1">
            Show results
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
