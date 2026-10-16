import { config } from '@/config';
import { supabase } from '@/lib/supabase';
import {
  mockCategories, mockListings, mockConversations, mockMessages, mockProfile, mockColleges,
} from './mockData';
import type {
  Listing, ListingImage, Category, Conversation, Message, Profile, PublicProfile, AdminStats, Report,
  DataRequest, UserReport, CollegeOption, SignupCheck, MyAccount, OnboardingInput,
} from '@/types/database';
import { mockAdminStats, mockReports, mockUserReports, mockDataRequests, mockAdminUsers } from './adminMockData';
import { normalizeMobile } from '@/lib/format';

const useMocks = config.useMocks;

// ============ Helpers ============

/** The year it is right now in India (used to decide who is a "senior"). */
function currentYearIST(): number {
  return Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date()));
}

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Please sign in again.');
  return data.user.id;
}

/** Turns a Supabase / network error into a message a student can understand. */
export function friendlyAuthError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const message = (err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : '').toLowerCase();
  const status = typeof err === 'object' && err && 'status' in err ? Number((err as { status: unknown }).status) : 0;
  if (status === 429 || message.includes('rate limit') || message.includes('only request this after')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (message.includes('signups not allowed')) return 'No account found for this email. Please sign up first.';
  if (message.includes('database error saving new user')) {
    return 'We could not create your account. Please check your college and email and try again.';
  }
  if (message.includes('invalid') && message.includes('email')) return 'Please enter a valid email address.';
  if (message.includes('expired') || message.includes('invalid')) {
    return 'That code is incorrect or has expired. Request a new one.';
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'No internet connection. Please check your network and try again.';
  }
  return fallback;
}

/** Messages raised by our own database functions are already written for students. */
function dbMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const m = String((err as { message: unknown }).message);
    if (m && !m.toLowerCase().includes('permission denied') && !m.toLowerCase().includes('violates') && m.length < 140) return m;
  }
  return fallback;
}

// ============ Mock session (only used when VITE_USE_MOCKS=true) ============

export const MOCK_SESSION_KEY = 'stumate_mock_session';
export const MOCK_ACCOUNT_KEY = 'stumate_mock_account';

function mockAccountBlank(email: string, collegeId?: string): MyAccount {
  const college = mockColleges.find(c => c.id === collegeId) ?? mockColleges[0];
  return {
    id: 'user1', email, college_id: college.id, college_name: college.name, college_city: college.city,
    college_state: college.state, college_verified: false, full_name: null, avatar_url: null, hostel: null,
    graduation_year: null, whatsapp: null, department: null, course: null, semester: null, role: 'student',
    is_banned: false, consented_at: null, terms_version: null, age_confirmed_18: false, onboarded_at: null,
    is_senior: false, current_terms_version: '1.0', needs_reconsent: true,
  };
}

export function readMockAccount(): MyAccount | null {
  try {
    const raw = localStorage.getItem(MOCK_ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as MyAccount) : null;
  } catch {
    return null;
  }
}

function mockStartSession(email: string, collegeId?: string): void {
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ id: 'user1', email }));
  if (!readMockAccount()) {
    localStorage.setItem(MOCK_ACCOUNT_KEY, JSON.stringify(mockAccountBlank(email, collegeId)));
  }
}

// ============ Sign up / sign in (email code) ============

