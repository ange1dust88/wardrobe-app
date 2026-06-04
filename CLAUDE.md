# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product vision

A simple **single-page tool that helps people assemble and systematize outfits**. Target users range from people who know nothing about clothing to enthusiasts who love dressing up. The desired feeling is *pleasant surprise* at how easy it is to get a stylish, wear-it-right-now look.

The tool does **not** auto-generate outfits — it **curates the user (Ю) to build the look themselves**: the user picks an anchor item, the system surfaces well-matching candidates (ranked) for the user to choose from. Planned/aspirational features (not all built yet):

- Match suggestions around an anchor item (the core engine — see below).
- Slider/carousel UI: pick a base (e.g. a bottom), system feeds in everything that fits.
- Seasonal color analysis (цветотипы) — user picks their color type from a list for now.
- Season gating so you can't mix a coat with shorts.
- Occasion/vibe guidance ("X reads as light/easy, Y as serious…").
- Wardrobe analysis & balancing (e.g. "10 little black dresses but nothing for daytime", "everything is one color", items that "work against the client").
- Save outfits; export outfit as JPEG; shopping recommendations based on gaps.

## Current state vs target stack — IMPORTANT

The vision targets: **Next.js + TS, Tailwind, Cosmos UI, Motion, tRPC / Next API routes, Prisma + PostgreSQL/Supabase**.

The repo today does **not** match that yet:

- Backend is a **separate NestJS REST API** (`wardrobe-api/`), not tRPC/Next API routes.
- Persistence is **in-memory arrays**, not Prisma/Postgres — all data is lost on restart.
- The matching engine described below is **designed but not implemented**.

Treat the target stack as direction, not current reality. Before large architectural moves (e.g. collapsing the API into Next.js + tRPC, or adding Prisma), confirm with the user — it's an open migration question.

## Repository layout

Two independent, sibling projects (no workspace tooling links them):

- **`wardrobe-api/`** — NestJS 11 REST API. Source of truth for items & outfits. Uses **pnpm**.
- **`wardrobe-web/`** — Next.js 16 + React 19 + Tailwind v4 frontend. Uses **npm** (has `package-lock.json`).

Run commands from inside the relevant subdirectory.

## Commands

### wardrobe-api (run from `wardrobe-api/`)
- `pnpm run start:dev` — dev server with watch (default port **3000**)
- `pnpm run build` / `pnpm run start:prod` — compile to `dist/` and run
- `pnpm run lint` — ESLint with `--fix`
- `pnpm run test` — Jest unit tests (`*.spec.ts` under `src/`)
- `pnpm run test:e2e` — e2e tests (`test/jest-e2e.json`)
- Run a single test: `pnpm run test -- items.controller` or `pnpm run test -- -t "test name"`

### wardrobe-web (run from `wardrobe-web/`)
- `npm run dev` — Next.js dev server (default port **3000** — collides with the API; see gotchas)
- `npm run build` / `npm run start`
- `npm run lint` — `eslint`

## Architecture

### API (`wardrobe-api`)
- Feature modules under `src/`: `ItemsModule` (`src/items/`) and `OutfitsModule` (`src/outfits/`), both wired into `AppModule`. Standard NestJS controller → service split.
- **In-memory storage** — each service holds a plain array. No DB. IDs generated as `Date.now().toString()` (strings).
- Global `ValidationPipe` (`src/main.ts`) with `whitelist`, `forbidNonWhitelisted`, `transform: true`. DTOs are **classes** with `class-validator` decorators; unknown fields and bad enum/hex/range values → `400`. `transform: true` is required so the nested `color` object validates as `ColorDto`.
- `enableCors()` is global so the web app can call cross-origin.
- `ItemsModule` exports `ItemsService`; `OutfitsModule` imports it to validate that an outfit's `itemIds` reference real items.

Endpoints:
- Items: `GET /items`, `GET /items/:id`, `POST /items`, `PATCH /items/:id`, `DELETE /items/:id`
- Outfits: `GET /outfits`, `GET /outfits/:id` (returns the outfit **with `items` expanded**), `POST /outfits`, `PATCH /outfits/:id`, `DELETE /outfits/:id`
- `GET /` — default "Hello World!" (removable).

