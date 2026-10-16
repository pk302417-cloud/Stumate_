# Deployment Guide

## Build

```bash
npm run build
```

Output is in `dist/`. The build is a static SPA suitable for any static hosting provider.

## Environment Variables

Set these at build time (Vite inlines them):

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes (production) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (production) | Supabase anon key |
| `VITE_USE_MOCKS` | No | Set to `true` for mock mode demo |

## Hosting Options

### Bolt.new
The app is deployed automatically by Bolt. No manual configuration needed.

### Static hosting (Netlify, Vercel, etc.)
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add a SPA redirect rule: `/* -> /index.html` (200)

## Supabase Configuration

Ensure the following are configured in your Supabase project:
- Auth: Email/password enabled, email confirmation off
- Storage: `listing-images` bucket with appropriate policies
- Database: All tables with RLS enabled (see `docs/DB_CHANGE_REQUESTS.md`)

## Pre-Deployment Checklist

- [ ] `VITE_USE_MOCKS` is not set to `true` in production
- [ ] All RLS policies are enabled on tables
- [ ] Storage bucket policies are configured
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
