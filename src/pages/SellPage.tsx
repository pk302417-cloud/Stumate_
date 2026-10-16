import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import { Camera, X, ChevronLeft, AlertCircle, Check } from 'lucide-react';
import {
  fetchCategories, fetchListingById, createListing, updateListing,
  uploadListingImage, deleteListingImage, setListingImageOrder, deleteListing,
} from '@/api';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { config } from '@/config';
import { ageToMonths, monthsToAgeInput, cn, type AgeUnit } from '@/lib/format';

type Condition = 'like_new' | 'good' | 'okay';

interface Photo {
  key: string;
  url: string;
  file?: File;       // new photo, not uploaded yet
  imageId?: string;  // existing photo already stored
}

const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: 'like_new', label: 'Like new', hint: 'Barely used' },
  { value: 'good', label: 'Good', hint: 'Works well, minor wear' },
  { value: 'okay', label: 'Okay', hint: 'Visible wear, still usable' },
];

export function SellPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { show } = useToast();
  const { account } = useAuth();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 300000 });
  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id!),
    enabled: isEdit,
  });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(true);
  const [condition, setCondition] = useState<Condition>('good');
  const [ageValue, setAgeValue] = useState('');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>('months');
  const [description, setDescription] = useState('');
  const [hostel, setHostel] = useState(account?.hostel ?? '');
  const [pickupBefore, setPickupBefore] = useState('');
  const loaded = useRef(false);

  useEffect(() => {
    if (!isEdit || !existing || loaded.current) return;
    loaded.current = true;
    setTitle(existing.title);
    setCategoryId(existing.category_id);
    setPrice(String(existing.price_inr));
    setNegotiable(existing.is_negotiable);
    setCondition(existing.condition);
    const age = monthsToAgeInput(existing.age_months);
    setAgeValue(age.value);
    setAgeUnit(age.unit);
    setDescription(existing.description);
    setHostel(existing.hostel);
    setPickupBefore(existing.pickup_before?.slice(0, 10) ?? '');
    const imgs = existing.images ?? [];
    setPhotos(
      imgs.length
        ? imgs.map((im, i) => ({ key: im.id, imageId: im.id, url: existing.image_urls?.[i] ?? '' }))
        : (existing.image_urls ?? []).map((url, i) => ({ key: `u${i}`, url })),
    );
  }, [isEdit, existing]);

  useEffect(() => {
    if (!isEdit && account?.hostel && !hostel) setHostel(account.hostel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.hostel]);

  // Free object URLs we created
  useEffect(() => () => {
    photos.forEach(p => { if (p.file) URL.revokeObjectURL(p.url); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = config.maxImagesPerListing - photos.length;
    const picked = Array.from(files).slice(0, Math.max(room, 0));
    if (files.length > room) show(`You can add up to ${config.maxImagesPerListing} photos.`, 'error');
    setProcessing(true);
    try {
      const added: Photo[] = [];
      for (const f of picked) {
        if (!f.type.startsWith('image/')) { show(`${f.name} is not an image.`, 'error'); continue; }
        try {
          const small = await imageCompression(f, {
            maxSizeMB: config.targetCompressedSize / (1024 * 1024),
            maxWidthOrHeight: config.maxImageDimension,
            useWebWorker: true,
            fileType: 'image/webp',
          });
          const file = new File([small], `${crypto.randomUUID()}.webp`, { type: small.type || 'image/webp' });
          added.push({ key: crypto.randomUUID(), url: URL.createObjectURL(file), file });
        } catch {
          show(`Could not read ${f.name}.`, 'error');
        }
      }
      setPhotos(p => [...p, ...added]);
    } finally {
      setProcessing(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removePhoto = (p: Photo) => {
    setPhotos(list => list.filter(x => x.key !== p.key));
    if (p.imageId) setRemovedIds(r => [...r, p.imageId!]);
    if (p.file) URL.revokeObjectURL(p.url);
  };

  const priceNum = price === '' ? NaN : Number(price);
  const ageNum = ageValue === '' ? NaN : Number(ageValue);

  const problems = useMemo(() => {
    const out: string[] = [];
    if (photos.length === 0) out.push('Add at least one real photo of the item');
    if (title.trim().length < 3) out.push('Enter the product name');
    if (!categoryId) out.push('Choose what it is used for');
    if (!Number.isInteger(priceNum) || priceNum < 0 || priceNum > 10000000) out.push('Enter a valid price in ₹ (0 for free)');
    if (!Number.isFinite(ageNum) || ageNum < 0) out.push('Enter how old the item is');
    return out;
  }, [photos.length, title, categoryId, priceNum, ageNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (problems.length > 0) {
      show(problems[0], 'error');
      return;
    }
    setSubmitting(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      price_inr: priceNum,
      condition,
      category_id: categoryId,
      hostel: hostel.trim(),
      is_negotiable: negotiable,
      pickup_before: pickupBefore || null,
      age_months: ageToMonths(ageNum, ageUnit),
    };
    try {
      if (isEdit && id) {
        await updateListing(id, payload);
        for (const imgId of removedIds) await deleteListingImage(imgId).catch(() => undefined);
        let failed = 0;
        for (let i = 0; i < photos.length; i++) {
          const p = photos[i];
          if (p.file) {
            try { await uploadListingImage(id, p.file, i); } catch { failed++; }
          } else if (p.imageId) {
            await setListingImageOrder(p.imageId, i).catch(() => undefined);
          }
        }
        if (failed) show(`${failed} photo(s) could not be uploaded.`, 'error');
        await queryClient.invalidateQueries({ queryKey: ['listing', id] });
        await queryClient.invalidateQueries({ queryKey: ['listings'] });
        show('Changes saved', 'success');
        navigate('/my-listings');
        return;
      }

      const created = await createListing({
        ...payload,
        image_urls: config.useMocks ? photos.map(p => p.url) : undefined,
      });
      let ok = 0;
      if (!config.useMocks) {
        for (let i = 0; i < photos.length; i++) {
          try { await uploadListingImage(created.id, photos[i].file!, i); ok++; } catch { /* counted below */ }
        }
        if (ok === 0) {
          await deleteListing(created.id).catch(() => undefined);
          throw new Error('Your photos could not be uploaded. Please check your connection and try again.');
        }
        if (ok < photos.length) show(`${photos.length - ok} photo(s) could not be uploaded.`, 'error');
      }
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      show('Your item is now listed! 🎉', 'success');
      navigate('/my-listings');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not list your item. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && loadingExisting) {
    return <div className="max-w-2xl mx-auto px-4 py-10 text-ink-500">Loading…</div>;
  }

  const err = (cond: boolean) => submitted && cond;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-3">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50 mb-1">{isEdit ? 'Edit your listing' : 'Sell an item'}</h1>
      <p className="text-sm text-ink-500 mb-5">Add real photos and honest details — buyers on your campus will see this.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos */}
        <section className="bg-white dark:bg-ink-900 rounded-2xl shadow-soft p-4 space-y-3">
          <h2 className="font-semibold text-ink-800 dark:text-ink-100">1. Photos <span className="text-error-500">*</span></h2>
          <p className="text-xs text-ink-500">Take photos of the actual item (up to {config.maxImagesPerListing}). The first photo is the cover.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((p, i) => (
              <div key={p.key} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100">
                <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded">Cover</span>}
                <button
                  type="button"
                  onClick={() => removePhoto(p)}
                  aria-label="Remove photo"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {photos.length < config.maxImagesPerListing && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={processing}
                className={cn(
                  'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-50',
                  err(photos.length === 0) ? 'border-error-400' : 'border-ink-300 dark:border-ink-700',
                )}
              >
                <Camera className="w-6 h-6" />
                {processing ? 'Preparing…' : 'Add photo'}
              </button>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => void addFiles(e.target.files)}
          />
          {err(photos.length === 0) && <p className="text-xs text-error-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> At least one photo is required.</p>}
        </section>

        {/* Basics */}
        <section className="bg-white dark:bg-ink-900 rounded-2xl shadow-soft p-4 space-y-4">
          <h2 className="font-semibold text-ink-800 dark:text-ink-100">2. About the item</h2>
          <Input
            label="Product name *"
            placeholder="e.g. Study table with drawer"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            error={err(title.trim().length < 3) ? 'Enter at least 3 characters' : undefined}
          />

          <div>
            <p className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">What is it used for? <span className="text-error-500">*</span></p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories?.map(c => {
                const on = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    aria-pressed={on}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors',
                      on
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800',
                    )}
                  >
                    <CategoryIcon slug={c.slug} className="w-5 h-5" />
                    <span className="text-center leading-tight">{c.name}</span>
                  </button>
                );
              })}
            </div>
            {err(!categoryId) && <p className="text-xs text-error-500 mt-1">Please choose a category.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Price (₹) *"
              inputMode="numeric"
              placeholder="500"
              value={price}
              onChange={e => setPrice(e.target.value.replace(/\D/g, '').slice(0, 8))}
              error={err(!Number.isInteger(priceNum)) ? 'Enter a price' : undefined}
              hint="Enter 0 to give it away free"
            />
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-ink-700 dark:text-ink-200">How old is it? *</span>
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  placeholder="6"
                  value={ageValue}
                  onChange={e => setAgeValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={cn(
                    'w-20 h-11 px-3 rounded-xl border bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-400',
                    err(!Number.isFinite(ageNum)) ? 'border-error-400' : 'border-ink-300 dark:border-ink-700',
                  )}
                  aria-label="Age"
                />
                <div className="flex-1 min-w-0">
                  <Select aria-label="Age unit" value={ageUnit} onChange={e => setAgeUnit(e.target.value as AgeUnit)}>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </Select>
                </div>
              </div>
              {err(!Number.isFinite(ageNum)) && <p className="text-xs text-error-500">Enter the age</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={negotiable} onChange={e => setNegotiable(e.target.checked)} className="w-5 h-5 rounded border-ink-300 text-brand-600 focus:ring-brand-400" />
            <span className="text-sm text-ink-700 dark:text-ink-200">Price is negotiable</span>
          </label>

          <div>
            <p className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-2">Condition</p>
            <div className="grid grid-cols-3 gap-2">
              {CONDITIONS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  aria-pressed={condition === c.value}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-colors',
                    condition === c.value ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800',
                  )}
                >
                  <span className="block text-sm font-medium text-ink-800 dark:text-ink-100">{c.label}</span>
                  <span className="block text-[11px] text-ink-500">{c.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Extra */}
        <section className="bg-white dark:bg-ink-900 rounded-2xl shadow-soft p-4 space-y-4">
          <h2 className="font-semibold text-ink-800 dark:text-ink-100">3. More details <span className="text-xs font-normal text-ink-400">(optional)</span></h2>
          <Textarea
            label="Description"
            rows={4}
            maxLength={2000}
            placeholder="Brand, size, why you're selling, anything buyers should know…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input label="Pickup location (hostel / block)" value={hostel} onChange={e => setHostel(e.target.value)} maxLength={80} placeholder="e.g. C-Block Hostel" />
          <Input
            label="Available for pickup until"
            type="date"
            value={pickupBefore}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setPickupBefore(e.target.value)}
            hint="Leaving campus soon? Set the last date buyers can collect it."
          />
        </section>

        {submitted && problems.length > 0 && (
          <ul className="text-sm text-error-500 space-y-1">
            {problems.map(p => <li key={p} className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> {p}</li>)}
          </ul>
        )}

        <div className="flex gap-3 pb-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
          <Button type="submit" size="lg" className="flex-1" loading={submitting} disabled={processing}>
            <Check className="w-4 h-4" /> {isEdit ? 'Save changes' : 'List my item'}
          </Button>
        </div>
      </form>
    </div>
  );
}
