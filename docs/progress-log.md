# Progress Log

## Status snapshot
- Date: March 13, 2026
- Overall phase: Foundation, authentication, staff identity, admin master data, role dashboards, staff mobility-case management, secure private document handling, and officer review workflow are implemented for the current scope; reporting, exports, and broader operational workflows are still pending
- Portal status: Runnable application with production-minded auth, approval gating, editable staff profiles, real role dashboards, admin-managed master data, staff mobility-case drafting and submission, private document storage with version history, officer review actions, and multi-layer automated tests
- Active milestones: M7 completed for the current scope, M8 remains in progress through the current baseline, M9 has only an archive-searchability baseline and no reporting surface yet

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

## Officer review workflow implemented on March 13, 2026
### What was done
- Added a protected officer review register at `/dashboard/officer/cases` with server-side combinable filters for status, academic year, faculty, department, mobility type, country, host institution, and free-text search.
- Added a protected officer case detail page at `/dashboard/officer/cases/[caseId]` with a scanning-oriented layout for case summary, staff context, document review, comments, and status history.
- Added server-side review APIs for case status transitions, officer comments, document review decisions, and missing-document notes under `/api/review/cases/...`.
- Kept document review state and case workflow state separate so accepting or rejecting a document never silently changes the case status.
- Reused the explicit `MobilityCaseStatusHistory` model for every officer-driven status transition and tightened the workflow rules so draft cases cannot enter review, archived cases cannot re-enter the active workflow, and only completed cases can be archived.
- Added officer and admin authorization guards for review APIs and review pages so sensitive actions remain protected server-side.
- Added structured officer comments that show author identity, role label, and timestamp on the case detail page.
- Added document review actions for accepting or rejecting the current document version, including required rejection reasons and reviewer metadata shown back to staff users.
- Added missing-document actions for required document types that are still absent from a case record, with the v1 implementation recording a clear officer comment instead of inventing a separate request workflow.
- Added archive support for completed cases while keeping archived cases visible in the searchable review register.
- Updated navigation and dashboard call-to-actions so officers and admins can reach the live review register from the existing app shell.
- Added integration coverage for status transitions, comment creation, document review actions, and missing-document handling.
- Added E2E coverage for opening and reviewing a submitted case, changing status, adding comments, rejecting a document with a reason, archiving a completed case, and applying combined filters.

### What is intentionally incomplete
- Bulk review actions, assignment queues, and pagination for larger officer workloads
- Reporting, CSV export, and broader archive-management surfaces
- Audit history for master-data changes and document review actions beyond the recorded reviewer metadata and case status history
- Role changes and account deactivation controls in the admin UI
- Password reset, email verification, and richer account recovery flows
- Direct browser interaction with the `/register` page in Playwright
- A dedicated structured change-request model for missing or incorrect documents beyond officer comments and document review state

### Risks and follow-up notes
- The current Prisma setup still emits a deprecation warning for `package.json#prisma`; it works now but should move to a dedicated Prisma config before Prisma 7.
- Document upload validation currently relies on filename extension and size limits; it does not yet include MIME verification, content inspection, or malware scanning.
- The v1 storage driver is local filesystem only; the abstraction is in place, but backup, retention, and alternative drivers still need future implementation.
- Rejected documents and case statuses are intentionally separate, which preserves audit clarity but means officers must still record an explicit case-status transition when a case needs changes.
- Missing-document and incorrect-document follow-up is currently comment-driven; a richer requested-changes workflow can be added later without replacing the current review record.
- The officer review register is optimized for current local-scale use and does not yet include pagination, saved views, or export actions.
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
- unit coverage for login and registration validation, profile validation, master-data validation, mobility-case validation, document upload validation, navigation filtering, review-workflow filter validation, and shared formatting helpers
- integration coverage for auth service login and registration outcomes, login form behavior, registration form behavior, profile form behavior, mobility-case create, edit, and submit behavior, document storage behavior, document versioning, secure download authorization handling, officer status transitions, officer comment creation, document review decisions, and missing-document review actions
- component coverage for anonymous and authenticated home-page states, dashboard panels and role dashboard content, and readable staff case-table rendering
- e2e coverage for live registration endpoint outcome, pending approval, approved login, admin approval, protected-route access control, home, login, authenticated app shell rendering, role-specific dashboard visibility, staff profile editing, admin faculty and department management, staff mobility-case creation, draft editing, submission, own-case list and detail access, document upload, version rollover, current-version marker behavior, unauthorized document download prevention, officer case review, officer comments, officer document rejection, officer status changes, archive visibility, and combined review filters

### Still uncovered
- direct browser interaction with the `/register` page in Playwright
- rejection and deactivation actions in the admin UI
- session behavior after future role changes or account deactivation
- academic year, status, select-option, and upload-setting management flows in browser coverage
- bulk officer review actions and larger-list pagination behavior
- structured requested-changes workflows beyond comments and document review states
- certificate-of-attendance completion flow after mobility is finished
- storage-missing recovery handling through the UI
- reporting and CSV export behavior
- audit-sensitive server actions in later workflow modules

## Milestone tracker
| Milestone | Status | Notes |
| --- | --- | --- |
| M1 Workspace bootstrap and viewable shell | Completed | App shell, auth, status page, testing stack, migration, and seed are in place |
| M2 Data foundation | In progress through current baseline | Core auth, profile, dashboard, master data, case, document, and review models exist; reporting and some operational models are still missing |
| M3 Authentication and access control | Completed for current scope | Registration, approval gating, login, role protection, and admin approval page are live |
| M4 Staff identity and dashboard baseline | Completed for current scope | Staff can edit their own profile and see a real dashboard shell with live case-aware summaries |
| M5 Mobility case drafting and submission | Completed for current scope | Staff can create, save drafts, resume, submit, and review their own case details and status history |
| M6 Secure document management | Completed for current scope | Private storage, version history, secure download routes, and staff-facing document panels are live |
| M7 Officer review workflow | Completed for current scope | Officers and admins can filter, review, comment on, change status for, review documents on, and archive cases from the live review register |
| M8 Admin controls and master data | In progress through current baseline | Approval and rejection, master-data management, and admin dashboard actions are live; broader admin controls remain unimplemented |
| M9 Reporting, exports, and archive access | In progress through archive-search baseline | Archived cases remain searchable in the review register, but there is no reporting or export surface yet |
| M10 Hardening and release readiness | Not started | The foundation and early protected workflows are verified, but full product hardening remains ahead |

## Next recommended move
Implement reporting and export surfaces, then add a richer requested-changes loop so officer review can move cases through correction cycles without relying only on comments and manual status changes.

## Update template
Use this format for future entries:

### YYYY-MM-DD
- Milestone:
- Change summary:
- Tests run:
- Docs updated:
- Risks or follow-up: