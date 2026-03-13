# SWU Erasmus Staff Mobility Portal

Internal Erasmus+ staff mobility management portal for university staff, officers, and admins.

## v1 status
The repository now contains a locally runnable v1 portal for internal use. It supports role-based access, approval-gated accounts, editable staff profiles, staff mobility cases, private document handling, officer review, admin management, reporting, CSV export, and automated test coverage.

It is ready for reliable local use and evaluation. It is not yet a fully hosted production rollout.

## What v1 supports
- credentials-based registration and login
- admin approval, rejection, role changes, and deactivation
- staff profile editing with faculty and department relations
- staff mobility case drafting, editing, resuming, and submission
- private document upload, version history, and permission-checked download
- officer case review, comments, document decisions, status changes, and archive
- admin-managed master data, upload settings, and report display settings
- reporting, filtered case views, and CSV exports
- explicit audit logging for important actions
- local health and status checks

## Main routes
- `/` home page
- `/login` login
- `/register` staff registration
- `/pending-approval` approval waiting state
- `/status` local status page
- `/dashboard/staff` staff dashboard
- `/dashboard/officer` officer dashboard
- `/dashboard/admin` admin dashboard
- `/dashboard/reports` officer and admin reporting

## Quick start
1. Install Node.js 24+ on your host machine.
2. Install Docker Desktop and make sure it is running.
3. Copy `.env.example` to `.env`.
4. Start PostgreSQL with `docker compose up -d`.
5. Install dependencies with `npm install`.
6. Apply existing Prisma migrations with `npm run db:migrate`.
7. Seed demo data with `npm run seed`.
8. Start the app with `npm run dev`.
9. Open `http://127.0.0.1:3000`.

For the local health surface, open `http://127.0.0.1:3000/status`.

## Demo accounts
Detailed demo credentials are listed in [docs/demo-accounts.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/demo-accounts.md).

Included seeded accounts:
- Admin: `admin@swu.local` / `AdminPass123!`
- Officer: `officer@swu.local` / `OfficerPass123!`
- Staff: `staff@swu.local` / `StaffPass123!`
- Staff 2: `staff2@swu.local` / `StaffTwoPass123!`
- Pending: `pending@swu.local` / `PendingPass123!`
- Rejected: `rejected@swu.local` / `RejectedPass123!`
- Deactivated: `deactivated@swu.local` / `DeactivatedPass123!`

## Database and storage
- PostgreSQL runs locally through `docker compose`.
- Prisma uses `DATABASE_URL` from `.env`.
- Uploaded files are stored through the storage abstraction and stay outside `public/`.
- The default local storage root is `./storage`.

More detail:
- [docs/local-startup.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/local-startup.md)
- [docs/storage-behavior.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/storage-behavior.md)
- [docs/deployment-readiness.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/deployment-readiness.md)

## Scripts
| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server on `127.0.0.1:3000` |
| `npm run build` | Generate Prisma client and build the Next.js app |
| `npm run start` | Start the production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run test` | Run Vitest unit, integration, and component tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:headed` | Run Playwright with a visible browser |
| `npm run db:migrate` | Apply existing Prisma migrations in local development |
| `npm run db:migrate:deploy` | Apply committed migrations in deployment-style environments |
| `npm run db:push` | Push schema changes to the database without creating a migration |
| `npm run db:generate` | Generate the Prisma client |
| `npm run seed` | Seed demo users, master data, and sample cases |

## Testing and verification
Recommended local quality run:
1. `docker compose up -d`
2. `npm run seed`
3. `npm run lint`
4. `npm run typecheck`
5. `npm run test`
6. `npm run test:e2e`
7. `npm run build`

Testing guidance is documented in [docs/testing-strategy.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/testing-strategy.md) and [docs/test-execution.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/test-execution.md).

## Documentation map
- [docs/local-startup.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/local-startup.md)
- [docs/test-execution.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/test-execution.md)
- [docs/demo-accounts.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/demo-accounts.md)
- [docs/storage-behavior.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/storage-behavior.md)
- [docs/deployment-readiness.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/deployment-readiness.md)
- [docs/progress-log.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/progress-log.md)

## Known limitations
- The storage driver is local filesystem only in v1.
- File validation is extension and size based; MIME inspection and malware scanning are not implemented.
- Direct Playwright interaction with the `/register` page is still less stable than the API-backed registration browser path used in the suite.
- Larger officer and reporting queues do not yet include pagination, saved views, or bulk actions.
- Password reset, email verification, and account recovery are still out of scope for v1.

## Notes for later hosting
- Move from local filesystem storage to a persistent shared storage driver if the app will run on more than one instance.
- Keep `AUTH_SECRET`, `DATABASE_URL`, and storage settings environment-based.
- Use `npm run db:migrate:deploy` for deployment-style schema updates.
- Treat the current docs as the handoff baseline for future hosting work, not as a claim that hosting is already complete.

