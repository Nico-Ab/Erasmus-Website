# Local Startup

## Purpose
Use this guide to start the v1 portal locally with PostgreSQL, demo data, and private file storage.

## Prerequisites
- Node.js 24+ installed on the host machine
- Docker Desktop installed and running
- a copy of `.env.example` saved as `.env`

## First-time startup
1. Start PostgreSQL:
   `docker compose up -d`
2. Install dependencies:
   `npm install`
3. Apply existing migrations:
   `npm run db:migrate`
4. Seed demo data:
   `npm run seed`
5. Start the app:
   `npm run dev`
6. Open:
   `http://127.0.0.1:3000`

## Repeat startup
If dependencies and migrations are already in place:
1. `docker compose up -d`
2. `npm run seed`
3. `npm run dev`

## Local checks
- App home page: `http://127.0.0.1:3000`
- Local status page: `http://127.0.0.1:3000/status`
- Health endpoint: `http://127.0.0.1:3000/api/health`

## Environment values used locally
- `APP_URL=http://127.0.0.1:3000`
- `DATABASE_URL=postgresql://swu_admin:change_me_now@localhost:5432/swu_erasmus`
- `STORAGE_DRIVER=local`
- `STORAGE_LOCAL_ROOT=./storage`

## Database notes
- The database container name is `swu-erasmus-db`.
- PostgreSQL is exposed locally on port `5432`.
- `npm run db:migrate` applies the committed Prisma migrations for local development.
- `npm run seed` upserts demo users, master data, settings, and sample cases.

## Storage notes
- Uploaded files are written under the configured storage root.
- The default local storage root is `./storage`.
- Files remain private and are served only through permission-checked routes.

## Common local reset path
If you want to refresh the local dataset without removing the database volume:
1. `npm run seed`

If you want to rebuild the database container from scratch:
1. stop the app
2. remove the database volume through Docker Desktop or Docker CLI
3. run the first-time startup sequence again

## Troubleshooting
- If `npm` is not recognized, Node.js is not installed on the host PATH.
- If port `5432` is busy, another PostgreSQL instance is already using it.
- If port `3000` is busy, stop the previous Next.js process before running `npm run dev`.

