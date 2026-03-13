# Progress Log

## Status snapshot
- Date: March 13, 2026
- Overall phase: Foundation, authentication, staff identity, admin master data, role dashboards, staff mobility-case management, and secure private document handling are implemented; officer review actions, reporting, and broader operational workflows are still pending
- Portal status: Runnable application with production-minded auth, approval gating, editable staff profiles, real role dashboards, admin-managed master data, staff mobility-case drafting and submission, private document storage with version history, and multi-layer automated tests
- Active milestones: M6 completed for the current scope, M7 still limited to dashboard visibility, M8 in progress through the current baseline

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
- Added a structured staff case list and detail experience with formal tables, status badges, status history, comments, recorded-summary panels, and honest empty states where downstream review data did not yet exist.
- Added real draft save and later-resume behavior so staff users can maintain multiple cases in progress.
- Added submission behavior that moves a case into the submitted state and records explicit status-history entries when the workflow changes state.
- Updated the staff dashboard so case overview, status areas, latest comments, and open tasks now consume real case data where available instead of only shell placeholders.
- Updated navigation so the protected shell exposes the case workspace and new-case entry point.
- Added unit coverage for mobility-case validation, integration coverage for create, update, and submit service and form behavior, component coverage for the readable case table, and E2E coverage for draft creation, draft editing, submission, own-case list/detail access, and protected-route enforcement.
- Hardened the mobility-case browser tests by scoping create and edit interactions to explicit form instances after client-side navigation, which removed a real local flake where overlapping route transitions could momentarily expose both forms.

## Secure document handling implemented on March 13, 2026
### What was done
- Added `DocumentReviewState`, `MobilityCaseDocument`, and `MobilityCaseDocumentVersion` to the Prisma schema so case documents now have private metadata, review state, a current-version pointer, and preserved history.
- Added the `20260313122825_secure_document_handling` Prisma migration for private case-document storage and version tracking.
- Added a storage abstraction under `src/lib/storage/` plus a local filesystem driver that writes under the environment-configured storage root and blocks path traversal.
- Added server-side file validation that enforces allowed extensions and maximum upload size from upload settings with environment-based fallback values.
- Added document service logic that stores the original filename, upload timestamp, file metadata, and storage key while preserving previous versions and moving the current-version marker forward.
- Added protected staff upload handling at `/api/staff/cases/[caseId]/documents` with approved-staff checks, ownership enforcement, and case-status transition recording where relevant.
- Added secure private downloads at `/api/documents/versions/[versionId]/download` so every file access passes authentication, approval, and permission checks before reading from storage.
- Integrated required-document panels into the staff case detail page so staff users can see upload policy, version history, current version, and review state for mobility agreements and final certificates of attendance.
- Updated dashboard queries so missing-document areas now use real required-document data from stored case documents instead of placeholder copy.
- Refreshed the local seed data with document-type options and a second approved staff account used for unauthorized-access coverage.
- Added unit coverage for document validation, integration coverage for storage and document-metadata handling, and E2E coverage for upload, later-version upload, current-version marker behavior, and secure download authorization.

### What is intentionally incomplete
- Officer and admin review actions on submitted cases
- Officer or admin comment authoring and change-request loops
- Officer or admin document review decisions that move document review state beyond the default pending-review state
- Reporting, CSV export, archive management, and broader admin operations
- Audit history for master-data changes and document review actions
- Role changes and account deactivation controls in the admin UI
- Password reset, email verification, and richer account recovery flows
- Direct browser interaction with the `/register` page in Playwright

### Risks and follow-up notes
- The current Prisma setup still emits a deprecation warning for `package.json#prisma`; it works now but should move to a dedicated Prisma config before Prisma 7.
- Document upload validation currently relies on filename extension and size limits; it does not yet include MIME verification, content inspection, or malware scanning.
- The v1 storage driver is local filesystem only; the abstraction is in place, but backup, retention, and alternative drivers still need future implementation.
- Document review state is currently visible to staff users, but no officer or admin UI exists yet to accept or reject uploaded versions.
- Negative-path browser tests still trigger expected `CredentialsSignin` logs in Next.js dev mode when pending users are blocked at sign-in.

## Verification summary
- `npm run seed`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run test`: passed
- `npm run test:e2e`: passed
- `npm run build`: passed

## Coverage snapshot
### Covered now
- unit coverage for login and registration validation, profile validation, master-data validation, mobility-case validation, document upload validation, navigation filtering, and shared formatting helpers
- integration coverage for auth service login and registration outcomes, login form behavior, registration form behavior, profile form behavior, mobility-case create/edit/submit behavior, document storage behavior, document versioning, and secure download authorization handling
- component coverage for anonymous and authenticated home-page states, dashboard panels and role dashboard content, and readable staff case-table rendering
- e2e coverage for live registration endpoint outcome, pending approval, approved login, admin approval, protected-route access control, home, login, authenticated app shell rendering, role-specific dashboard visibility, staff profile editing, admin faculty and department management, staff mobility-case creation, draft editing, submission, own-case list/detail access, document upload, version rollover, current-version marker behavior, and unauthorized document download prevention

### Still uncovered
- direct browser interaction with the `/register` page in Playwright
- rejection and deactivation actions in the admin UI
- session behavior immediately after future role changes or deactivation actions
- academic year, status, select-option, and upload-setting admin flows at the browser level
- officer or admin review actions on submitted cases
- officer or admin document review decisions and review-comment authoring
- certificate-of-attendance completion flow after mobility is finished
- storage-missing recovery handling in the UI
- reporting and exports

## Milestone tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| M1 Workspace bootstrap and viewable shell | Completed | App shell, auth, status page, testing stack, migration, and seed are in place |
| M2 Data foundation | In progress through current baseline | Core auth, profile, dashboard, master data, case, and document models exist; reporting and some review-domain models are still missing |
| M3 Authentication and access control | Completed for current scope | Registration, approval gating, login, role protection, and admin approval page are live |
| M4 Staff identity and dashboard baseline | Completed for current scope | Staff can edit their own profile and see a real dashboard shell with live case-aware summaries |
| M5 Mobility case drafting and submission | Completed for current scope | Staff can create, save drafts, resume, submit, and review their own case details and status history |
| M6 Secure document management | Completed for current scope | Private storage, version history, secure download routes, and staff-facing document panels are live |
| M7 Officer review workflow | In progress through dashboard visibility | Officer and admin dashboards show oversight metrics, but no case-review actions or document-review decisions exist yet |
| M8 Admin controls and master data | In progress through current baseline | Approval/rejection page plus master-data management and admin dashboard actions are live; broader admin controls remain unimplemented |
| M9 Reporting, exports, and archive access | Not started | No reporting or export implementation yet |
| M10 Hardening and release readiness | Not started | The foundation and early protected workflows are verified, but full product hardening remains ahead |

## Next recommended move
Implement the officer review slice so submitted cases and uploaded documents can move beyond staff submission into review decisions, requested changes, and explicit document acceptance or rejection.

## Update template
Use this format for future entries:

### YYYY-MM-DD
- Milestone:
- Change summary:
- Tests run:
- Docs updated:
- Risks or follow-up: