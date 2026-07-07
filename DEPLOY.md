# Deploy

Two apps: `wardrobe-api` (NestJS) and `wardrobe-web` (Next.js). Data lives in Supabase (Postgres + Storage + Auth).

## 1. Supabase (once)
1. Create a Supabase project.
2. **Auth** — enable Email provider (email/password).
3. **Storage** — create a public bucket named `items` (or set `SUPABASE_BUCKET` to your name).
4. Grab from Project Settings:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never ship to the browser)
   - anon/public key (for the web app)
   - Postgres connection strings (Database → Connection string): pooled (`:6543`, `?pgbouncer=true`) for `DATABASE_URL`, direct (`:5432`) for `DIRECT_URL`.

## 2. Database schema
From `wardrobe-api` with `DATABASE_URL`/`DIRECT_URL` set:
```
npx prisma generate
npx prisma db push        # creates/updates tables to match schema.prisma
```
Schema changes here have been additive; `db push` is safe. Avoid `--accept-data-loss` on the shared DB.

## 3. API — `wardrobe-api` (Render / Railway / Fly)
- **Root dir:** `wardrobe-api`
- **Build:** `npm install && npx prisma generate && npm run build`
- **Start:** `npm run start:prod` (runs `node dist/main`)
- **Env** (see `.env.example`): `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`, `PORT` (platform-provided), `WEB_ORIGIN` (the deployed web URL, e.g. `https://your-app.vercel.app`).
- **Health check:** `GET /health` → `{ "status": "ok" }`.

## 4. Web — `wardrobe-web` (Vercel)
- **Root dir:** `wardrobe-web`
- **Build:** `next build` (default). **Framework:** Next.js.
- **Env** (see `.env.example`): `NEXT_PUBLIC_API_URL` = the deployed API URL, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 5. Wire them together
1. Deploy the API, note its URL.
2. Set the web app's `NEXT_PUBLIC_API_URL` to that URL and deploy the web.
3. Set the API's `WEB_ORIGIN` to the web URL (locks CORS to it) and redeploy.

## Local dev
- API: `cd wardrobe-api && PORT=3100 npm run start:dev`
- Web: `cd wardrobe-web && NEXT_PUBLIC_API_URL=http://localhost:3100 npx next dev -p 3101`
- Copy each `.env.example` to `.env` (api) / `.env.local` (web) and fill in.
