import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchListings, updateListingStatus, renewListing, deleteListing } from '@/api';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { ListingGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatPickupDate, daysUntil, cn } from '@/lib/format';
import { Link } from 'react-router-dom';
import { Plus, RotateCcw, Trash2, Edit, Eye, Package } from 'lucide-react';
import type { Listing, ListingStatus } from '@/types/database';

const statusTabs = [
  { label: 'Active', value: 'available' },
  { label: 'Reserved', value: 'reserved' },
  { label: 'Sold', value: 'sold' },
  { label: 'Expired', value: 'expired' },
];

export function MyListingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const { show } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-listings', user?.id, activeTab],
    enabled: !!user,
    queryFn: () => fetchListings({ status: activeTab, sellerId: user?.id, pageSize: 50 }),
  });

  const renewMutation = useMutation({
    mutationFn: (id: string) => renewListing(id),
    onSuccess: () => {
      show('Listing renewed for 60 days', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => show('Could not renew listing', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      show('Listing deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => show('Could not delete listing', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ListingStatus }) => updateListingStatus(id, status),
    onSuccess: () => {
      show('Status updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => show('Could not update status', 'error'),
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">My listings</h1>
        <Link to="/sell">
          <Button size="sm"><Plus className="w-4 h-4" /> New listing</Button>
        </Link>
      </div>

      <Tabs tabs={statusTabs} active={activeTab} onChange={setActiveTab} className="mb-4" />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <ListingGridSkeleton count={6} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12" />}
          title="No listings here yet"
          description={activeTab === 'available' ? "You haven't listed any items for sale yet." : `You have no ${activeTab} listings.`}
          action={<Link to="/sell"><Button><Plus className="w-4 h-4" /> Create listing</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {data.items.map(listing => (
            <MyListingCard
              key={listing.id}
              listing={listing}
              onRenew={() => renewMutation.mutate(listing.id)}
              onDelete={() => deleteMutation.mutate(listing.id)}
              onStatusChange={(status) => statusMutation.mutate({ id: listing.id, status })}
              renewing={renewMutation.isPending}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyListingCard({ listing, onRenew, onDelete, onStatusChange, renewing, deleting }: {
  listing: Listing;
  onRenew: () => void;
  onDelete: () => void;
  onStatusChange: (status: ListingStatus) => void;
  renewing: boolean;
  deleting: boolean;
}) {
  const expiryDays = daysUntil(listing.expires_at);
  const coverImage = listing.image_urls?.[0];

  return (
    <Card className="flex gap-3 p-3" hover={false}>
      <Link to={`/listing/${listing.id}`} className="flex-shrink-0">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-ink-100">
          {coverImage ? (
            <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-ink-300" /></div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={`/listing/${listing.id}`}>
              <h3 className="font-medium text-ink-800 dark:text-ink-100 line-clamp-1 hover:text-brand-600">{listing.title}</h3>
            </Link>
            <StatusBadge status={listing.status} />
          </div>
          <p className="text-lg font-bold text-ink-900 dark:text-ink-50 mt-0.5">
            {listing.price_inr === 0 ? 'Free' : formatPrice(listing.price_inr)}
          </p>
          <div className="flex items-center gap-3 text-xs text-ink-400 mt-1">
            {listing.pickup_before && <span>Pickup by {formatPickupDate(listing.pickup_before)}</span>}
            {expiryDays <= 7 && expiryDays >= 0 && (
              <span className={cn('font-medium', expiryDays <= 3 ? 'text-error-500' : 'text-accent-500')}>
                Expires in {expiryDays}d
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {listing.status === 'available' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('reserved')}>Mark reserved</Button>
          )}
          {listing.status === 'reserved' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('available')}>Mark available</Button>
          )}
          {listing.status !== 'sold' && (
            <Button size="sm" variant="outline" onClick={() => onStatusChange('sold')}>Mark sold</Button>
          )}
          {(listing.status === 'expired' || expiryDays <= 7) && (
            <Button size="sm" variant="ghost" onClick={onRenew} loading={renewing}>
              <RotateCcw className="w-3.5 h-3.5" /> Renew
            </Button>
          )}
          <Link to={`/sell/${listing.id}/edit`}>
            <Button size="sm" variant="ghost"><Edit className="w-3.5 h-3.5" /></Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onDelete} loading={deleting}>
            <Trash2 className="w-3.5 h-3.5 text-error-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
