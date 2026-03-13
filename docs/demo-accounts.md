# Demo Accounts

## Purpose
These seeded accounts support local demos, manual QA, and automated tests.

## Accounts
| Role or State | Email | Password | Intended use |
| --- | --- | --- | --- |
| Admin | `admin@swu.local` | `AdminPass123!` | user lifecycle, master data, settings, audit log, reports |
| Officer | `officer@swu.local` | `OfficerPass123!` | case review, document review, comments, archive, reports |
| Staff | `staff@swu.local` | `StaffPass123!` | profile editing, draft case editing |
| Staff 2 | `staff2@swu.local` | `StaffTwoPass123!` | submitted-case review scenarios and cross-user access checks |
| Pending | `pending@swu.local` | `PendingPass123!` | pending-approval behavior |
| Rejected | `rejected@swu.local` | `RejectedPass123!` | rejected-account behavior |
| Deactivated | `deactivated@swu.local` | `DeactivatedPass123!` | deactivated-account behavior |

## Seeded demo records
- one draft staff case for `staff@swu.local`
- one submitted staff case for `staff2@swu.local`
- seeded academic years, faculties, departments, statuses, document types, upload settings, and report settings
- one seeded officer comment on the submitted case

## Notes
- The seed script uses upserts so these records can be refreshed with `npm run seed`.
- The demo accounts are for local development only and must not be used outside local or controlled test environments.
