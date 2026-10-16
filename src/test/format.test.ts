import { describe, it, expect } from 'vitest';
import {
  formatPrice, formatPriceShort, formatRelativeTime, formatPickupDate,
  daysUntil, isLeavingSoon, conditionLabel, statusLabel, cn,
} from '@/lib/format';

describe('formatPrice', () => {
  it('formats small numbers correctly', () => {
    expect(formatPrice(0)).toBe('₹0');
    expect(formatPrice(99)).toBe('₹99');
    expect(formatPrice(500)).toBe('₹500');
  });

  it('formats thousands with Indian grouping', () => {
    expect(formatPrice(1500)).toBe('₹1,500');
    expect(formatPrice(100000)).toBe('₹1,00,000');
  });
});

describe('formatPriceShort', () => {
  it('formats under 1000 as-is', () => {
    expect(formatPriceShort(500)).toBe('₹500');
  });

  it('formats thousands with K', () => {
    expect(formatPriceShort(1500)).toBe('₹2K');
    expect(formatPriceShort(999)).toBe('₹999');
  });

  it('formats lakhs with L', () => {
    expect(formatPriceShort(100000)).toBe('₹1.0L');
  });
});

describe('formatRelativeTime', () => {
  it('returns "just now" for recent', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(d)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const d = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(formatRelativeTime(d)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const d = new Date(Date.now() - 4 * 86400000).toISOString();
    expect(formatRelativeTime(d)).toBe('4d ago');
  });
});

describe('formatPickupDate', () => {
  it('returns Flexible for null', () => {
    expect(formatPickupDate(null)).toBe('Flexible');
  });

  it('formats date string', () => {
    expect(formatPickupDate('2026-01-15')).toMatch(/15 Jan 2026/);
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil(new Date().toISOString())).toBe(0);
  });

  it('returns positive for future', () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    expect(daysUntil(future)).toBe(3);
  });

  it('returns negative for past', () => {
    const past = new Date(Date.now() - 5 * 86400000).toISOString();
    expect(daysUntil(past)).toBe(-5);
  });
});

describe('isLeavingSoon', () => {
  it('returns false for null', () => {
    expect(isLeavingSoon(null)).toBe(false);
  });

  it('returns true within 7 days', () => {
    const soon = new Date(Date.now() + 5 * 86400000).toISOString();
    expect(isLeavingSoon(soon)).toBe(true);
  });

  it('returns false beyond 7 days', () => {
    const far = new Date(Date.now() + 20 * 86400000).toISOString();
    expect(isLeavingSoon(far)).toBe(false);
  });
});

describe('conditionLabel', () => {
  it('maps known conditions', () => {
    expect(conditionLabel('like_new')).toBe('Like New');
    expect(conditionLabel('good')).toBe('Good');
    expect(conditionLabel('okay')).toBe('Okay');
  });

  it('returns unknown as-is', () => {
    expect(conditionLabel('unknown')).toBe('unknown');
  });
});

describe('statusLabel', () => {
  it('maps known statuses', () => {
    expect(statusLabel('available')).toBe('Available');
    expect(statusLabel('sold')).toBe('Sold');
    expect(statusLabel('reserved')).toBe('Reserved');
  });

  it('returns unknown as-is', () => {
    expect(statusLabel('deleted')).toBe('deleted');
  });
});

describe('cn', () => {
  it('joins truthy strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('returns empty for all falsy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });
});

import { ageToMonths, monthsToAgeInput, formatAge, formatAgeShort, normalizeMobile, isValidMobile, formatLocation } from '@/lib/format';
import { describe as d2, it as i2, expect as e2 } from 'vitest';

d2('age helpers', () => {
  i2('converts to months', () => {
    e2(ageToMonths(2, 'years')).toBe(24);
    e2(ageToMonths(7, 'months')).toBe(7);
    e2(ageToMonths(-1, 'months')).toBe(0);
    e2(ageToMonths(100, 'years')).toBe(600);
  });
  i2('round-trips for the edit form', () => {
    e2(monthsToAgeInput(24)).toEqual({ value: '2', unit: 'years' });
    e2(monthsToAgeInput(18)).toEqual({ value: '18', unit: 'months' });
    e2(monthsToAgeInput(null)).toEqual({ value: '', unit: 'months' });
  });
  i2('formats age', () => {
    e2(formatAge(6)).toBe('6 months old');
    e2(formatAge(15)).toBe('1 yr 3 mo old');
    e2(formatAgeShort(0)).toBe('New');
    e2(formatAgeShort(12)).toBe('1 yr');
    e2(formatAge(null)).toBeNull();
  });
});

d2('mobile + location helpers', () => {
  i2('normalizes Indian numbers', () => {
    e2(normalizeMobile('98765 43210')).toBe('+919876543210');
    e2(normalizeMobile('09876543210')).toBe('+919876543210');
  });
  i2('validates', () => {
    e2(isValidMobile('9876543210')).toBe(true);
    e2(isValidMobile('12345')).toBe(false);
  });
  i2('formats location', () => {
    e2(formatLocation('Mumbai', 'Maharashtra')).toBe('Mumbai, Maharashtra');
    e2(formatLocation(null, 'Goa')).toBe('Goa');
  });
});
