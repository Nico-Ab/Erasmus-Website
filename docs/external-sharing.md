# External Sharing

## Purpose
Use this guide when you want to let someone outside your machine open the portal in a normal browser without paying for hosting.

This setup exposes your locally running portal through a temporary public tunnel. It is suitable for demos, supervisor review, and short evaluation sessions. It is not a permanent hosting setup.

## What this setup does
- keeps PostgreSQL on your machine through Docker
- keeps uploaded files on your machine with the existing local storage driver
- runs the Next.js app on your machine in production mode
- exposes the app through a temporary public URL

The external link only works while your PC is on, Docker is running, the app server is running, and the tunnel is running.

## Recommended tool
The recommended tunnel tool for this repo is Cloudflare Tunnel in temporary-link mode.

Official references:
- [Cloudflare Tunnel overview](https://developers.cloudflare.com/tunnel/)
- [Locally managed tunnel guide](https://developers.cloudflare.com/tunnel/advanced/local-management/create-local-tunnel/)

For the temporary setup in this document, you only need the `cloudflared` client and a public tunnel to your local app port.

## Before you start
1. Make sure Docker Desktop is running.
2. Make sure your `.env` file exists.
3. Make sure `AUTH_SECRET` in `.env` is a strong random value.
4. Keep `AUTH_TRUST_HOST=true`.
5. Keep the machine awake for the whole sharing session.
6. Decide which account the external person should use.

For most demos, use a staff or officer account. Avoid sharing the admin account unless the external person actually needs admin functionality.

## Start the portal for sharing
Use the production build instead of the dev server.

1. Start PostgreSQL:
   `docker compose up -d`
2. If you want a clean demo state:
   `npm run seed`
3. Build the app:
   `npm run build`
4. Start the app:
   `npm run start`
5. Confirm locally that the app loads:
   `http://127.0.0.1:3000`
6. Confirm the status page loads:
   `http://127.0.0.1:3000/status`

Do not use `npm run dev` for external sharing unless you only need a quick internal check. The production start command is calmer and less fragile.

## Start the temporary public tunnel
1. Install `cloudflared` on the Windows host.
2. Open a second terminal window.
3. Start a tunnel to the app:
   `cloudflared tunnel --url http://127.0.0.1:3000`
4. Copy the public URL printed by `cloudflared`.
5. Open that URL in an incognito browser window on your own machine first.
6. If login and navigation work, send the URL to the external user.

Keep the terminal with `cloudflared` open. If you close it, the public link stops working.

## Validation before sending the link
Check these from the public tunnel URL, not only from localhost:
1. Home page opens.
2. Login page opens.
3. The assigned account can sign in.
4. The user reaches the expected dashboard area.
5. If the session includes uploads, test one upload and one download.

## Optional APP_URL update
The repo currently uses `APP_URL` for environment reporting and related runtime context. For a temporary sharing session, you can leave it as `http://127.0.0.1:3000` if you want the fastest setup.

If you want the status page to show the public URL instead:
1. update `APP_URL` in `.env` to the current tunnel URL
2. restart the app server

Because temporary tunnel URLs change between sessions, this is optional and only useful if you want the status page to reflect the shared link during that one session.

## Recommended account handling
- Use seeded demo accounts only for controlled review sessions.
- Prefer a dedicated non-admin account when the external person only needs to review the normal user experience.
- Treat uploads and workflow actions as real data changes. Anything they create, upload, approve, reject, archive, or export affects your local dataset.
- Rerun `npm run seed` before the session if you want a predictable demo state.

## During the sharing session
Leave all of these running:
- Docker Desktop
- PostgreSQL container
- `npm run start`
- `cloudflared tunnel --url http://127.0.0.1:3000`

Also keep the machine:
- awake
- connected to the internet
- on the same tunnel session

If the tunnel restarts, the URL may change and you must send the new link.

## Stop sharing
When the session is over:
1. stop the tunnel process
2. stop the app server
3. optionally stop PostgreSQL:
   `docker compose down`

## Limitations
- This is not a permanent deployment.
- The URL is temporary and may change between runs.
- If your PC sleeps, restarts, or loses internet, the link stops working.
- Uploaded files stay on your machine because storage is local filesystem only in v1.
- This setup is suitable for short-term review, not for long-term external availability.

## Better later options
If you want something cleaner later without changing the app itself:
- use a named Cloudflare Tunnel with a domain you already own
- move from local disk storage to persistent external storage
- move PostgreSQL off the local machine

Those are later hosting steps, not required for temporary sharing.
