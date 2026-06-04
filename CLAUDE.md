# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent, sibling projects (no workspace tooling links them):

- **`wardrobe-api/`** — NestJS 11 REST API. The backend / source of truth for wardrobe items.
- **`wardrobe-web/`** — Next.js 16 + React 19 + Tailwind v4 frontend that consumes the API.

Run commands from inside the relevant subdirectory. `wardrobe-api` uses **pnpm**; `wardrobe-web` uses **npm** (has `package-lock.json`).

## Commands

### wardrobe-api (run from `wardrobe-api/`)
- `pnpm run start:dev` — dev server with watch (default port **3000**)
- `pnpm run build` / `pnpm run start:prod` — compile to `dist/` and run
- `pnpm run lint` — ESLint with `--fix`
- `pnpm run test` — Jest unit tests (`*.spec.ts` under `src/`)
- `pnpm run test:e2e` — e2e tests (`test/jest-e2e.json`)
- Run a single test: `pnpm run test -- items.controller` or `pnpm run test -- -t "test name"`

### wardrobe-web (run from `wardrobe-web/`)
- `npm run dev` — Next.js dev server (default port **3000** — collides with the API; see below)
- `npm run build` / `npm run start`
- `npm run lint` — `eslint`

## Architecture & key facts

### API (`wardrobe-api`)
- Single feature module: `ItemsModule` (`src/items/`), wired into `AppModule`. Standard NestJS controller → service split.
- **Items are stored in-memory** in `ItemsService` (a plain array) — there is no database/persistence layer. All data is lost on restart. Adding a DB (Prisma, etc.) is greenfield work.
- Item `id` is generated as `Date.now().toString()` — IDs are **strings**, server-side.
- `enableCors()` is called globally in `src/main.ts` so the web app can call it cross-origin.

### Web (`wardrobe-web`)
- App Router; the entire UI is a single client component in `app/page.tsx` (form + list, talks to `${API_URL}/items` via `fetch`). UI strings are in Russian.
- API base URL comes from `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3000`.
- Import alias `@/*` maps to the project root.

### Cross-project gotchas
- **Port collision:** both default to 3000. Run one on another port, e.g. `NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev -p 3000`, or set `PORT` for the API.
- **`id` type mismatch:** the API returns string IDs (`Date.now().toString()`), but `app/page.tsx` types `Item.id` as `number`. Keep this in mind when touching either side.

## Next.js 16 — read before writing frontend code

Per `wardrobe-web/AGENTS.md`: this is Next.js 16, which has breaking changes from older versions you may know. Before writing frontend code, consult the bundled guides in `wardrobe-web/node_modules/next/dist/docs/` and heed deprecation notices rather than relying on prior Next.js knowledge.
