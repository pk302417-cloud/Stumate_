# Testing

## Framework

- **Vitest** — test runner with Vite integration
- **@testing-library/react** — React component testing
- **@testing-library/jest-dom** — custom DOM matchers
- **jsdom** — DOM environment for tests

## Running Tests

```bash
npm test           # run once
npm run test:watch # watch mode
```

## Test Files

| File | Coverage |
|---|---|
| `src/test/format.test.ts` | Price formatting, relative time, pickup dates, condition/status labels, `cn` utility |
| `src/test/Button.test.tsx` | Button rendering, loading state, disabled state |
| `src/test/Badge.test.tsx` | Badge rendering, variant classes |

## Test Setup

`src/test/setup.ts` imports jest-dom matchers and runs cleanup after each test.

## Adding Tests

1. Create `src/test/ComponentName.test.tsx` (use `.tsx` if the test contains JSX)
2. Import from `vitest` for `describe`, `it`, `expect`
3. Import from `@testing-library/react` for `render`, `screen`
4. Use `@testing-library/user-event` for interaction testing
5. Wrap components needing router context in `<MemoryRouter>`
