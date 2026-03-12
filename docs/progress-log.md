# Progress Log

## Status snapshot
- Date: March 12, 2026
- Overall phase: Foundation established, testing foundation strengthened, product workflows still pending
- Portal status: Runnable application foundation with multi-layer test setup
- Active milestone: M1 completed, M2 not started

## Foundation completed on March 11, 2026
### What was done
- Added a real Next.js App Router application with `src/` layout.
- Added TypeScript, Tailwind CSS, and shadcn/ui-style component primitives.
- Added Prisma schema, initial migration, and seed script scaffold.
- Wired PostgreSQL through environment variables.
- Added Auth.js credentials-based authentication with Prisma adapter.
- Added formal institutional home, login, status, and protected dashboard shell pages.
- Added staff, officer, and admin placeholder areas behind role-aware guards.
- Added local observability via `/status` and `/api/health`.

## Testing foundation strengthened on March 12, 2026
### What was done
- Tightened the Vitest setup for unit, integration, and component testing in a Next.js `jsdom` environment.
- Added global browser-like test shims and cleanup in `vitest.setup.ts`.
- Added shared test helpers and stable credential factories.
- Added unit coverage for validation rules and shared formatting logic.
- Added integration coverage for the login form submit flow and validation behavior.
- Expanded component coverage for authenticated and anonymous home-page rendering.
- Upgraded Playwright smoke coverage to check home, login, and authenticated app shell rendering.
- Added `docs/testing-strategy.md` to define the intended testing pyramid and local execution approach.

### What is intentionally incomplete
- Registration and approval workflow UI
- Staff profile editing flows
- Mobility case creation, draft, submission, and status history workflows
- Private document upload, versioning, and review workflows
- Reporting, CSV export, archive management, and admin management screens
- Domain models beyond the auth and foundation slice
- Deep server-action or database integration tests for future workflow modules

### Risks and follow-up notes
- The current Prisma setup still emits a deprecation warning for `package.json#prisma`; it works now but should move to a dedicated Prisma config before a future Prisma 7 upgrade.
- E2E smoke tests rely on seeded local users and a reachable local PostgreSQL container.
- Critical business workflows remain mostly uncovered because those product modules are not implemented yet.

## Verification summary
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed
- `npm run test:e2e`: passed
- `npm run build`: passed

## Coverage snapshot
### Covered now
- unit coverage for validation, navigation, and shared text-formatting helpers
- integration coverage for login form behavior and error handling
- component coverage for the home page
- e2e smoke coverage for home, login, and authenticated app shell rendering

### Still uncovered
- registration and approval workflow
- staff profile editing
- case lifecycle and status transitions
- document upload/download authorization
- officer review actions
- admin management flows
- reporting and exports

## Milestone tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| M1 Workspace bootstrap and viewable shell | Completed | App shell, auth, status page, testing stack, migration, and seed are in place |
| M2 Data foundation | Not started | Current Prisma schema covers the auth/foundation slice only |
| M3 Authentication and access control | In progress through foundation slice | Credentials auth, route guards, and login testing exist; registration and approval flows do not |
| M4 Staff identity and dashboard baseline | Not started | Placeholder dashboard shell only |
| M5 Mobility case drafting and submission | Not started | No case model or workflow yet |
| M6 Secure document management | Not started | No upload or storage workflow yet |
| M7 Officer review workflow | Not started | Officer page is placeholder only |
| M8 Admin controls and master data | Not started | Admin page is placeholder only |
| M9 Reporting, exports, and archive access | Not started | No reporting or export implementation yet |
| M10 Hardening and release readiness | Not started | Foundation and smoke verification exist, full product hardening pending |

## Next recommended move
Start M2 by expanding the Prisma domain model beyond auth and then add tests alongside each new domain slice instead of postponing coverage until later.

## Update template
Use this format for future entries:

### YYYY-MM-DD
- Milestone:
- Change summary:
- Tests run:
- Docs updated:
- Risks or follow-up:
