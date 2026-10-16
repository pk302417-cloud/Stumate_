# Architecture

## Overview

Stumate is a single-page React app with a Supabase backend. The frontend talks to Supabase directly via the JS client (Postgres + Auth + Storage). An optional mock mode bypasses Supabase entirely for local development.

## Routing

Routes are defined in `src/App.tsx` using `createBrowserRouter`. Pages are lazy-loaded with `React.lazy()` + `Suspense` for code splitting. The initial bundle only contains the landing page and login; all other pages load on demand.

### Route Guards

- `RequireAuth` — redirects to `/login` if not signed in
- `RequireOnboarded` — redirects to `/onboarding` if profile incomplete, `/banned` if banned
- `RequireAdmin` — redirects to `/404` if not an admin role

### Layouts

- `PlainLayout` — no app chrome (landing, login, legal pages)
- `AppLayout` — header + footer + outlet (authenticated pages)

## Data Layer

`src/api/index.ts` is the single API module. Each function checks `config.useMocks` and either returns mock data or queries Supabase. React Query manages caching, loading states, and mutations.

### Query Keys

All query keys are arrays starting with a domain prefix: `['listings', ...]`, `['admin-stats']`, etc. Mutations invalidate the relevant keys to refresh.

## Auth

`src/hooks/useAuth.tsx` provides an `AuthContext` with `user`, `profile`, `loading`, `needsOnboarding`, `isBanned`, `refresh`, and `signOut`. It listens to `supabase.auth.onAuthStateChange` and loads the profile on auth changes.

## Mock Mode

When `VITE_USE_MOCKS=true`:
- Auth uses localStorage for a mock session
- API functions return mock data with simulated delays
- No Supabase connection is made

## Code Splitting

`vite.config.ts` defines manual chunks for vendor libraries:
- `react-vendor`: react, react-dom, react-router-dom
- `supabase-vendor`: @supabase/supabase-js
- `query-vendor`: @tanstack/react-query
- `icons`: lucide-react

Page-level splitting is handled by `React.lazy()` in `App.tsx`.

## Styling

Tailwind CSS with a custom design system defined in `tailwind.config.js`:
- 8 color ramps: brand, accent, success, warning, error + neutral (ink)
- 8px spacing system
- Dark mode support via `dark:` variants
- Component primitives in `src/components/ui/`
