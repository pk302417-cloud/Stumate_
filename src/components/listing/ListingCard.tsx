import { useState } from 'react';
import { cn, formatPrice, formatRelativeTime, conditionLabel, isLeavingSoon, formatPickupDate, daysUntil, formatAgeShort } from '@/lib/format';
import type { Listing } from '@/types/database';
import { MapPin } from 'lucide-react';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Link } from 'react-router-dom';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const leavingSoon = isLeavingSoon(listing.pickup_before);
  const days = listing.pickup_before ? daysUntil(listing.pickup_before) : null;
  const [imgFailed, setImgFailed] = useState(false);
  const coverImage = imgFailed ? undefined : listing.image_urls?.[0];

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={cn(
        'group block bg-white dark:bg-ink-900 rounded-card shadow-card overflow-hidden',
        'transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="relative aspect-square bg-ink-100 dark:bg-ink-800 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CategoryIcon slug={listing.category?.slug ?? 'other'} className="w-12 h-12 text-brand-300/70" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {leavingSoon && days != null && days >= 0 && (
            <span className="px-2 py-0.5 bg-ink-950/80 ring-1 ring-accent-400/60 text-accent-300 text-xs font-semibold rounded-full backdrop-blur">
              Pick up in {days}d
            </span>
          )}
          {listing.status !== 'available' && (
            <span className="px-2 py-0.5 bg-ink-800 text-white text-xs font-medium rounded-full shadow-sm">
              {listing.status === 'sold' ? 'Sold' : listing.status === 'reserved' ? 'Reserved' : 'Expired'}
            </span>
          )}
        </div>
        <div className="absolute top-1 right-1">
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
        <div className="absolute bottom-2 left-0 flex items-center bg-gradient-to-r from-brand-500 to-accent-400 text-ink-950 font-display font-bold text-sm sm:text-base pl-2.5 pr-3 py-0.5 rounded-r-full shadow-[0_6px_16px_-6px_rgba(139,92,246,0.8)]">
          <span className="w-1.5 h-1.5 rounded-full bg-ink-950/70 mr-1.5" aria-hidden />
          {listing.price_inr === 0 ? 'Free' : formatPrice(listing.price_inr)}
          {listing.is_negotiable && <span className="ml-1.5 text-[10px] font-semibold opacity-70">neg.</span>}
        </div>
      </div>

      <div className="p-2.5 space-y-1">
        <h3 className="text-sm font-medium text-ink-800 dark:text-ink-100 line-clamp-2 leading-snug min-h-[2.5rem]">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-ink-400 dark:text-ink-500">
          <span className="line-clamp-1">
            {conditionLabel(listing.condition)}
            {formatAgeShort(listing.age_months) ? ` · ${formatAgeShort(listing.age_months)}` : ''}
          </span>
          <span>{formatRelativeTime(listing.created_at)}</span>
        </div>
        {listing.category && (
          <div className="text-[11px] text-ink-400 dark:text-ink-500 line-clamp-1">{listing.category.name}</div>
        )}
        {listing.hostel && (
          <div className="flex items-center gap-0.5 text-[11px] text-ink-400 dark:text-ink-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{listing.hostel}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function ListingGrid({ listings, className }: { listings: Listing[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3', className)}>
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
