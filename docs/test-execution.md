# Test Execution

## Purpose
This guide describes the local commands used to verify the portal before changes are considered done.

## Prerequisites
- Docker Desktop running
- PostgreSQL started with `docker compose up -d`
- migrations applied
- demo data seeded with `npm run seed`

## Main commands
- `npm run lint`: static linting
- `npm run typecheck`: TypeScript verification
- `npm run test`: Vitest unit, integration, and component suites
- `npm run test:e2e`: Playwright end-to-end coverage
- `npm run test:e2e:headed`: Playwright with a visible browser
- `npm run build`: production build verification

## Recommended full local verification order
1. `docker compose up -d`
2. `npm run seed`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test`
6. `npm run test:e2e`
7. `npm run build`

## What each layer covers
- Vitest unit tests: validation rules, formatting helpers, and other pure logic
- Vitest integration tests: form behavior, service logic, status transitions, storage handling, CSV generation, and audit side effects
- React Testing Library component tests: key UI states and table or dashboard rendering
- Playwright E2E tests: cross-role browser workflows using seeded local data

## E2E behavior
- Playwright runs against `http://127.0.0.1:3000` by default.
- If the app is already running, Playwright reuses the existing server.
- If the app is not running, Playwright starts it with `npm run dev`.
- Browser coverage is intentionally focused on stable high-value flows rather than broad brittle page scraping.

## Useful targeted runs
- `npx vitest tests/integration`
- `npx playwright test tests/e2e/critical-portal-journey.spec.ts`

## When to reseed
Run `npm run seed` before browser verification when:
- you changed seed data
- you want a known local demo state
- browser tests need predictable users, cases, or master data