export async function searchColleges(query: string, limit = 25): Promise<CollegeOption[]> {
  if (useMocks) {
    await delay(150);
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return mockColleges
      .filter(c => tokens.every(t => `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(t)))
      .slice(0, limit);
  }
  const { data, error } = await supabase.rpc('search_colleges', { p_query: query, p_limit: limit });
  if (error) throw error;
  return (data ?? []) as CollegeOption[];
}

export async function checkSignupEmail(email: string, collegeId: string): Promise<SignupCheck> {
  if (useMocks) {
    await delay(150);
    const college = mockColleges.find(c => c.id === collegeId);
    if (!college) return { ok: false, reason: 'college_not_found', domains: [] };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, reason: 'invalid_email', domains: [] };
    if (college.email_domains.length > 0 && !college.email_domains.some(d => email.toLowerCase().endsWith(`@${d}`))) {
      return { ok: false, reason: 'domain_mismatch', domains: college.email_domains };
    }
    return { ok: true, reason: null, domains: college.email_domains, verified: college.email_domains.length > 0 };
  }
  const { data, error } = await supabase.rpc('check_signup_email', { p_email: email, p_college_id: collegeId });
  if (error) throw error;
  return data as SignupCheck;
}

export async function requestCollege(input: { name: string; city?: string; state?: string; email?: string }): Promise<void> {
  if (useMocks) {
    await delay(300);
    return;
  }
  const { error } = await supabase.rpc('request_college', {
    p_name: input.name,
    p_city: input.city || null,
    p_state: input.state || null,
    p_contact_email: input.email || null,
  });
  if (error) throw new Error(dbMessage(error, 'Could not send your request. Please try again.'));
}

/** Sends a one-time code to the student's email. */
export async function sendLoginCode(email: string, opts: { createUser: boolean; collegeId?: string }): Promise<void> {
  if (useMocks) {
    await delay(400);
    return;
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: opts.createUser,
      ...(opts.collegeId ? { data: { college_id: opts.collegeId } } : {}),
    },
  });
  if (error) throw new Error(friendlyAuthError(error, 'Could not send the code. Please try again.'));
}

export async function verifyLoginCode(email: string, token: string, collegeId?: string): Promise<void> {
  if (useMocks) {
    await delay(300);
    mockStartSession(email, collegeId);
    return;
  }
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error(friendlyAuthError(error, 'Could not verify the code. Please try again.'));
}

// ============ Account / profile ============

export function accountToProfile(a: MyAccount): Profile {
  return {
    id: a.id,
    college_id: a.college_id,
    full_name: a.full_name ?? '',
    avatar_url: a.avatar_url,
    hostel: a.hostel,
    graduation_year: a.graduation_year ?? currentYearIST(),
    whatsapp: a.whatsapp,
    role: a.role,
    is_banned: a.is_banned,
    banned_at: null,
    consented_at: a.consented_at,
    terms_version: a.terms_version,
    age_confirmed_18: a.age_confirmed_18,
    onboarded_at: a.onboarded_at,
    department: a.department,
    course: a.course,
    semester: a.semester,
    college_verified: a.college_verified,
    email: a.email,
    college_name: a.college_name,
    college_city: a.college_city,
    college_state: a.college_state,
    is_senior: a.is_senior,
  };
}

/** The signed-in student's own account (null if nobody is signed in). */
export async function fetchMyAccount(): Promise<MyAccount | null> {
  if (useMocks) {
    await delay(100);
    return readMockAccount();
  }
  const { data, error } = await supabase.rpc('get_my_account');
  if (error) throw error;
  return (data as MyAccount | null) ?? null;
}

export async function completeOnboarding(input: OnboardingInput, termsVersion: string): Promise<void> {
  const mobile = normalizeMobile(input.mobile);
  if (useMocks) {
    await delay(600);
    const acct = readMockAccount();
    if (!acct) throw new Error('Please sign in again.');
    const updated: MyAccount = {
      ...acct,
      full_name: input.full_name.trim(),
      whatsapp: mobile,
      course: input.course,
      department: input.department,
      semester: input.semester,
      graduation_year: input.graduation_year,
      hostel: input.hostel.trim() || null,
      is_senior: input.graduation_year <= currentYearIST(),
      consented_at: new Date().toISOString(),
      terms_version: termsVersion,
      age_confirmed_18: true,
      onboarded_at: new Date().toISOString(),
      needs_reconsent: false,
    };
    localStorage.setItem(MOCK_ACCOUNT_KEY, JSON.stringify(updated));
    return;
  }
  const { error } = await supabase.rpc('complete_onboarding', {
    p_full_name: input.full_name.trim(),
    p_hostel: input.hostel.trim() || null,
    p_graduation_year: input.graduation_year,
    p_whatsapp: mobile,
    p_terms_version: termsVersion,
    p_terms_agreed: input.consents.terms,
    p_age_confirmed: input.consents.age18,
    p_whatsapp_sharing: input.consents.whatsappSharing,
    p_analytics: input.consents.analytics,
    p_marketing: input.consents.marketing,
    p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : null,
    p_department: input.department.trim(),
    p_course: input.course.trim() || null,
    p_semester: input.semester,
  });
  if (error) throw new Error(dbMessage(error, 'Could not save your details. Please try again.'));
}

export async function updateProfile(input: Partial<Profile>): Promise<void> {
  if (useMocks) {
    await delay(400);
    const acct = readMockAccount();
    if (acct) {
      localStorage.setItem(MOCK_ACCOUNT_KEY, JSON.stringify({
        ...acct,
        full_name: input.full_name ?? acct.full_name,
        hostel: input.hostel ?? acct.hostel,
        graduation_year: input.graduation_year ?? acct.graduation_year,
        whatsapp: input.whatsapp ? normalizeMobile(input.whatsapp) : acct.whatsapp,
        department: input.department ?? acct.department,
        course: input.course ?? acct.course,
        semester: input.semester ?? acct.semester,
      }));
    }
    return;
  }
  const { error } = await supabase.rpc('update_my_profile', {
    p_full_name: input.full_name ?? null,
    p_hostel: input.hostel ?? null,
    p_graduation_year: input.graduation_year ?? null,
    p_whatsapp: input.whatsapp ? normalizeMobile(input.whatsapp) : null,
    p_avatar_url: input.avatar_url ?? null,
    p_department: input.department ?? null,
    p_course: input.course ?? null,
    p_semester: input.semester ?? null,
  });
  if (error) throw new Error(dbMessage(error, 'Could not update your profile.'));
}

/** Everything we hold about the signed-in student, as JSON. */
export async function exportMyData(): Promise<unknown> {
  if (useMocks) {
    await delay(300);
    return { account: readMockAccount(), note: 'Demo mode data' };
  }
  const { data, error } = await supabase.rpc('export_my_data');
  if (error) throw new Error(dbMessage(error, 'Could not export your data. Please try again.'));
  return data;
}

/** Permanently deletes the signed-in student's account and listings. */
export async function deleteMyAccount(): Promise<void> {
  if (useMocks) {
    await delay(300);
    return;
  }
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw new Error(dbMessage(error, 'Could not delete your account. Please try again.'));
}

export async function fetchMyProfile(): Promise<Profile> {
  const account = await fetchMyAccount();
  if (!account) throw new Error('Not authenticated');
  return accountToProfile(account);
}

// ============ Categories ============

export async function fetchCategories(): Promise<Category[]> {
  if (useMocks) {
    await delay(150);
    return [...mockCategories].sort((a, b) => a.sort_order - b.sort_order);
  }
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

// ============ Listings ============

interface ListingRow {
  id: string;
  seller_id: string;
  college_id: string;
  category_id: string;
  title: string;
  description: string | null;
  price_inr: number;
  condition: Listing['condition'];
  hostel: string | null;
  status: Listing['status'];
  is_negotiable: boolean;
  pickup_before: string | null;
  age_months: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  category?: Category | null;
  seller?: { id: string; full_name: string | null; avatar_url: string | null; hostel: string | null; graduation_year: number | null } | null;
  images?: ListingImage[] | null;
}

// Only columns the database lets students read (never `select *`).
const LISTING_COLUMNS =
  'id, seller_id, college_id, category_id, title, description, price_inr, condition, hostel, status, is_negotiable, pickup_before, age_months, created_at, updated_at, expires_at';
const LISTING_EMBEDS =
  'category:categories(id, name, slug, sort_order), seller:profiles!listings_seller_id_fkey(id, full_name, avatar_url, hostel, graduation_year), images:listing_images(id, listing_id, storage_path, sort_order)';
const LISTING_SELECT = `${LISTING_COLUMNS}, ${LISTING_EMBEDS}`;

function publicImageUrl(path: string): string {
  return supabase.storage.from(config.listingBucket).getPublicUrl(path).data.publicUrl;
}

function toListing(row: ListingRow): Listing {
  const images = [...(row.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const seller: PublicProfile | undefined = row.seller
    ? {
        id: row.seller.id,
        full_name: row.seller.full_name ?? 'Student',
        avatar_url: row.seller.avatar_url,
        hostel: row.seller.hostel,
        is_senior: row.seller.graduation_year != null && row.seller.graduation_year <= currentYearIST(),
      }
    : undefined;
  return {
    id: row.id,
    seller_id: row.seller_id,
    college_id: row.college_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description ?? '',
    price_inr: row.price_inr,
    condition: row.condition,
    hostel: row.hostel ?? '',
    status: row.status,
    is_negotiable: row.is_negotiable,
    pickup_before: row.pickup_before,
    age_months: row.age_months,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
    category: row.category ?? undefined,
    seller,
    images,
    image_urls: images.map(img => publicImageUrl(img.storage_path)),
  };
}

export interface ListingQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  hostel?: string;
  negotiable?: boolean;
  sort?: 'newest' | 'price_low' | 'price_high' | 'leaving_soon';
  status?: string;
  sellerId?: string;
  page?: number;
  pageSize?: number;
}

/** Removes characters that would break the search filter and splits into words. */
function searchWords(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .replace(/[%,()*\\"'`:;.]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map(w => w.slice(0, 40));
}

export async function fetchListings(query: ListingQuery = {}): Promise<{ items: Listing[]; total: number }> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? config.listingPageSize;
  const start = (page - 1) * pageSize;

  if (useMocks) {
    await delay(250);
    let items = [...mockListings];

    if (query.category) items = items.filter(l => l.category?.slug === query.category);
    const words = searchWords(query.search).map(w => w.toLowerCase());
    if (words.length) {
      items = items.filter(l => {
        const hay = `${l.title} ${l.description} ${l.category?.name ?? ''}`.toLowerCase();
        return words.every(w => hay.includes(w));
      });
    }
    if (query.minPrice != null) items = items.filter(l => l.price_inr >= query.minPrice!);
    if (query.maxPrice != null) items = items.filter(l => l.price_inr <= query.maxPrice!);
    if (query.condition) items = items.filter(l => l.condition === query.condition);
    if (query.hostel) items = items.filter(l => l.hostel === query.hostel);
    if (query.negotiable) items = items.filter(l => l.is_negotiable);
    if (query.sellerId) items = items.filter(l => l.seller_id === query.sellerId);
    if (query.status) items = items.filter(l => l.status === query.status);
    else items = items.filter(l => l.status === 'available');

    switch (query.sort) {
      case 'price_low': items.sort((a, b) => a.price_inr - b.price_inr); break;
      case 'price_high': items.sort((a, b) => b.price_inr - a.price_inr); break;
      case 'leaving_soon': items.sort((a, b) => {
        const aTime = a.pickup_before ? new Date(a.pickup_before).getTime() : Infinity;
        const bTime = b.pickup_before ? new Date(b.pickup_before).getTime() : Infinity;
        return aTime - bTime;
      }); break;
      default: items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const total = items.length;
    return { items: items.slice(start, start + pageSize), total };
  }

  // Filtering by category name needs an inner join so non-matching rows drop out.
  const select = query.category
    ? LISTING_SELECT.replace('category:categories(', 'category:categories!inner(')
    : LISTING_SELECT;

  let q = supabase
    .from('listings')
    .select(select, { count: 'exact' })
    .eq('status', query.status ?? 'available');

  if (query.category) q = q.eq('category.slug', query.category);
  for (const word of searchWords(query.search)) {
    q = q.or(`title.ilike.*${word}*,description.ilike.*${word}*`);
  }
  if (query.minPrice != null) q = q.gte('price_inr', query.minPrice);
  if (query.maxPrice != null) q = q.lte('price_inr', query.maxPrice);
  if (query.condition) q = q.eq('condition', query.condition);
  if (query.hostel) q = q.eq('hostel', query.hostel);
  if (query.negotiable) q = q.eq('is_negotiable', true);
  if (query.sellerId) q = q.eq('seller_id', query.sellerId);

  switch (query.sort) {
    case 'price_low': q = q.order('price_inr', { ascending: true }); break;
    case 'price_high': q = q.order('price_inr', { ascending: false }); break;
    case 'leaving_soon': q = q.order('pickup_before', { ascending: true, nullsFirst: false }); break;
    default: q = q.order('created_at', { ascending: false });
  }
  q = q.range(start, start + pageSize - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  const rows = (data ?? []) as unknown as ListingRow[];
  return { items: rows.map(toListing), total: count ?? 0 };
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (useMocks) {
    await delay(150);
    return mockListings.find(l => l.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toListing(data as unknown as ListingRow) : null;
}

export async function fetchListingsBySeller(sellerId: string, excludeId?: string): Promise<Listing[]> {
  const { items } = await fetchListings({ sellerId, status: 'available', pageSize: 10 });
  return excludeId ? items.filter(l => l.id !== excludeId) : items;
}

export interface ListingInput {
  title: string;
  description: string;
  price_inr: number;
  condition: 'like_new' | 'good' | 'okay';
  category_id: string;
  hostel: string;
  is_negotiable: boolean;
  pickup_before: string | null;
  /** How old the item is, in months. */
  age_months: number;
  /** Only used in demo (mock) mode. */
  image_urls?: string[];
}

export async function createListing(input: ListingInput): Promise<Listing> {
  if (useMocks) {
    await delay(400);
    const acct = readMockAccount();
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      seller_id: 'user1',
      college_id: acct?.college_id ?? 'col1',
      category_id: input.category_id,
      title: input.title,
      description: input.description,
      price_inr: input.price_inr,
      condition: input.condition,
      hostel: input.hostel,
      is_negotiable: input.is_negotiable,
      pickup_before: input.pickup_before,
      age_months: input.age_months,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      category: mockCategories.find(c => c.id === input.category_id),
      seller: { id: 'user1', full_name: acct?.full_name ?? 'You', avatar_url: null, hostel: input.hostel, is_senior: acct?.is_senior ?? false },
      image_urls: input.image_urls ?? [],
    };
    mockListings.unshift(newListing);
    return newListing;
  }

  // seller_id and college_id are filled in by the database itself.
  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      price_inr: input.price_inr,
      condition: input.condition,
      category_id: input.category_id,
      hostel: input.hostel.trim() || null,
      is_negotiable: input.is_negotiable,
      pickup_before: input.pickup_before,
      age_months: input.age_months,
    })
    .select(LISTING_COLUMNS)
    .single();
  if (error) throw new Error(dbMessage(error, 'Could not create your listing. Please try again.'));
  return toListing(data as unknown as ListingRow);
}

export async function updateListing(id: string, input: Partial<ListingInput>): Promise<void> {
  if (useMocks) {
    await delay(400);
    const idx = mockListings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Listing not found');
    const { image_urls, ...rest } = input;
    mockListings[idx] = {
      ...mockListings[idx],
      ...rest,
      image_urls: image_urls ?? mockListings[idx].image_urls,
      category: input.category_id ? mockCategories.find(c => c.id === input.category_id) : mockListings[idx].category,
      updated_at: new Date().toISOString(),
    };
    return;
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.price_inr !== undefined) patch.price_inr = input.price_inr;
  if (input.condition !== undefined) patch.condition = input.condition;
  if (input.category_id !== undefined) patch.category_id = input.category_id;
  if (input.hostel !== undefined) patch.hostel = input.hostel.trim() || null;
  if (input.is_negotiable !== undefined) patch.is_negotiable = input.is_negotiable;
  if (input.pickup_before !== undefined) patch.pickup_before = input.pickup_before;
  if (input.age_months !== undefined) patch.age_months = input.age_months;

  const { error } = await supabase.from('listings').update(patch).eq('id', id);
  if (error) throw new Error(dbMessage(error, 'Could not save your changes. Please try again.'));
}

export async function updateListingStatus(id: string, status: string): Promise<void> {
  if (useMocks) {
    await delay(250);
    const idx = mockListings.findIndex(l => l.id === id);
    if (idx !== -1) mockListings[idx].status = status as Listing['status'];
    return;
  }
  const { error } = await supabase.from('listings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function renewListing(id: string): Promise<void> {
  if (useMocks) {
    await delay(250);
    const idx = mockListings.findIndex(l => l.id === id);
    if (idx !== -1) {
      mockListings[idx].expires_at = new Date(Date.now() + 60 * 86400000).toISOString();
      if (mockListings[idx].status === 'expired') mockListings[idx].status = 'available';
    }
    return;
  }
  const { error } = await supabase.rpc('renew_listing', { p_listing_id: id });
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  if (useMocks) {
    await delay(250);
    const idx = mockListings.findIndex(l => l.id === id);
    if (idx !== -1) mockListings[idx].status = 'removed';
    return;
  }
  // "removed" listings are cleaned up automatically after 30 days.
  const { error } = await supabase.from('listings').update({ status: 'removed' }).eq('id', id);
  if (error) throw error;
}

export async function submitListingReport(input: { listingId: string; reason: string; details: string }): Promise<void> {
  if (useMocks) {
    await delay(400);
    return;
  }
  const { error } = await supabase.from('reports').insert({
    listing_id: input.listingId,
    reason: input.reason,
    details: input.details.trim() || null,
  });
  if (error) {
    if ((error as { code?: string }).code === '23505') throw new Error('You have already reported this item.');
    throw new Error(dbMessage(error, 'Could not send your report. Please try again.'));
  }
}

// ============ Favorites ============

const FAV_KEY = 'stumate_favorites';

export function getLocalFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function setLocalFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch { /* storage can be blocked; hearts just won't persist */ }
}

export function clearLocalFavorites(): void {
  try {
    localStorage.removeItem(FAV_KEY);
  } catch { /* ignore */ }
}

/** Copies the student's saved items from the database so hearts show correctly. */
export async function syncFavorites(): Promise<void> {
  if (useMocks) return;
  const { data, error } = await supabase.from('favorites').select('listing_id');
  if (error || !data) return;
  setLocalFavorites(data.map((f: { listing_id: string }) => f.listing_id));
}

export async function fetchFavorites(): Promise<Listing[]> {
  if (useMocks) {
    await delay(150);
    const favIds = getLocalFavorites();
    return mockListings.filter(l => favIds.includes(l.id));
  }
  const { data, error } = await supabase
    .from('favorites')
    .select(`created_at, listing:listings(${LISTING_SELECT})`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as { listing: ListingRow | null }[];
  return rows.filter(r => r.listing).map(r => toListing(r.listing as ListingRow));
}

export function toggleLocalFavorite(id: string): boolean {
  const favs = getLocalFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  setLocalFavorites(favs);
  return idx === -1;
}

export async function toggleFavorite(listingId: string): Promise<boolean> {
  if (useMocks) return toggleLocalFavorite(listingId);

  const favs = getLocalFavorites();
  let removing = favs.includes(listingId);
  if (!removing) {
    const { error } = await supabase.from('favorites').insert({ listing_id: listingId });
    if (!error) {
      setLocalFavorites([...favs, listingId]);
      return true;
    }
    // Already saved on another device: treat the tap as "remove".
    if ((error as { code?: string }).code !== '23505') throw error;
    removing = true;
  }
  const uid = await currentUserId();
  const { error } = await supabase.from('favorites').delete().eq('listing_id', listingId).eq('user_id', uid);
  if (error) throw error;
  setLocalFavorites(favs.filter(f => f !== listingId));
  return false;
}

export function isFavorite(id: string): boolean {
  return getLocalFavorites().includes(id);
}

// ============ Conversations ============

export async function fetchConversations(): Promise<Conversation[]> {
  if (useMocks) {
    await delay(150);
    return mockConversations;
  }

  const uid = await currentUserId();
  const { data, error } = await supabase
    .from('conversations')
    .select(`id, listing_id, buyer_id, seller_id, last_message_at, listing:listings(${LISTING_COLUMNS}, images:listing_images(id, listing_id, storage_path, sort_order))`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    id: string; listing_id: string; buyer_id: string | null; seller_id: string | null; last_message_at: string; listing: ListingRow | null;
  }[];
  if (rows.length === 0) return [];

  const otherIds = [...new Set(rows.map(r => (r.buyer_id === uid ? r.seller_id : r.buyer_id)).filter((x): x is string => !!x))];
  const convIds = rows.map(r => r.id);

  const [profilesRes, messagesRes] = await Promise.all([
    otherIds.length
      ? supabase.from('profiles').select('id, full_name, avatar_url, hostel, graduation_year').in('id', otherIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('messages').select('conversation_id, body, sender_id, read_at, created_at')
      .in('conversation_id', convIds).order('created_at', { ascending: false }).limit(400),
  ]);

  const people = new Map<string, PublicProfile>();
  for (const p of (profilesRes.data ?? []) as { id: string; full_name: string | null; avatar_url: string | null; hostel: string | null; graduation_year: number | null }[]) {
    people.set(p.id, {
      id: p.id, full_name: p.full_name ?? 'Student', avatar_url: p.avatar_url, hostel: p.hostel,
      is_senior: p.graduation_year != null && p.graduation_year <= currentYearIST(),
    });
  }

  const last = new Map<string, string>();
  const unread = new Map<string, number>();
  for (const m of (messagesRes.data ?? []) as { conversation_id: string; body: string; sender_id: string | null; read_at: string | null }[]) {
    if (!last.has(m.conversation_id)) last.set(m.conversation_id, m.body);
    if (!m.read_at && m.sender_id !== uid) unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
  }

  return rows.map(r => {
    const otherId = r.buyer_id === uid ? r.seller_id : r.buyer_id;
    return {
      id: r.id,
      listing_id: r.listing_id,
      buyer_id: r.buyer_id,
      seller_id: r.seller_id,
      last_message_at: r.last_message_at,
      listing: r.listing ? toListing(r.listing) : undefined,
      other_user: otherId ? people.get(otherId) ?? null : null,
      last_message: last.get(r.id) ?? '',
      unread_count: unread.get(r.id) ?? 0,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  if (useMocks) {
    await delay(150);
    return mockMessages[conversationId] ?? [];
  }
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Message[];
}

export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  if (useMocks) {
    await delay(150);
    const msg: Message = {
      id: `m-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: 'user1',
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    if (!mockMessages[conversationId]) mockMessages[conversationId] = [];
    mockMessages[conversationId].push(msg);
    return msg;
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, body })
    .select('id, conversation_id, sender_id, body, created_at, read_at')
    .single();
  if (error) throw new Error(dbMessage(error, 'Could not send your message.'));
  return data as Message;
}

export async function findOrCreateConversation(listingId: string): Promise<string> {
  if (useMocks) {
    await delay(250);
    const existing = mockConversations.find(c => c.listing_id === listingId);
    if (existing) return existing.id;
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      listing_id: listingId,
      buyer_id: 'user1',
      seller_id: listing.seller_id,
      last_message_at: new Date().toISOString(),
      listing,
      other_user: listing.seller,
      last_message: '',
      unread_count: 0,
    };
    mockConversations.unshift(conv);
    mockMessages[conv.id] = [];
    return conv.id;
  }

  const uid = await currentUserId();
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('buyer_id', uid)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return existing.id as string;

  // buyer_id and seller_id are filled in by the database.
  const { data, error } = await supabase
    .from('conversations')
    .insert({ listing_id: listingId })
    .select('id')
    .single();
  if (error) throw new Error(dbMessage(error, 'Could not start the chat.'));
  return data.id as string;
}

// ============ Listing photos ============

/** Uploads one photo and attaches it to the listing. Photos live in <user id>/<listing id>/. */
export async function uploadListingImage(listingId: string, file: File, sortOrder = 0): Promise<{ id: string; url: string }> {
  if (useMocks) {
    return { id: `img-${Date.now()}-${sortOrder}`, url: URL.createObjectURL(file) };
  }

  const userId = await currentUserId();
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/jpeg' ? 'jpg' : 'webp';
  const path = `${userId}/${listingId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(config.listingBucket)
    .upload(path, file, { contentType: file.type || 'image/webp', upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: rowError } = await supabase
    .from('listing_images')
    .insert({ listing_id: listingId, storage_path: path, sort_order: sortOrder })
    .select('id')
    .single();
  if (rowError) {
    // Don't leave an orphan file behind.
    await supabase.storage.from(config.listingBucket).remove([path]);
    throw rowError;
  }
  return { id: data.id as string, url: publicImageUrl(path) };
}

export async function deleteListingImage(imageId: string): Promise<void> {
  if (useMocks) return;
  const { error } = await supabase.from('listing_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function setListingImageOrder(imageId: string, sortOrder: number): Promise<void> {
  if (useMocks) return;
  const { error } = await supabase.from('listing_images').update({ sort_order: sortOrder }).eq('id', imageId);
  if (error) throw error;
}

// ============ Admin ============

export async function fetchAdminStats(): Promise<AdminStats> {
  if (useMocks) { await delay(300); return mockAdminStats; }
  const { data, error } = await supabase.rpc('admin_stats');
  if (error) throw error;
  return data as AdminStats;
}

export async function fetchReports(status?: string): Promise<Report[]> {
  if (useMocks) {
    await delay(300);
    return status ? mockReports.filter(r => r.status === status) : mockReports;
  }
  let q = supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as Report[];
}

export async function fetchUserReports(status?: string): Promise<UserReport[]> {
  if (useMocks) {
    await delay(300);
    return status ? mockUserReports.filter(r => r.status === status) : mockUserReports;
  }
  let q = supabase.from('user_reports').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as UserReport[];
}

export async function fetchAdminUsers(search?: string): Promise<(Profile & { email: string; college_name: string })[]> {
  if (useMocks) {
    await delay(300);
    if (!search) return mockAdminUsers;
    const lower = search.toLowerCase();
    return mockAdminUsers.filter(u =>
      u.full_name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower)
    );
  }
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as (Profile & { email: string; college_name: string })[];
}

export async function adminRemoveListing(listingId: string, reason: string): Promise<void> {
  if (useMocks) {
    await delay(300);
    const idx = mockListings.findIndex(l => l.id === listingId);
    if (idx !== -1) mockListings[idx].status = 'removed';
    return;
  }
  const { error } = await supabase.rpc('admin_remove_listing', { p_listing: listingId, p_reason: reason });
  if (error) throw error;
}

export async function adminResolveReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
  if (useMocks) {
    await delay(300);
    const r = mockReports.find(r => r.id === reportId);
    if (r) r.status = status;
    return;
  }
  const { error } = await supabase.rpc('admin_resolve_report', { p_report: reportId, p_status: status });
  if (error) throw error;
}

export async function adminResolveUserReport(reportId: string, status: 'actioned' | 'dismissed'): Promise<void> {
  if (useMocks) {
    await delay(300);
    const r = mockUserReports.find(r => r.id === reportId);
    if (r) r.status = status;
    return;
  }
  const { error } = await supabase.rpc('admin_resolve_user_report', { p_report: reportId, p_status: status });
  if (error) throw error;
}

export async function adminSetBan(userId: string, banned: boolean, reason: string): Promise<void> {
  if (useMocks) {
    await delay(300);
    const u = mockAdminUsers.find(u => u.id === userId);
    if (u) { u.is_banned = banned; u.banned_at = banned ? new Date().toISOString() : null; }
    return;
  }
  const { error } = await supabase.rpc('admin_set_ban', { p_user: userId, p_banned: banned, p_reason: reason });
  if (error) throw error;
}

export async function fetchDataRequests(status?: string): Promise<DataRequest[]> {
  if (useMocks) {
    await delay(300);
    return status ? mockDataRequests.filter(r => r.status === status) : mockDataRequests;
  }
  let q = supabase.from('data_requests').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data as DataRequest[];
}

export async function adminUpdateDataRequest(id: string, status: string, note: string): Promise<void> {
  if (useMocks) {
    await delay(300);
    const r = mockDataRequests.find(r => r.id === id);
    if (r) { r.status = status as DataRequest['status']; r.resolved_at = status === 'resolved' ? new Date().toISOString() : null; }
    return;
  }
  const { error } = await supabase.rpc('admin_update_data_request', { p_id: id, p_status: status, p_note: note });
  if (error) throw error;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
