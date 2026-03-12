# Acceptance Criteria

## Purpose
This document defines the acceptance criteria and minimum testing expectations for each milestone in `docs/build-plan.md`.

No milestone should be treated as complete because pages exist visually. Completion requires working behavior, authorization checks, and test evidence appropriate to the scope.

## Global task done criteria
Every future task must satisfy all applicable items below before it is marked done.

- Requirements match repository docs and do not introduce unapproved scope.
- TypeScript types are explicit enough to keep behavior maintainable.
- Authorization is enforced on the server for protected reads and writes.
- Validation and error states are implemented where user input or state changes occur.
- Uploaded files, if involved, remain private and are never moved into public serving paths.
- Environment variables are used for configuration rather than hardcoded local paths or secrets.
- Lint passes.
- Typecheck passes.
- Relevant tests are added or updated.
- Relevant docs are updated when setup, schema, workflow, or environment behavior changes.
- The UI stays aligned with the formal administrative style in `docs/ui-style.md`.
- The feature is observable locally through meaningful empty states, seeded data, status surfaces, or logs.

## M1: Workspace bootstrap and viewable shell
### Acceptance criteria
- `package.json` exists with runnable scripts for dev, lint, typecheck, and test.
- The app runs locally and renders a serious institutional shell rather than a marketing-style placeholder.
- A shared layout exists for authenticated pages and public auth pages.
- A health or status page reports basic boot information without exposing secrets.
- Placeholder navigation exists for staff, officer, and admin areas.
- Basic error and empty-state patterns are visible and reusable.

### Must test
- Lint command passes.
- Typecheck command passes.
- Smoke test for home or entry route render.
- Smoke test for health or status route render.
- Manual check of desktop layout and narrow-width behavior.

## M2: Data foundation
### Acceptance criteria
- Prisma schema exists and covers users, profiles, roles, cases, comments, status history, documents, document versions, reviews, settings, master data, and audit events.
- Initial migrations are committed.
- Seed workflow exists for development data and required master data.
- Storage abstraction is defined with a local implementation driven by environment configuration.
- Shared domain constants and validation schemas exist for the status model and major entities.

### Must test
- Lint command passes.
- Typecheck command passes.
- Prisma schema validation passes.
- Migration creation and apply flow works locally.
- Seed command populates a usable local dataset.
- Automated tests for key domain validation helpers.

## M3: Authentication and access control
### Acceptance criteria
- Staff can register with email and password.
- Newly registered staff remain approval-gated until an admin approves them.
- Login works only for allowed account states.
- Role-based access control is enforced on the server for protected routes and actions.
- Unauthorized users cannot access protected case or document operations.
- Auth and approval actions generate audit records.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for password handling and auth validation logic.
- Automated tests for authorization guards on representative staff, officer, and admin actions.
- Manual test for registration, login, rejection, approval, and logout flow.

## M4: Staff identity and dashboard baseline
### Acceptance criteria
- Approved staff can edit required profile fields.
- Staff dashboard shows only the signed-in staff member's data.
- Dashboard surfaces own cases, missing documents, latest comments, and open tasks.
- Empty states remain readable for new users with no cases.
- Dashboard queries use real persistence and do not depend on hardcoded mock values.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for staff-only data scoping.
- Automated tests for profile validation.
- Manual test for new user with no cases and existing user with seeded cases.

## M5: Mobility case drafting and submission
### Acceptance criteria
- Approved staff can create multiple cases.
- Cases can be saved as drafts and resumed later.
- Submission validates required fields and date logic.
- Case status history is created explicitly and includes draft and submitted transitions.
- Staff case list and detail views show accurate current status and timestamps.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for case validation rules.
- Automated tests for draft save, edit, and submit transitions.
- Automated tests for status history creation.
- Manual test for creating multiple cases and resuming an incomplete draft.

## M6: Secure document management
### Acceptance criteria
- Supported document types can be uploaded within configured size limits.
- Original filename, upload timestamp, current version marker, and previous versions are preserved.
- Files are stored through the storage abstraction and are not publicly served.
- Staff can download only their own authorized current or historical documents.
- Officers and admins can access documents only through permitted review flows.
- Document review state and comments exist without silently overwriting case status history.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for upload validation rules.
- Automated tests for storage abstraction behavior with local driver.
- Automated tests for download authorization.
- Manual test for replacement upload creating a new version instead of overwriting history.

## M7: Officer review workflow
### Acceptance criteria
- Officers can search and filter cases by the required fields from `docs/requirements.md`.
- Officers can review case details, document status, and history in one workflow.
- Officers can leave comments and request changes.
- Officers can transition case statuses according to the status model.
- Staff can see officer comments and updated states after officer actions.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for officer-only actions and status transition rules.
- Automated tests for combined filters on case lists.
- Automated tests for comment creation and visibility scoping.
- Manual test for a full changes-required review loop.

## M8: Admin controls and master data
### Acceptance criteria
- Admins can approve or reject registrations.
- Admins can change roles and deactivate users.
- Admins can manage faculties, departments, academic years, statuses, and other select lists.
- Admins can manage settings for upload limits, file formats, storage paths, and reporting display options.
- Changes made through admin screens affect downstream workflows without code edits.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for admin-only authorization.
- Automated tests for master data validation and duplicate handling.
- Automated tests for settings persistence and read paths.
- Manual test for changing a master data value and confirming it appears in case forms or reports.

## M9: Reporting, exports, and archive access
### Acceptance criteria
- Reporting views cover the required count and grouping slices.
- CSV export works for filtered case lists and summary views.
- Archived cases remain searchable, viewable to authorized users, and exportable.
- Search supports combined filters and remains usable on realistic seeded data volumes.

### Must test
- Lint command passes.
- Typecheck command passes.
- Automated tests for reporting query correctness on seeded fixtures.
- Automated tests for CSV export shape and authorization.
- Automated tests confirming archived records remain queryable.
- Manual test for officer and admin export workflows.

## M10: Hardening and release readiness
### Acceptance criteria
- Critical user journeys are covered by automated smoke or end-to-end tests.
- Authorization and private file access have explicit regression coverage.
- Audit coverage is reviewed against the documented requirements.
- Setup and environment documentation match the runnable project.
- The app can be started locally from a clean checkout with the documented steps.

### Must test
- Lint command passes.
- Typecheck command passes.
- Full automated test suite passes.
- End-to-end smoke coverage passes for registration, login, case submission, document upload, review, and export.
- Manual sanity pass of UI readability, validation clarity, and role-based navigation.