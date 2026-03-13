# Progress Log

## Status snapshot
- Date: March 13, 2026
- Overall phase: Foundation, authentication, staff profile baseline, admin master data baseline, role dashboards, and the first staff-owned mobility-case workflow are implemented; larger review and document workflows are still pending
- Portal status: Runnable application with production-minded auth, approval gating, editable staff profiles, real role dashboards, admin-managed master data, staff mobility-case drafting and submission, and multi-layer automated tests
- Active milestones: M5 completed for the current scope, M7 in progress through dashboard visibility only, M8 in progress through the current baseline

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

## Authentication, roles, and approval implemented on March 12, 2026
### What was done
- Added public staff registration with credentials-based account creation and secure password hashing.
- Added approval-aware login that blocks pending, rejected, and deactivated users from protected routes.
- Added a dedicated pending-approval page so unapproved users see a clear state instead of entering the workspace.
- Tightened server-side route guards so officer and admin routes stay protected without client-only checks.
- Added a minimal admin user management page for approving or rejecting staff registrations.
- Added Prisma review metadata on users through `reviewedAt`, `reviewedById`, and a self-relation for approval tracking.
- Added the `20260312072630_auth_approval_workflow` Prisma migration and refreshed the seed data for one admin, one officer, and one approved staff user.
- Added public routes for `/register` and `/pending-approval` plus the `/api/register` endpoint.
- Added admin approval routing at `/dashboard/admin/users` and linked it from the protected navigation.
- Added test coverage for registration, login, pending approval behavior, approved login flow, and protected-route access control.

## Staff profile and master data baseline implemented on March 12, 2026
### What was done
- Normalized staff profile data so users now relate to academic title options, faculties, and departments instead of storing those values as loose text.
- Added Prisma models for `Faculty`, `Department`, `AcademicYear`, `CaseStatusDefinition`, `SelectOption`, and `UploadSetting`.
- Kept departments structurally linked to faculties so invalid faculty-department pairings are rejected server-side.
- Added the protected staff profile editor at `/dashboard/profile` with validated editing for first name, last name, email, academic title, faculty, and department.
- Added the server-side profile update endpoint at `/api/profile` with duplicate-email checks and relation integrity validation.
- Added the admin master data workspace at `/dashboard/admin/master-data` for faculties, departments, academic years, statuses, select-list data, and upload settings.
- Added the server-side admin master data endpoint at `/api/admin/master-data` so sensitive changes remain protected by approved-admin checks.
- Refreshed dashboard navigation and staff/admin summaries so the new surfaces are reachable from the structured shell.
- Updated the seed data to include baseline faculties, departments, academic years, statuses, select-list options, upload settings, and role accounts linked to the relational data model.
- Added the `20260312110000_profile_master_data` schema update. Because Prisma `migrate dev` became non-interactive after destructive-column warnings, the change was applied through `prisma migrate diff`, `prisma db execute`, and `prisma migrate resolve` instead.
- Added validation, integration, and E2E coverage for profile editing, faculty and department management, and unauthorized master-data edits.

## First real role dashboards implemented on March 12, 2026
### What was done
- Added a shared server-side dashboard service layer that queries live registration, academic-year, faculty, department, and status data where it exists.
- Added reusable formal list-panel widgets so dashboard pages can show structured queues and explicit empty states instead of placeholder prose.
- Replaced the staff placeholder page with a real dashboard that shows profile-linked context, academic-year status, status areas sourced from master data, a missing-documents area, a latest-comments area, and open tasks with honest zero states where case data did not yet exist.
- Replaced the officer placeholder page with a real review dashboard that shows new registrations, open reviews, current academic year overview metrics, and honest empty states for submitted-case, missing-document, and changes-required queues.
- Replaced the admin placeholder page with a real operational dashboard that shows the same live oversight metrics plus direct actions into user management and master data.
- Added component tests for dashboard panels and role dashboard content.
- Added E2E tests that verify staff, officer, and admin users see the correct role dashboard visibility.
- Tightened Playwright local execution for stability by using a single worker in the current local-first setup.
- Adjusted auth E2E registration coverage to use the live `/api/register` endpoint plus browser pending-approval and approval-unlock flows because direct `/register` page navigation was unreliable in local Playwright dev mode, while the register form UI remains covered in integration tests.

## Staff mobility-case management implemented on March 13, 2026
### What was done
- Added Prisma case-domain models for `MobilityCase`, `MobilityCaseComment`, and `MobilityCaseStatusHistory` plus the required relations from `User`, `AcademicYear`, `CaseStatusDefinition`, and mobility-type `SelectOption` records.
- Added the `20260313062930_mobility_case_management` Prisma migration and refreshed seed data so the workflow can run against real academic years, status definitions, mobility types, and role accounts.
- Added server-side mobility-case validation with clear required-field and date-order rules for draft and submit flows.
- Added protected staff APIs at `/api/staff/cases` and `/api/staff/cases/[caseId]` with approved-staff checks and ownership enforcement.
- Added staff case routes at `/dashboard/staff/cases/new` and `/dashboard/staff/cases/[caseId]` for creating, resuming, editing, and submitting cases.
- Added a structured staff case list and detail experience with formal tables, status badges, status history, comments, recorded-summary panels, and honest empty states where downstream review data does not yet exist.
- Added real draft save and later-resume behavior so staff users can maintain multiple cases in progress.
- Added submission behavior that moves a case into the submitted state and records explicit status-history entries when the workflow changes state.
- Updated the staff dashboard so case overview, status areas, latest comments, and open tasks now consume real case data where available instead of only shell placeholders.
- Updated navigation so the protected shell exposes the case workspace and new-case entry point.
- Added unit coverage for mobility-case validation, integration coverage for create, update, and submit service and form behavior, component coverage for the readable case table, and E2E coverage for draft creation, draft editing, submission, own-case list/detail access, and protected-route enforcement.
- Hardened the mobility-case browser tests by scoping create and edit interactions to explicit form instances after client-side navigation, which removed a real local flake where overlapping route transitions could momentarily expose both forms.