### Web (`wardrobe-web`)
- App Router. `app/layout.tsx` wraps the app in `app/providers.tsx` (`QueryClientProvider`).
- **Server state via React Query** (`@tanstack/react-query`): `useQuery`/`useMutation`, mutations invalidate `['items']`. Do not reintroduce manual `useState`+`fetch` loops.
- `app/lib/items.ts` holds the model types, enum value arrays (for selects), and fetchers (`fetchItems`/`createItem`/`deleteItem`). `createItem` extracts the API's validation message for display.
- `app/page.tsx` — the create-item form + list. Outfit UI is **not built on the web yet** (only via API).
- API base URL: `NEXT_PUBLIC_API_URL`, default `http://localhost:3000`. Import alias `@/*` → project root. UI strings are Russian.

## Data model

`Item` (see `wardrobe-api/src/items/dto/item.dto.ts` — DTOs are the source of truth):

```jsonc
{
  "id": "string", "createdAt": "ISO string",
  "name": "string",
  "category": "outerwear|top|bottom|shoes|accessory|dress|set",
  "color": {
    "hex": "#RRGGBB",
    "hue": 0,                 // 0–360
    "temperature": "warm|cool|neutral",
    "brightness": "light|medium|dark",
    "saturation": "muted|soft|vivid",
    "isNeutral": true         // base color, pairs with almost anything
  },
  "wardrobeRole": "core|tonal|pop",
  "pattern": "solid|subtle_pattern|bold_pattern|graphic|texture_only",
  "seasonPaletteCompatibility": ["spring|summer|autumn|winter|universal"], // non-empty; color-type palette
  "vibe": ["casual|classic|romantic|edgy|sporty|business|evening|minimal"], // non-empty
  "seasonWear": ["spring|summer|autumn|winter|all_year"]                     // non-empty; when it's worn
}
```

`Outfit`: `{ id, name, itemIds: string[], createdAt }`. `itemIds` are deduped and validated to exist on create/update.

Note the **two season-like axes** — keep them distinct: `seasonWear` = which physical season the item is worn in (drives the hard season gate); `seasonPaletteCompatibility` = which seasonal *color type* (цветотип) palette it belongs to (drives palette scoring).

## Matching engine (designed, not yet implemented)

Core of the product. Given an **anchor item** + context (target category, current season, user's color type, desired vibes), rank candidate items.

1. **Hard filter — season.** Drop any candidate whose `seasonWear` doesn't include the current season *before* scoring (this is what prevents coat + shorts).
2. **Score** each surviving candidate with independent pure functions, then combine by weights:
   - `colorScore` — temperature (same = best; neutral = mild bonus; warm-vs-cool clash = penalty, larger if `strictTemperature`), brightness (same/adjacent ok, far = penalty), saturation (vivid anchor wants muted/soft partner; two vivids penalized), `isNeutral` bonus.
   - `roleScore` — `pop` pairs well with `core`/`tonal`; two `pop`s penalized.
   - `paletteScore` — candidate's `seasonPaletteCompatibility` includes the user's color type → high.
   - `seasonScore`, `vibeScore`, `patternScore`.
   - `totalScore = wColor*color + wRole*role + wSeason*season + wPalette*palette + wVibe*vibe + wPattern*pattern` (reference weights: color 3, role 2, season 2, palette 2, vibe 1, pattern 1).
3. Filter `score > 0`, sort descending, return for the carousel/slider UI.

The reference design keeps each `compute*Score` as a small pure function in `lib/matching/` taking plain `Item`/color metadata — implement them that way so they're unit-testable in isolation, independent of where data is stored.

## Gotchas
- **Port collision:** both default to 3000. Run one elsewhere, e.g. API on 3000 and `npm run dev -- -p 3001` for web (web's default `NEXT_PUBLIC_API_URL` already points at 3000).
- **In-memory data resets** on every API restart — including the watch-mode dev server reloading after an edit. Re-seed test data after restarts.
- **Deleting an item does not clean up outfits** — its id stays in `outfit.itemIds` but is silently filtered out when `GET /outfits/:id` expands items.

## Next.js 16 — read before writing frontend code

Per `wardrobe-web/AGENTS.md`: this is Next.js 16, with breaking changes from older versions. Before writing frontend code, consult the bundled guides in `wardrobe-web/node_modules/next/dist/docs/` and heed deprecation notices rather than relying on prior Next.js knowledge.
