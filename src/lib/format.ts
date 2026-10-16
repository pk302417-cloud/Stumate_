const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

export function formatPrice(rupees: number): string {
  return `₹${INR_FORMATTER.format(rupees)}`;
}

export function formatPriceShort(rupees: number): string {
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(0)}K`;
  return `₹${rupees}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatPickupDate(dateStr: string | null): string {
  if (!dateStr) return 'Flexible';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - now.getTime()) / 86400000);
}

export function isLeavingSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return daysUntil(dateStr) <= 7;
}

export function conditionLabel(condition: string): string {
  const map: Record<string, string> = {
    like_new: 'Like New',
    good: 'Good',
    okay: 'Okay',
  };
  return map[condition] ?? condition;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    removed: 'Removed',
    expired: 'Expired',
  };
  return map[status] ?? status;
}

export function categoryIconName(slug: string): string {
  const map: Record<string, string> = {
    furniture: 'Armchair',
    books: 'BookOpen',
    electronics: 'Laptop',
    appliances: 'Refrigerator',
    bedding: 'BedDouble',
    kitchen: 'CookingPot',
    'home-decor': 'Lamp',
    stationery: 'PenTool',
    'lab-engineering': 'Ruler',
    'sports-fitness': 'Dumbbell',
    cycles: 'Bike',
    other: 'Package',
  };
  return map[slug] ?? 'Package';
}

export type AgeUnit = 'months' | 'years';

/** Turns "2 years" or "7 months" into a number of months (0–600). */
export function ageToMonths(value: number, unit: AgeUnit): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  const months = unit === 'years' ? value * 12 : value;
  return Math.min(600, Math.round(months));
}

/** The reverse of ageToMonths, for filling the edit form. */
export function monthsToAgeInput(months: number | null | undefined): { value: string; unit: AgeUnit } {
  if (months == null) return { value: '', unit: 'months' };
  if (months > 0 && months % 12 === 0) return { value: String(months / 12), unit: 'years' };
  return { value: String(months), unit: 'months' };
}

/** "6 months old", "1 year old", "1 yr 3 mo old". Returns null when unknown. */
export function formatAge(months: number | null | undefined): string | null {
  if (months == null) return null;
  if (months <= 0) return 'Less than a month old';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} month${rem === 1 ? '' : 's'} old`;
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'} old`;
  return `${years} yr ${rem} mo old`;
}

/** Short form for cards: "6 mo", "1 yr", "1 yr 3 mo", "New". */
export function formatAgeShort(months: number | null | undefined): string | null {
  if (months == null) return null;
  if (months <= 0) return 'New';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}

/** Cleans a phone number typed by a student. 10 digits are treated as Indian (+91). */
export function normalizeMobile(input: string): string {
  const cleaned = input.replace(/[\s\-()]/g, '');
  if (/^[6-9][0-9]{9}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^0[6-9][0-9]{9}$/.test(cleaned)) return `+91${cleaned.slice(1)}`;
  return cleaned;
}

export function isValidMobile(input: string): boolean {
  return /^\+?[0-9]{10,15}$/.test(normalizeMobile(input));
}

export function formatLocation(city?: string | null, state?: string | null): string {
  return [city, state].filter(Boolean).join(', ');
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
