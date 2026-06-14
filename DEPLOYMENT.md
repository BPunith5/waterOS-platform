# Deployment Guide

WaterOS Platform deploys as three pieces:

- **MongoDB Atlas** — shared database for dev and prod
- **Backend** (NestJS) — Railway or Render
- **Frontend** (Vite/React) — Vercel

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Create a database user (username/password).
3. Network Access → Add IP Address → `0.0.0.0/0` (allow access from anywhere, required for Railway/Render egress IPs).
4. Copy the connection string, e.g.:
   ```
   mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/waterOS?retryWrites=true&w=majority
   ```
   This becomes `MONGO_URI`. Once `MONGO_URI` is set, the backend connects to Atlas instead of the in-memory dev database (see `backend/src/app.module.ts`).

## 2. Backend — Railway or Render

Both platforms build from the `backend/` directory using `npm run build` (→ `dist/main.js`) and start with `npm run start:prod`.

### Railway

1. New Project → Deploy from GitHub repo.
2. Set **Root Directory** to `backend` (Railway reads `backend/railway.toml` for build/start commands).
3. Add environment variables:
   - `MONGO_URI` — Atlas connection string from step 1
   - `JWT_SECRET` — random 64-char hex (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `JWT_EXPIRES_IN` — `7d`
   - `CLIENT_URL` — your Vercel frontend URL, e.g. `https://waveros-platform.vercel.app`
   - `PORT` — Railway sets this automatically; `main.ts` reads `process.env.PORT`.
4. Deploy. Note the generated public URL, e.g. `https://waveros-backend.up.railway.app`.

### Render (alternative)

1. New → Blueprint → point at this repo (`render.yaml` at the repo root configures the `backend` service with `rootDir: backend`).
2. Fill in the `sync: false` env vars in the Render dashboard: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.
3. Deploy. Note the generated public URL, e.g. `https://waveros-backend.onrender.com`.

## 3. Frontend — Vercel

1. New Project → import this repo.
2. Set **Root Directory** to `frontend`.
3. Build command `npm run build`, output directory `dist` (Vercel auto-detects Vite). `frontend/vercel.json` adds the SPA rewrite so client-side routes don't 404 on refresh.
4. Environment variables:
   - `VITE_API_URL` — `https://<your-backend-url>/api`
   - `VITE_SOCKET_URL` — `https://<your-backend-url>`
5. Deploy. Note the generated URL, e.g. `https://waveros-platform.vercel.app`.

## 4. Close the loop

Go back to the backend service and set `CLIENT_URL` to the Vercel URL from step 3 (if not already set), then redeploy so CORS and the Socket.IO gateway accept requests from the production frontend.

## 5. Verify

- Visit the Vercel URL → register a new account → login persists on refresh.
- Add a tank, register + connect a device → telemetry simulation starts and the dashboard updates live (Socket.IO upgrades to `wss://` — check the browser Network tab for a `101 Switching Protocols` on the socket connection, no CORS errors in the console).
- Trigger an alert (e.g. wait for a simulated low-battery/level reading) and confirm the toast + `/alerts` page update in real time.

## Local development env files (reference)

`backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/waterOS?retryWrites=true&w=majority
JWT_SECRET=<random-64-char-hex>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

`frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Leaving `MONGO_URI` unset in `backend/.env` falls back to an in-memory MongoDB instance (`mongodb-memory-server`) — convenient for local development but not persistent.
