# Deployment Readiness Notes

## Purpose
This document records what the current v1 portal already supports for future hosting and what still needs follow-up before a hosted rollout.

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

## Current scope
This repository is ready for reliable local use and for a single-host internal setup. Hosted production rollout work still needs additional operational setup outside the application repository.

## Short-term external sharing
- If you only need to let someone external open the portal briefly, do not treat that as full hosting.
- The current single-machine setup can be exposed temporarily through a public tunnel while the app is running locally.
- That setup should use the production app process on your machine together with the existing local PostgreSQL and local storage setup.
- See [docs/external-sharing.md](/C:/Users/Nico/Documents/Erasmus%20Website/docs/external-sharing.md) for the temporary sharing steps.
