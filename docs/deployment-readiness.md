# Deployment Readiness Notes

## Purpose
This document records what the current v1 portal already supports for future hosting and what still needs deliberate follow-up before a hosted rollout.

## What is already in place
- environment-based configuration
- committed Prisma migrations
- deployment-style migration command through `npm run db:migrate:deploy`
- production build and start scripts
- server-side authorization for protected actions
- private document access through guarded routes
- audit logging for important workflow actions
- automated lint, typecheck, unit, integration, component, and E2E coverage

## Hosting requirements for later
- provision PostgreSQL and set `DATABASE_URL`
- set a strong `AUTH_SECRET`
- set the correct public `APP_URL`
- provide persistent private storage for uploaded files
- run `npm run db:migrate:deploy` during deployment
- run `npm run build` and serve the Next.js production build with `npm run start`
- place the app behind a reverse proxy or hosting platform that handles TLS

## Storage readiness notes
- The storage abstraction is ready for a future driver swap.
- The current local filesystem driver is fine for local use and single-host evaluation.
- Multi-instance hosting should not rely on instance-local disk for shared uploaded documents.

## Operational follow-up still needed before a hosted rollout
- backup and restore procedures for database and document storage
- upload content inspection or malware scanning
- retention and cleanup strategy for private files
- monitoring, log shipping, and alerting
- password reset or account recovery flows if required by operations
- pagination, saved views, and workload controls for larger operational queues

## Honest scope boundary
This repository is ready as a locally runnable v1 portal baseline. These notes exist to reduce future hosting uncertainty, not to claim that hosted production rollout work is already complete.
