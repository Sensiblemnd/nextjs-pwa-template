# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (v10+, Node 20+).

```bash
pnpm dev          # dev server at http://localhost:3000 — service worker DISABLED
pnpm build        # production build (compiles app/sw.ts → public/sw.js)
pnpm start        # serve the production build — service worker ACTIVE
pnpm typecheck    # tsc --noEmit (also aliased as `pnpm lint`)
pnpm format       # prettier --write .
```

There is no test runner. UI verification is done manually via the **Playwright MCP server** (`mcp__playwright__*` tools): start the app, then use `browser_navigate` / `browser_snapshot` / `browser_click` etc. to drive and inspect the UI. Use this to verify any UI change.

The service worker is intentionally disabled in dev (`next.config.ts`). Anything touching offline behavior, caching, or background sync must be tested against `pnpm build && pnpm start`.

## Architecture

Offline-first PWA template (Next.js 16 App Router, React 19, Serwist, IndexedDB). "Reports" is a placeholder example feature meant to be renamed by consumers of the template.

### The offline write path (the core loop)

Writes never go straight to the network. The flow spans several files that must stay consistent:

1. `components/forms/report-form.tsx` — Zod-validated form calls `enqueueReport()`
2. `lib/db/index.ts` — report stored in an IndexedDB outbox with a client-generated ID and status (`pending → syncing → synced | error`)
3. `lib/sync/index.ts` — `syncPendingReports()` drains the queue: POSTs to `/api/reports`, retries with backoff (max 3), guarded by a Web Lock so page and service worker never drain concurrently
4. `app/sw.ts` — service worker triggers the same drain via Background Sync on reconnect
5. `app/api/reports/route.ts` — treats the client-supplied `id` as an idempotency key, so a double sync never duplicates rows (in-memory Map store; meant to be replaced with a real DB)

**Cross-file invariants** (breaking these silently breaks sync):

- `DB_NAME` must match between `lib/db/index.ts` and `app/sw.ts` (both open the same IndexedDB)
- `SYNC_LOCK_NAME` in `lib/sync/index.ts` must match the lock name in `app/sw.ts`
- The client-generated report `id` must remain the idempotency key end to end

Successful syncs dispatch a `pwa:synced` CustomEvent on `window`; UI components listen for it rather than polling.

### Service worker (`app/sw.ts`)

Serwist-based: precached app shell, network-first page/API caching with timeouts, `/offline` fallback for failed navigations, build-scoped page-cache purging, and `push`/`notificationclick` handlers. Compiled by `@serwist/next` at build time only.

### Request hardening

- `next.config.ts` — security headers + CSP on every response (`unsafe-eval` allowed only in dev)
- `proxy.ts` — CORS for `/api/*`: mutating methods require an allowed Origin (production allows only `NEXT_PUBLIC_SITE_URL`); GET/HEAD are public
- `lib/sanitize.ts` — `stripHtml()` before anything is stored; Zod validation at every external input boundary (forms and API routes both)

### i18n (`lib/i18n/`)

Two locales (`en`, `es`), cookie-based — the locale never appears in the URL (path prefixes would fragment the service worker's precache and `/offline` fallback).

- `lib/i18n/dictionaries/en.ts` defines the `Dictionary` type; `es.ts` is annotated with it, so a missing/mistyped key is a compile error. Plurals/interpolations are functions on the dictionary.
- Server components: `getLocale()` / `getServerDictionary()` from `lib/i18n/server.ts` (cookie → Accept-Language → default). Client components: `useI18n()` from `lib/i18n/client.tsx` returns `{ locale, t }`.
- `LocaleProvider` (root layout) mirrors the resolved locale into the `locale` cookie and the IndexedDB `settings` store — the settings copy is how `app/sw.ts` localizes push notifications, since the SW can't read React context.
- Switching language = set cookie + `router.refresh()` (see the language item in `components/navigation/top-bar.tsx`).
- Category labels are per-locale in `lib/categories.ts` (`getCategoryLabel(id, locale)`), not in the dictionaries.
- `app/manifest.ts` is deliberately single-locale (manifests are fetched once at install); it ships in the default locale.

**Never hardcode user-facing strings in components** — add a key to both dictionaries.

### CSS architecture and components

CSS conventions (cascade layers, tokens, touch targets, inline-style policy) live in `styles/CLAUDE.md`. Component conventions (external stores, i18n usage, category metadata) live in `components/CLAUDE.md`. Both load automatically when you touch files in those folders — read them before editing there.
