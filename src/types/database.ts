// ============================================================
// Stumate — Database Types
// These types mirror the schema described in the product spec.
// When the real Supabase schema is in place, generate types via
// `supabase gen types` and replace this file.
// ============================================================

export type Condition = 'like_new' | 'good' | 'okay';
export type ListingStatus = 'available' | 'reserved' | 'sold' | 'removed' | 'expired';
export type ReportReason = 'prohibited_item' | 'scam' | 'wrong_info' | 'harassment' | 'duplicate' | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'actioned' | 'dismissed';
export type ConsentPurpose = 'terms_privacy' | 'age_18' | 'whatsapp_sharing' | 'analytics' | 'marketing';
export type DataRequestType = 'access' | 'correction' | 'erasure' | 'nomination' | 'grievance';
export type DataRequestStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';
export type UserRole = 'student' | 'admin';
export type UserReportReason = 'harassment' | 'scam' | 'spam' | 'inappropriate_content' | 'impersonation' | 'other';

export interface College {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  allowed_email_domains: string[];
  is_active: boolean;
}

/** One row from the public `search_colleges` function. */
export interface CollegeOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  /** If not empty, only emails ending with one of these domains can sign up. */
  email_domains: string[];
}

export type SignupCheckReason = 'invalid_email' | 'college_not_found' | 'domain_mismatch';

/** Result of the public `check_signup_email` function. */
export interface SignupCheck {
  ok: boolean;
  reason: SignupCheckReason | null;
  domains: string[];
  verified?: boolean;
}

export interface Profile {
  id: string;
  college_id: string;
  full_name: string;
  avatar_url: string | null;
  hostel: string | null;
  graduation_year: number;
  whatsapp: string | null;
  role: UserRole;
  is_banned: boolean;
  banned_at: string | null;
  consented_at: string | null;
  terms_version: string | null;
  age_confirmed_18: boolean;
  onboarded_at: string | null;
  department?: string | null;
  course?: string | null;
  semester?: number | null;
  college_verified?: boolean;
  email?: string;
  college_name?: string;
  college_city?: string | null;
  college_state?: string | null;
  is_senior?: boolean;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  hostel: string | null;
  is_senior: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
}

export interface Listing {
  id: string;
  seller_id: string;
  college_id: string;
  category_id: string;
  title: string;
  description: string;
  price_inr: number;
  condition: Condition;
  hostel: string;
  status: ListingStatus;
  is_negotiable: boolean;
  pickup_before: string | null;
  /** How old the item is, in months (null for older listings). */
  age_months?: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  category?: Category;
  seller?: PublicProfile;
  images?: ListingImage[];
  image_urls?: string[];
}

export interface Favorite {
  user_id: string;
  listing_id: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string | null;
  seller_id: string | null;
  last_message_at: string;
  listing?: Listing;
  other_user?: PublicProfile | null;
  last_message?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
}

export interface Consent {
  id: string;
  user_id: string;
  purpose: ConsentPurpose;
  notice_version: string;
  granted: boolean;
  granted_at: string;
  withdrawn_at: string | null;
}

export interface DataRequest {
  id: string;
  user_id: string;
  type: DataRequestType;
  details: string;
  status: DataRequestStatus;
  acknowledge_due_at: string;
  due_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface UserBlock {
  blocker_id: string;
  blocked_id: string;
  blocked_user?: PublicProfile;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_id: string;
  conversation_id: string | null;
  reason: UserReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
}

export interface MyAccount {
  id: string;
  email: string;
  college_id: string;
  college_name: string;
  college_city: string | null;
  college_state: string | null;
  college_verified: boolean;
  full_name: string | null;
  avatar_url: string | null;
  hostel: string | null;
  graduation_year: number | null;
  whatsapp: string | null;
  department: string | null;
  course: string | null;
  semester: number | null;
  role: UserRole;
  is_banned: boolean;
  consented_at: string | null;
  terms_version: string | null;
  age_confirmed_18: boolean;
  onboarded_at: string | null;
  is_senior: boolean;
  current_terms_version: string;
  needs_reconsent: boolean;
}

export interface OnboardingInput {
  full_name: string;
  mobile: string;
  course: string;
  department: string;
  semester: number;
  graduation_year: number;
  hostel: string;
  consents: {
    terms: boolean;
    age18: boolean;
    whatsappSharing: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

export interface AdminStats {
  total_users: number;
  active_listings: number;
  open_reports: number;
  open_data_requests: number;
  total_conversations: number;
  banned_users: number;
  sla_breaches: {
    data_requests: number;
  };
}
