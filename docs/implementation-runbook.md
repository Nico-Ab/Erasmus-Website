# Implementation Runbook

## Purpose
This runbook defines how future implementation work should be executed so the project stays aligned with `AGENTS.md` and the project docs.

## Coding rules
- Use TypeScript for all application code, scripts, and shared modules where practical.
- Prefer explicit models, named functions, and small reusable modules over large files.
- Do not invent requirements beyond `docs/requirements.md`, `docs/ui-style.md`, `docs/architecture-notes.md`, and `docs/status-model.md`.
- Keep comments brief and human. Add them only where they clarify non-obvious behavior.
- Keep the authenticated UI calm, structured, and administration-focused.
- Prefer readable tables, forms, filter bars, status badges, and review panels over decorative UI.
- Put server-side authorization checks on every protected action and protected file access path.
- Do not rely on client-only route protection for sensitive data.
- Do not place uploaded files in a public folder.
- Keep storage behind an abstraction so local disk can later be replaced without rewriting business logic.
- Use environment-based configuration only.
- Do not hardcode machine-specific paths.
- Preserve document version history and explicit status history.
- Keep audit behavior explicit for important actions.

## Work sequence
1. Check the current milestone and confirm the task fits it.
2. Review the relevant guidance documents before changing behavior.
3. Implement the smallest slice that produces real forward progress.
4. Add or update tests in the same task whenever behavior changes.
5. Verify local observability still works.
6. Update documentation if setup, environment, schema, or workflow changed.
7. Close the task only after the done checklist is satisfied.

## Task done checklist
Use this checklist for every future implementation task.

- Scope matches the active milestone or an intentional prerequisite for it.
- Code is maintainable and split into sensible modules.
- Types, validation, and failure states are handled explicitly.
- Protected behavior is checked on the server.
- File access stays private and permission-checked if documents are involved.
- No machine-specific paths, secrets, or one-off local assumptions are added.
- Relevant automated tests are added or updated.
- Local manual verification is recorded for visible behavior.
- Lint passes.
- Typecheck passes.
- Relevant docs are updated.
- Remaining risks or follow-up work are noted before the task is closed.

## Local observability runbook
The portal should be inspectable before all features are complete.

Minimum observability standards:
- A visible app shell must exist early and remain usable even when modules are incomplete.
- Health or status routes should report:
  - app boot status
  - database connectivity status
  - storage driver name
  - migration or seed readiness where appropriate
- Development seed data should make tables, filters, and status badges reviewable early.
- Logs should be readable locally for requests, auth events, workflow events, and protected file access attempts.
- Empty states should explain what is missing rather than showing blank screens.
- Feature work should prefer incremental visibility over hidden unfinished branches.

## Testing expectations by change type
- UI-only styling or layout changes: lint, typecheck, and manual responsive check.
- Form or validation changes: lint, typecheck, validation tests, and manual negative-path checks.
- Database changes: lint, typecheck, schema validation, migration verification, and affected query tests.
- Authorization changes: lint, typecheck, authorization regression tests, and manual role checks.
- Document handling changes: lint, typecheck, upload or download authorization tests, and manual version-history checks.
- Reporting changes: lint, typecheck, query correctness tests, export verification, and manual filter checks.

## Definition of ready for major feature work
Before a major feature begins, the following should already exist or be created as part of the first task in that feature area:
- data model support for the feature
- route or page placement in the app shell
- authorization plan for who can view and act
- validation plan
- observability plan for empty, success, and failure states
- test plan tied to the relevant milestone acceptance criteria

## Repo gaps to address first
Current blockers that must be resolved as implementation begins:
- no `package.json` or package manager lockfile
- no Next.js application scaffold
- no TypeScript configuration
- no lint or typecheck configuration
- no test runner or test configuration
- no Prisma schema or migrations
- no seed workflow
- no auth or session implementation
- no shared UI or component baseline
- no health or observability surface yet

## Documentation update rule
Update docs in the same change when any of the following happen:
- setup steps change
- environment variables change
- schema or migrations change
- workflow or status behavior changes
- role permissions change
- report definitions change