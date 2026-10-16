# Security Considerations

## Current State

The app runs in two modes:
1. **Mock mode** (`VITE_USE_MOCKS=true`): No backend, all data is client-side mock. No security concerns.
2. **Supabase mode**: The browser talks directly to Supabase. Security depends on RLS policies.

## RLS (Row Level Security)

All tables must have RLS enabled with policies scoped to `auth.uid()`. See `docs/DB_CHANGE_REQUESTS.md` for any tables that still need policies.

## Authentication

- Email/password auth via Supabase Auth
- Session managed by Supabase JS client
- `useAuth` context wraps the entire app

## Admin Access

Admin routes are guarded by `RequireAdmin` which checks `profile.role === 'admin'`. In mock mode, the mock user has `role: 'admin'` so admin features are accessible.

**Note**: In Supabase mode, the `role` column on `profiles` must be protected by column-level security or a SECURITY DEFINER function so users cannot self-assign admin. See `docs/DB_CHANGE_REQUESTS.md`.

## Data Privacy

- User profiles expose only public fields (name, avatar, hostel, senior status) via the `public_profiles` view
- Private fields (email, WhatsApp, role, banned status) are only in `profiles` table
- Data requests (access/erasure/grievance) are tracked with SLA timers

## Image Uploads

Images are uploaded to Supabase Storage with paths scoped to `{userId}/{listingId}/`. Storage bucket policies must ensure users can only write to their own paths.

## Known Gaps

See `docs/DB_CHANGE_REQUESTS.md` for database-level changes needed to close security gaps.
