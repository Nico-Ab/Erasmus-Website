# AGENTS.md

## Project goal
Build a production-minded internal Erasmus staff mobility portal for university staff, officers, and admins.

## Working style
- Use TypeScript everywhere.
- Keep code explicit, maintainable, and production-minded.
- Prefer small reusable modules over large files.
- Avoid shortcuts that make future hosting or maintenance harder.
- Do not invent requirements that are not in the project docs.

## Comments
- Do not add AI-style comments.
- Do not add banner comments or tutorial-style comments.
- Comments must be brief, human, and only where they add real value.

## UI direction
- Formal university administration style.
- Calm, structured, professional.
- Not playful, not flashy, not startup-like.
- Prioritize readability, tables, forms, and clear status indicators.
- Use the SWU site only as tone/style inspiration, not as something to clone.

## Security and access
- Use server-side authorization checks for all protected actions.
- Staff users must only access their own cases and documents.
- Officers can manage cases.
- Admins can manage users, master data, and settings.
- Never expose uploaded files from a public folder.
- Downloads must always go through permission checks.

## Data and storage
- Keep environment-based configuration only.
- Do not hardcode machine-specific paths.
- Preserve document version history.
- Use a storage abstraction so local disk storage can later be replaced cleanly.

## Quality gates
- Run lint before finishing.
- Run typecheck before finishing.
- Run relevant tests when available.
- Update docs when setup, env, or schema changes.
- Summarize what changed and any remaining risks.

## Out of scope for v1
- No EWP integration.
- No public Erasmus portal.
- No digital signature workflow.
- No cloud-only dependencies.