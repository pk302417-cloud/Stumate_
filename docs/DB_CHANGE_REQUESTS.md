# DB Change Requests

This document lists schema/RPC changes needed to fully support the Stumate frontend.
The frontend is built against the schema described in the product spec. The Supabase
project currently has **no tables, views, or functions**. The app runs in mock mode
(`VITE_USE_MOCKS=true`) until the schema is created.

## Blocking: Schema does not exist

The entire schema described in the spec needs to be created. The following tables,
views, and RPCs are referenced by the frontend API layer (`src/api/index.ts`) and
will fail at runtime in production mode without them.

### Tables needed

| Table | Purpose | Frontend files that use it |
|---|---|---|
| `colleges` | College registry with allowed email domains | `src/api/index.ts` (check_email_domain) |
| `profiles` | User profiles (name, hostel, graduation year, WhatsApp, role, ban status) | `src/hooks/useAuth.tsx`, `src/api/index.ts` |
| `categories` | 8 category rows (furniture, books, electronics, etc.) | `src/api/index.ts`, marketplace/search pages |
| `listings` | Marketplace listings with title, price, condition, status, search tsvector | `src/api/index.ts`, all listing pages |
| `listing_images` | 1–6 images per listing, storage_path in bucket `listing-images` | `src/api/index.ts`, sell page |
| `favorites` | User favorites (composite PK user_id + listing_id) | `src/api/index.ts`, favorites page |
| `conversations` | Chat threads between buyer and seller about a listing | `src/api/index.ts`, chats pages |
| `messages` | Individual chat messages (≤1000 chars, read_at timestamps) | `src/api/index.ts`, chat thread page |
| `reports` | Listing reports (prohibited item, scam, wrong info, etc.) | `src/pages/ListingDetailPage.tsx` |
| `consents` | Per-purpose consent records (terms, age, WhatsApp, analytics, marketing) | `src/pages/ProfilePage.tsx`, onboarding |
| `data_requests` | DPDP-style data requests (access, correction, erasure, nomination, grievance) | `src/pages/ProfilePage.tsx` |
| `events` | Analytics events (only written if analytics consent granted) | `src/lib/logger.ts` (future) |
| `user_blocks` | Block another user (blocker_id + blocked_id) | `src/pages/ChatThreadPage.tsx` |
| `user_reports` | Report a person from chat or seller profile | `src/pages/ChatThreadPage.tsx` |

### Views needed

| View | Purpose |
|---|---|
| `public_profiles` | Safe public view of profiles (id, full_name, avatar_url, hostel, is_senior) — hides WhatsApp and private columns |

### RPC functions needed

| Function | Used by |
|---|---|
| `check_email_domain(p_email)` | Login page — pre-login college check |
| `complete_onboarding(...)` | Onboarding wizard |
| `update_my_profile(...)` | Profile edit form |
| `get_my_account()` | Auth context — who-am-I call after login |
| `export_my_data()` | Privacy Centre — data export |
| `delete_my_account()` | Privacy Centre — account deletion |
| `record_consent(p_purpose, p_notice_version, p_granted, p_user_agent)` | Consent recording |
| `has_consent(p_purpose)` | Analytics gating |
| `renew_listing(p_listing_id)` | My Listings — renew expired listings |
| `get_partner_whatsapp(p_conversation_id)` | Chat — WhatsApp handoff |
| `can_transact()` | Sell/chat gating |
| `find_or_create_conversation(p_listing_id)` | Chat — start conversation from listing |
| `current_college_id()` | Listing creation |
| `is_admin()` | Admin route guard |
| `admin_stats()` | Admin dashboard |
| `admin_remove_listing(p_listing, p_reason)` | Admin — remove listing |
| `admin_resolve_report(p_report, p_status)` | Admin — resolve listing report |
| `admin_resolve_user_report(p_report, p_status)` | Admin — resolve user report |
| `admin_set_ban(p_user, p_banned, p_reason)` | Admin — ban/unban user |
| `admin_update_data_request(p_id, p_status, p_note)` | Admin — update data request |

### Storage bucket needed

| Bucket | Settings |
|---|---|
| `listing-images` | Public bucket, 5 MB/file max, JPEG/PNG/WebP only. Object path: `<user_id>/<listing_id>/<uuid>.webp` |

### Auth configuration needed

- Email OTP (passwordless) must be enabled in Supabase Auth settings
- Email confirmation should stay OFF (per spec)
- MFA (TOTP, aal2) must be available for admin accounts

## Non-blocking notes

- The frontend currently uses `find_or_create_conversation` as a client-side RPC. If
  the backend implements this differently (e.g. as a trigger or a different function
  name), update `src/api/index.ts`.
- `can_transact()` semantics assumed: returns true if user is onboarded, 18+ confirmed,
  consented, not banned, and on current terms version. If semantics differ, the gating
  logic in route guards may need adjustment.
- Terms version is fetched from `get_my_account().current_terms_version`. The frontend
  never hard-codes it. Currently "1.0" is the assumed version.
