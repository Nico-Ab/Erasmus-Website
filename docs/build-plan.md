# Build Plan

## Purpose
This document breaks the portal into implementation milestones that are small enough to execute safely, while still supporting a long-horizon delivery of the full v1 scope described in the repository guidance.

This plan does not claim the portal is complete. It defines the sequence for building it.

## Current baseline
As of March 11, 2026, the repository contains:
- product, UI, architecture, and status guidance
- `.env.example` with app, database, auth, and storage settings
- `docker-compose.yml` for local PostgreSQL
- empty `src/`, `prisma/`, `public/`, and `storage/` directories

The repository does not yet contain the runnable application, database schema, or developer toolchain. Those gaps are treated as milestone work, not ignored assumptions.

## Planning principles
- Use TypeScript everywhere.
- Build small, explicit modules with clear responsibilities.
- Follow only the requirements in the project docs.
- Keep protected logic on the server.
- Keep uploaded files private and accessed only through authorization checks.
- Keep all configuration environment-driven.
- Preserve the option to replace local file storage later through a storage abstraction.
- Make the app viewable early so implementation feedback starts before major workflows are finished.

## Local observability and early visibility
The app should become locally viewable in the first milestone and progressively more inspectable after that.

Required observability track:
- A minimal authenticated and unauthenticated UI shell must render early.
- A health/status surface must show app boot state, database reachability, and storage configuration state without exposing secrets.
- Seed or fixture data must exist early enough to let pages, filters, and status badges be reviewed before real workflows are finished.
- Request logging must be readable in local development.
- Key domain events must be auditable once workflow milestones begin:
  - registration approval or rejection
  - case creation and submission
  - status changes
  - document upload and review actions
  - downloads of protected files
- Empty states must be deliberate so unfinished modules still present a usable interface.

## Milestone sequence
| Milestone | Goal | Main outcome | Notes |
| --- | --- | --- | --- |
| M1 | Workspace bootstrap and viewable shell | Runnable Next.js + TypeScript app with lint/typecheck, base layout, health/status page, and placeholder role-aware navigation | First visible checkpoint |
| M2 | Data foundation | Prisma schema, initial migrations, seed strategy, storage abstraction contract, and core domain tables | No business workflow yet |
| M3 | Authentication and access control | Registration, login, approval gating, session handling, and role-based server authorization | Protects all later work |
| M4 | Staff identity and dashboard baseline | Profile management, approved staff dashboard, and case/task overview skeleton backed by real data | First end-user productivity slice |
| M5 | Mobility case drafting and submission | Draft creation, editing, validation, submission, and status history initiation | Starts primary case lifecycle |
| M6 | Secure document management | Private uploads, versioned documents, review states, current-version handling, and authorized downloads | Must not use public file serving |
| M7 | Officer review workflow | Officer case queues, filters, comments, document review, status changes, and correction loops | Core operational workflow |
| M8 | Admin controls and master data | User administration, master data management, settings management, and deactivation flows | Supports operational governance |
| M9 | Reporting, exports, and archive access | Filtered reporting views, CSV export, archived case access, and search hardening | Delivers administrative reporting scope |
| M10 | Hardening and release readiness | Audit coverage review, security review, UX cleanup, test expansion, setup docs, and deployment readiness checks | Close v1 implementation responsibly |

## Milestone details

## M1: Workspace bootstrap and viewable shell
- Scaffold the application with Next.js and strict TypeScript.
- Add lint, typecheck, and test command structure.
- Establish the base app layout, navigation shell, typography, spacing, and restrained status badge style from `docs/ui-style.md`.
- Add a local health/status page and a clear empty-state approach.
- Add minimal placeholder screens for staff, officer, and admin sections so the app is reviewable early.

## M2: Data foundation
- Model users, roles, profiles, cases, status history, documents, document versions, reviews, comments, master data, system settings, and audit events.
- Create initial Prisma migration files.
- Add seed data for master data and development visibility.
- Define a storage abstraction with a local implementation rooted in environment configuration.
- Establish shared validation schemas and domain constants, including the case status model from `docs/status-model.md`.

## M3: Authentication and access control
- Implement secure registration and login flow.
- Add approval gating for new staff accounts.
- Add role-aware routing and server-side authorization checks.
- Protect protected actions and downloads with server checks.
- Add session handling and auth-related audit events.

## M4: Staff identity and dashboard baseline
- Implement profile edit flow for required staff fields.
- Build a staff dashboard with own cases, latest comments, missing documents, and open tasks.
- Add dashboard summaries using real queries, not fake placeholders.
- Ensure approved staff can only access their own cases and documents.

## M5: Mobility case drafting and submission
- Implement case create, edit, save draft, continue later, and submit flows.
- Validate required fields and date logic.
- Create the initial status history behavior for draft and submitted states.
- Add staff-facing case detail and list views with clear state indicators.

## M6: Secure document management
- Implement document upload validation for type and size.
- Preserve original filename, upload timestamp, current version marker, and version history.
- Keep files outside public serving paths.
- Implement secure download endpoints with permission checks.
- Add document review state and comments without overwriting case history.

## M7: Officer review workflow
- Implement officer queues and searchable/filterable case lists.
- Add officer review pages with case context, document context, comments, and status transition controls.
- Support changes-required loops and clear feedback to staff.
- Make status history and document review history visible and auditable.

## M8: Admin controls and master data
- Implement approval and rejection of registrations.
- Implement role changes and account deactivation.
- Implement management screens for faculties, departments, academic years, statuses, and other select lists.
- Implement settings screens for upload limits, file formats, storage paths, and reporting options.

## M9: Reporting, exports, and archive access
- Implement reporting views for required counts and open/completed slices.
- Implement CSV export for filtered case lists and summary views.
- Preserve archive visibility and exportability.
- Harden search and filter combinations for administrative use.

## M10: Hardening and release readiness
- Review audit coverage against requirements.
- Expand automated coverage around critical authorization and workflow paths.
- Validate empty states, validation states, error handling, and responsive behavior.
- Finalize setup documentation and environment documentation.
- Prepare deployment-minded configuration without adding cloud-only dependencies.

## Dependency rules
- M3 depends on M1 and M2.
- M4 depends on M3.
- M5 depends on M3 and M4.
- M6 depends on M2, M3, and M5.
- M7 depends on M5 and M6.
- M8 depends on M3 and M2.
- M9 depends on M5 through M8.
- M10 depends on all earlier milestones.

## Exit condition for each milestone
A milestone is only complete when:
- its acceptance criteria are met
- required tests pass
- relevant docs are updated
- local observability remains usable
- no protected behavior relies on client-only checks
- no new machine-specific configuration is introduced