### What is intentionally incomplete
- Officer and admin review actions on submitted cases
- Officer or admin comment authoring and change-request loops
- Real missing-document logic tied to uploaded files
- Private document upload, versioning, and review workflows
- Reporting, CSV export, archive management, and broader admin operations
- Audit history for master-data changes
- Role changes and account deactivation controls in the admin UI
- Password reset, email verification, and richer account recovery flows
- Direct browser interaction with the `/register` page in Playwright

### Risks and follow-up notes
- The current Prisma setup still emits a deprecation warning for `package.json#prisma`; it works now but should move to a dedicated Prisma config before Prisma 7.
- Negative-path browser tests trigger expected `CredentialsSignin` logs in Next.js dev mode when pending users are blocked at sign-in.
- Direct browser navigation to `/register` remains unreliable under the current local Playwright-plus-dev-server combination, so registration browser coverage still exercises the live endpoint rather than the page UI itself.
- The current mobility workflow covers staff-owned drafting, editing, listing, and submission only; submitted cases are visible but there is no officer review or changes-required loop yet.
- Case comments are readable on the detail page, but there is not yet a workflow for officers or admins to add them.
- Missing-documents and open-task areas now surface honest case-aware states, but they are not yet backed by document requirements or task-assignment records.
- The `20260312110000_profile_master_data` database change was applied through Prisma diff and execute commands instead of `migrate dev`; that is valid for the current local setup, but the generated SQL should remain under review because it included column-removal behavior.

## Verification summary
- `docker compose up -d`: passed
- `npm run db:migrate -- --name mobility-case-management`: passed
- `npm run seed`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed
- `npm run test:e2e`: passed
- `npm run build`: passed

## Coverage snapshot
### Covered now
- unit coverage for login and registration validation, profile validation, master-data validation, mobility-case validation, navigation filtering, and shared formatting helpers
- integration coverage for auth service login and registration outcomes, login form behavior, registration form behavior, profile form behavior, and mobility-case create, edit, and submit behavior
- component coverage for anonymous and authenticated home-page states, dashboard panels and role dashboard content, and readable staff case-table rendering
- e2e coverage for live registration endpoint outcome, pending approval, approved login, admin approval, protected-route access control, home, login, authenticated app shell rendering, role-specific dashboard visibility, staff profile editing, admin faculty and department management, staff mobility-case creation, draft editing, submission, own-case list/detail access, and unauthorized admin-edit prevention

### Still uncovered
- direct browser interaction with the `/register` page in Playwright
- rejection and deactivation actions in the admin UI
- session behavior immediately after future role changes or deactivation actions
- academic year, status, select-option, and upload-setting admin flows at the browser level
- officer or admin review actions on submitted cases
- comments creation and review-history authoring on cases
- document upload and download authorization
- reporting and exports

## Milestone tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| M1 Workspace bootstrap and viewable shell | Completed | App shell, auth, status page, testing stack, migration, and seed are in place |
| M2 Data foundation | In progress through current baseline | Core auth, profile, dashboard, master data, and initial mobility-case models exist; document and reporting domain models are still missing |
| M3 Authentication and access control | Completed for current scope | Registration, approval gating, login, role protection, and admin approval page are live |
| M4 Staff identity and dashboard baseline | Completed for current scope | Staff can edit their own profile and see a real dashboard shell with live case-aware summaries |
| M5 Mobility case drafting and submission | Completed for current scope | Staff can create, save drafts, resume, submit, and review their own case details and status history |
| M6 Secure document management | Not started | No upload or storage workflow yet |
| M7 Officer review workflow | In progress through dashboard visibility | Officer and admin dashboards show oversight metrics, but no case-review actions or change loops exist yet |
| M8 Admin controls and master data | In progress through current baseline | Approval/rejection page plus master-data management and admin dashboard actions are live; broader admin controls remain unimplemented |
| M9 Reporting, exports, and archive access | Not started | No reporting or export implementation yet |
| M10 Hardening and release readiness | Not started | Foundation, auth, dashboard, profile, master-data, and mobility-case verification exist; full product hardening remains ahead |

## Next recommended move
Start the officer review and document-management slices so submitted mobility cases can advance beyond the staff-owned draft and submit lifecycle.

## Update template
Use this format for future entries:

### YYYY-MM-DD
- Milestone:
- Change summary:
- Tests run:
- Docs updated:
- Risks or follow-up: