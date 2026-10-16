import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchListingById, fetchListingsBySeller, findOrCreateConversation, updateListingStatus, renewListing, deleteListing, submitListingReport } from '@/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge, ConditionBadge, StatusBadge } from '@/components/ui/Badge';
import { PriceTag } from '@/components/ui/PriceTag';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { Dialog } from '@/components/ui/Dialog';
import { ListingCard } from '@/components/listing/ListingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatPickupDate, formatRelativeTime, daysUntil, formatAge, cn } from '@/lib/format';
import {
  MapPin, Calendar, Clock, MessageCircle, Flag, MoreVertical, ChevronLeft,
  Edit, RotateCcw, Trash2, CheckCircle, XCircle, AlertCircle, Share2,
} from 'lucide-react';
import type { Listing } from '@/types/database';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [failedImgs, setFailedImgs] = useState<string[]>([]);

  const { data: listing, isLoading, isError, refetch } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id!),
    enabled: !!id,
  });

  const { data: moreFromSeller } = useQuery({
    queryKey: ['seller-listings', listing?.seller_id],
    queryFn: () => fetchListingsBySeller(listing!.seller_id, listing!.id),
    enabled: !!listing?.seller_id,
  });

  const isOwner = listing && user && listing.seller_id === user.id;
  const leavingDays = listing?.pickup_before ? daysUntil(listing.pickup_before) : null;

  const chatMutation = useMutation({
    mutationFn: async () => {
      const convId = await findOrCreateConversation(listing!.id);
      navigate(`/chats/${convId}`);
    },
    onSuccess: () => {},
    onError: () => show('Could not start chat. Try again.', 'error'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateListingStatus(id!, status),
    onSuccess: () => {
      show('Listing updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: () => show('Could not update the listing.', 'error'),
  });
  const renewMutation = useMutation({
    mutationFn: () => renewListing(id!),
    onSuccess: () => {
      show('Listing renewed', 'success');
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: () => show('Could not renew the listing.', 'error'),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(id!),
    onSuccess: () => {
      show('Listing deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      navigate('/my-listings', { replace: true });
    },
    onError: () => show('Could not delete the listing.', 'error'),
  });

  if (isLoading) return <ListingDetailSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!listing) return <EmptyState title="Listing not found" description="This item may have been removed." />;

  const images = (listing.image_urls ?? []).filter(u => !failedImgs.includes(u));
  const markFailed = (u: string) => setFailedImgs(f => (f.includes(u) ? f : [...f, u]));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200 mb-3">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-100 dark:bg-ink-800 mb-3">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={listing.title} className="w-full h-full object-cover" onError={() => markFailed(images[activeImage])} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-300">
                <AlertCircle className="w-12 h-12" />
              </div>
            )}
            {listing.status !== 'available' && (
              <div className="absolute top-3 left-3">
                <StatusBadge status={listing.status} size="md" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                    activeImage === i ? 'border-brand-500' : 'border-transparent'
                  )}
                >
                  <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" onError={() => markFailed(url)} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            {listing.category && (
              <Link to={`/search?category=${listing.category.slug}`}>
                <Badge variant="brand" className="mb-2">{listing.category.name}</Badge>
              </Link>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-ink-50 mb-2">{listing.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <PriceTag price={listing.price_inr} negotiable={listing.is_negotiable} size="lg" />
              <ConditionBadge condition={listing.condition} />
            </div>
          </div>

          {leavingDays != null && leavingDays >= 0 && (
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
              leavingDays <= 7 ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
            )}>
              <Calendar className="w-4 h-4" />
              {leavingDays <= 7 ? `Pickup by ${formatPickupDate(listing.pickup_before)} — leaving in ${leavingDays} days!` : `Pickup by ${formatPickupDate(listing.pickup_before)}`}
            </div>
          )}

          {/* Description */}
          <div className="bg-white dark:bg-ink-900 rounded-xl p-4">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-2">Description</h3>
            <p className="text-sm text-ink-600 dark:text-ink-300 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Details table */}
          <div className="bg-white dark:bg-ink-900 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-ink-800 dark:text-ink-100 mb-2">Details</h3>
            {formatAge(listing.age_months) && <DetailRow icon={<Clock className="w-4 h-4" />} label="Age" value={formatAge(listing.age_months)!.replace(' old', '')} />}
            {listing.category && <DetailRow icon={<Share2 className="w-4 h-4" />} label="Used for" value={listing.category.name} />}
            {listing.hostel && <DetailRow icon={<MapPin className="w-4 h-4" />} label="Pickup from" value={listing.hostel} />}
            <DetailRow icon={<Clock className="w-4 h-4" />} label="Posted" value={formatRelativeTime(listing.created_at)} />
            {listing.pickup_before && <DetailRow icon={<Calendar className="w-4 h-4" />} label="Pickup by" value={formatPickupDate(listing.pickup_before)} />}
          </div>

          {/* Seller card */}
          {listing.seller && (
            <div className="bg-white dark:bg-ink-900 rounded-xl p-4 flex items-center gap-3">
              <Avatar name={listing.seller.full_name} src={listing.seller.avatar_url} size="lg" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-800 dark:text-ink-100">{listing.seller.full_name}</p>
                <p className="text-sm text-ink-400 flex items-center gap-1">
                  {listing.seller.is_senior && <Badge variant="accent" size="sm">Senior</Badge>}
                  {listing.seller.hostel && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{listing.seller.hostel}</span>}
                </p>
              </div>
            </div>
          )}

          {/* Owner actions */}
          {isOwner ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Link to={`/sell/${listing.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full"><Edit className="w-4 h-4" /> Edit</Button>
                </Link>
                <Button variant="outline" onClick={() => setMenuOpen(true)}><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => chatMutation.mutate()}
                loading={chatMutation.isPending}
                disabled={listing.status !== 'available'}
              >
                <MessageCircle className="w-5 h-5" /> Chat with seller
              </Button>
              <div className="bg-white dark:bg-ink-900 rounded-xl shadow-card flex items-center px-2">
                <FavoriteButton listingId={listing.id} size="lg" />
              </div>
              <button
                onClick={() => setReportOpen(true)}
                className="bg-white dark:bg-ink-900 rounded-xl shadow-card flex items-center justify-center w-12 h-12 text-ink-400 hover:text-error-500"
                aria-label="Report listing"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* More from seller */}
      {moreFromSeller && moreFromSeller.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-800 dark:text-ink-100 mb-3">More from this seller</h2>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
            {moreFromSeller.slice(0, 6).map(l => (
              <div key={l.id} className="min-w-[160px] max-w-[180px]">
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Owner action dialog */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title="Manage listing">
        <div className="space-y-2">
          <ActionButton icon={<CheckCircle className="w-5 h-5 text-success-500" />} label="Mark as reserved" onClick={() => { statusMutation.mutate('reserved'); setMenuOpen(false); }} />
          <ActionButton icon={<XCircle className="w-5 h-5 text-error-500" />} label="Mark as sold" onClick={() => { statusMutation.mutate('sold'); setMenuOpen(false); }} />
          <ActionButton icon={<RotateCcw className="w-5 h-5 text-brand-500" />} label="Renew listing" onClick={() => { renewMutation.mutate(); setMenuOpen(false); }} />
          <ActionButton icon={<Trash2 className="w-5 h-5 text-error-500" />} label="Delete listing" onClick={() => { setMenuOpen(false); if (window.confirm('Delete this listing permanently?')) deleteMutation.mutate(); }} danger />
        </div>
      </Dialog>

      {/* Report dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} title="Report listing">
        <ReportForm listingId={listing.id} onClose={() => setReportOpen(false)} onSubmitted={() => show('Report submitted. Thank you.', 'success')} />
      </Dialog>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-ink-400">{icon} {label}</span>
      <span className="font-medium text-ink-700 dark:text-ink-200">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
        danger ? 'text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20' : 'text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-800'
      )}
    >
      {icon} {label}
    </button>
  );
}

function ReportForm({ listingId, onClose, onSubmitted }: { listingId: string; onClose: () => void; onSubmitted: () => void }) {
  const reasons = [
    { value: 'prohibited_item', label: 'Prohibited item' },
    { value: 'scam', label: 'Scam or fraud' },
    { value: 'wrong_info', label: 'Misleading information' },
    { value: 'duplicate', label: 'Duplicate listing' },
    { value: 'other', label: 'Other' },
  ];
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    try {
      await submitListingReport({ listingId, reason, details });
      onClose();
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Reason</label>
        <div className="space-y-2">
          {reasons.map(r => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={e => setReason(e.target.value)} className="text-brand-600 focus:ring-brand-400" />
              <span className="text-sm text-ink-700 dark:text-ink-200">{r.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">Details (optional)</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full px-3.5 py-2.5 rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Add more details..."
        />
      </div>
      {error && <p className="text-xs text-error-500">{error}</p>}
      <Button type="submit" className="w-full" loading={loading} disabled={!reason}>Submit report</Button>
    </form>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <Skeleton className="w-16 h-16 rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
