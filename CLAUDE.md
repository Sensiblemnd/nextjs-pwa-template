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

### CSS architecture

Native CSS with cascade layers, ordered `base → tokens → layout → components → utilities → overrides`. `styles/globals.css` is an import manifest only — real CSS lives in `styles/*.css` and `styles/components/*` (one file per component). No Tailwind classes in components despite tailwind being installed for the pipeline.

## Conventions

- All colors/spacing/radii via CSS custom properties in `styles/tokens.css` (dark-first) — never hardcoded hex values
- CSS state via `data-*` attributes, not inline styles
- `rem` font sizes only (user font scaling); 44px minimum touch targets (enforced in `styles/base.css`)
- External stores (network state, install prompt, IndexedDB) are consumed via `useSyncExternalStore` hooks in `lib/hooks/` — never mirrored into `useState + useEffect`
- `lib/categories.ts` is the single source of truth for category IDs, labels, icons, and expiry
