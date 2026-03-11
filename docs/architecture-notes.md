# Architecture Notes

## Preferred stack
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Tailwind
- shadcn/ui
- Zod
- React Hook Form

## Architecture direction
Use a production-minded full-stack web app architecture that runs locally and can later be deployed with minimal structural changes.

## Core modules
- auth and session handling
- role-based access control
- user profiles
- master data
- mobility cases
- case comments
- status history
- documents
- document versions
- document reviews
- reporting
- CSV export
- audit log
- system settings

## Storage
- uploaded files must not live in a public folder
- local disk storage for v1 is fine
- storage must be wrapped behind an abstraction
- storage path must come from environment variables

## Database principles
- use normalized relations where it improves clarity
- document versions must be separate from the document entity
- status history must be stored explicitly
- audit logging must be explicit, not inferred only from timestamps

## Security principles
- authorization checks on the server
- least privilege by role
- no client-only protection for sensitive actions
- secure file download flow