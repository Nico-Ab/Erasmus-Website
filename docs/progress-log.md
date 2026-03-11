# Progress Log

## Status snapshot
- Date: March 11, 2026
- Overall phase: Foundation established, product workflows still pending
- Portal status: Runnable application foundation only
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
- Added Vitest, React Testing Library, and Playwright configuration with smoke tests.
- Added local observability via `/status` and `/api/health`.

### What is intentionally incomplete
- Registration and approval workflow UI
- Staff profile editing flows
- Mobility case creation, draft, submission, and status history workflows
- Private document upload, versioning, and review workflows
- Reporting, CSV export, archive management, and admin management screens
- Domain models beyond the auth and foundation slice

### Risks and follow-up notes
- The project currently relies on seeded local users for sign-in because registration is not implemented yet.
- The current Prisma setup emits a deprecation warning for `package.json#prisma`; it works now but should be moved to a dedicated Prisma config before a future Prisma 7 upgrade.
- This machine did not have Node.js on PATH, so a workspace-local runtime was used during setup and verification. Standard developer setup should still assume a normal Node installation.

## Verification summary
- `docker compose up -d`: passed
- `npm install`: passed
- `npm run db:migrate -- --name init-foundation`: passed
- `npm run seed`: passed
- Local HTTP check against `http://127.0.0.1:3000`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed
- `npm run test:e2e`: passed
- `npm run build`: passed

## Milestone tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| M1 Workspace bootstrap and viewable shell | Completed | App shell, auth, status page, tests, migration, and seed are in place |
| M2 Data foundation | Not started | Current Prisma schema covers the auth/foundation slice only |
| M3 Authentication and access control | In progress through foundation slice | Credentials auth and role guards exist, registration and approval flows do not |
| M4 Staff identity and dashboard baseline | Not started | Placeholder dashboard shell only |
| M5 Mobility case drafting and submission | Not started | No case model or workflow yet |
| M6 Secure document management | Not started | No upload or storage workflow yet |
| M7 Officer review workflow | Not started | Officer page is placeholder only |
| M8 Admin controls and master data | Not started | Admin page is placeholder only |
| M9 Reporting, exports, and archive access | Not started | No reporting or export implementation yet |
| M10 Hardening and release readiness | Not started | Foundation verification complete, full product hardening pending |

## Next recommended move
Start M2 by expanding the Prisma domain model beyond auth and establishing the first real business entities needed for staff profile and case workflow work.

## Update template
Use this format for future entries:

### YYYY-MM-DD
- Milestone:
- Change summary:
- Tests run:
- Docs updated:
- Risks or follow-up:
