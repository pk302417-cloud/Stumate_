# Stumate — Campus Marketplace

A hyper-local campus marketplace where students buy seniors' room essentials and sell before they leave. Built with React, Vite, Tailwind CSS, and Supabase.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Run test suite (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 7 (code-split with lazy loading)
- **Data fetching**: TanStack React Query 5
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## Project Structure

```
src/
  api/          API layer (Supabase queries + mock data)
  components/   Reusable UI components
    layout/     Header, Footer
    listing/    ListingCard
    ui/         Button, Card, Input, Dialog, Badge, Toast, etc.
  config/       App config from env variables
  hooks/        useAuth context
  lib/          Utility functions (formatting, supabase client)
  pages/        Route-level page components
  routes/       Route guards + layouts
  test/         Test setup + test files
  types/        TypeScript types
```

## Environment Variables

All config is read from env variables (see `.env.example`):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_USE_MOCKS` | Set to `true` to use mock data instead of Supabase |

## Mock Mode

Setting `VITE_USE_MOCKS=true` enables a full mock data layer so the app runs without a live Supabase project. All API functions return realistic mock data with simulated delays.

## Testing

Tests use Vitest with jsdom. Run with:

```bash
npm test
```

Tests cover:
- Price/time formatting utilities (`format.test.ts`)
- UI components: Button, Badge (`Button.test.tsx`, `Badge.test.tsx`)

## Architecture

See `docs/ARCHITECTURE.md` for detailed architecture notes.
See `docs/SECURITY.md` for security considerations.
See `docs/DB_CHANGE_REQUESTS.md` for database changes needed but not yet applied.
