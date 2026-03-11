docker compose up -d
docker ps

# SWU Erasmus Staff Mobility Portal

Internal Erasmus+ staff mobility management portal for university staff, officers, and admins.

## Goal
Build a local-first, production-minded internal portal that supports:
- staff registration and approval
- profile management
- mobility case creation and submission
- secure document upload and versioning
- officer review workflows
- admin management
- reporting and CSV export
- searchable archival records

## Current stage
Repository setup and project guidance.

## Planned stack
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Tailwind
- shadcn/ui
- Zod
- React Hook Form

## Local setup
1. Copy `.env.example` to `.env`
2. Start PostgreSQL:
   - `docker compose up -d`
3. Verify the database container is running:
   - `docker ps`

## Important repo guidance
- Project instructions live in `AGENTS.md`
- Product requirements live in `docs/requirements.md`
- UI style guidance lives in `docs/ui-style.md`
- Architecture guidance lives in `docs/architecture-notes.md`
- Status rules live in `docs/status-model.md`

## Rules
- Keep the project local-first
- Keep storage private
- Use environment variables
- Keep code maintainable
- Avoid AI-style comments