# Deploy

One Next.js app (`wardrobe-web`) — the UI and the API (`app/api/*`) ship
together as a single deploy. Data lives in Supabase (Postgres + Storage + Auth).

## 1. Supabase (once)

1. Create a Supabase project.
2. **Auth** — enable the Email provider (email/password).
3. **Storage** — create a public bucket named `items` (or set `SUPABASE_BUCKET`).
4. Grab from Project Settings:
   - Project URL, anon/public key, and the service role key (server-only).
   - Postgres connection strings (Database → Connection string): pooled
     (`:6543`, `?pgbouncer=true`) → `DATABASE_URL`; direct (`:5432`) →
     `DIRECT_URL`.

## 2. Database schema

From `wardrobe-web` with `DATABASE_URL` / `DIRECT_URL` set:

```
npx prisma generate
npx prisma db push
```

⚠️ This project's DB has a pre-existing drift on the `Category` enum (it holds
extra values `skirt/bag/jewelry` that aren't in `schema.prisma`). Plain
`db push` will offer to drop them — **do not** pass `--accept-data-loss`. Apply
additive schema changes with raw SQL (`prisma db execute`) instead, or reconcile
the enum first.

## 3. Deploy — `wardrobe-web` (Vercel)

- **Framework:** Next.js. **Root directory:** `wardrobe-web`.
- **Build:** `next build` (default). `postinstall` runs `prisma generate`.
- **Function region (important for speed):** set it to the **same region as the
  Supabase DB** (this project's DB is `aws-0-eu-west-1` → pick an EU region).
  Each request makes several DB queries; co-located ≈ 1–5 ms per query,
  cross-region ≈ 200 ms per query.
- **Env vars:**
  - `DATABASE_URL` (pooled), `DIRECT_URL` (direct)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `SUPABASE_BUCKET`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - optional: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- **Health check:** `GET /api/health` → `{ "status": "ok" }`.

The API is same-origin under `/api` — there is no separate backend host, no CORS,
and no `WEB_ORIGIN` to configure.

## Local dev

- Copy `wardrobe-web/.env.example` → `wardrobe-web/.env` and fill it in.
- `npm run dev` (Next dev server) from `wardrobe-web`.
- `npm test` runs the vitest suite.
