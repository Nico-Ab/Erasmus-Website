# SWU Erasmus Staff Mobility Portal

Internal Erasmus+ staff mobility management portal for university staff, officers, and admins.

## Current stage
Runnable application foundation.

The repository now contains the real app shell and toolchain, but it does not yet implement the main portal workflows such as registration approval, mobility case management, document handling, reporting, or admin operations.

## Included foundation
- Next.js App Router with `src/` layout
- TypeScript, Tailwind CSS, and shadcn/ui-style primitives
- Prisma with PostgreSQL wiring
- Auth.js credentials-based authentication with Prisma adapter
- Zod and React Hook Form login flow
- Vitest, React Testing Library, and Playwright setup
- Home page, login page, status page, and role-aware dashboard placeholders

## Local setup
1. Install Node.js 24+ and Docker Desktop.
2. Copy `.env.example` to `.env`.
3. Start PostgreSQL with `docker compose up -d`.
4. Install dependencies with `npm install`.
5. Apply the initial schema with `npm run db:migrate -- --name init-foundation`.
6. Seed local users with `npm run seed`.
7. Start the app with `npm run dev`.

## Seeded local accounts
- Staff: `staff@swu.local` / `StaffPass123!`
- Officer: `officer@swu.local` / `OfficerPass123!`
- Admin: `admin@swu.local` / `AdminPass123!`
- Pending approval: `pending@swu.local` / `PendingPass123!`

## Verification commands
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Important repo guidance
- Project instructions live in `AGENTS.md`
- Product requirements live in `docs/requirements.md`
- UI style guidance lives in `docs/ui-style.md`
- Architecture guidance lives in `docs/architecture-notes.md`
- Status rules live in `docs/status-model.md`
- Execution planning lives in `docs/build-plan.md`, `docs/acceptance-criteria.md`, and `docs/implementation-runbook.md`

## Rules
- Keep the project local-first.
- Keep storage private.
- Use environment variables.
- Keep code maintainable.
- Avoid AI-style comments.
