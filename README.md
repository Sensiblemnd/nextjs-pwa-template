# Next.js PWA Template

Offline-first PWA starter built with Next.js 16 (App Router), React 19, Serwist, and IndexedDB.

## What you get

- **Service worker (Serwist)**: precached app shell, network-first page/API caching with
  timeouts, an `/offline` fallback page, and build-scoped page-cache purging so stale HTML
  never mixes with new assets (`app/sw.ts`).
- **Offline outbox queue**: writes go to IndexedDB first (`lib/db`), then sync to the API on
  reconnect via Background Sync + Web Locks, with retries and idempotent client-generated IDs
  (`lib/sync`, `app/sw.ts`).
- **Install experience**: `beforeinstallprompt` bar for Android/Chrome, iOS instructions page,
  dismissal persistence, and an update toast when a new SW version is waiting.
- **App shell**: TopBar with drawer menu, BottomNav, connectivity indicator, offline status
  banner, and pending-queue status, all wired in `app/layout.tsx`.
- **i18n**: cookie-based `en`/`es` locales (no URL prefix, so the SW precache and `/offline`
  fallback stay locale-agnostic), with a typed dictionary so missing keys are compile errors
  (`lib/i18n`).
- **Example feature**: a `reports` list + form demonstrating the whole loop: Zod-validated
  form → `enqueueReport()` → sync → API → cached list with pull-to-refresh.
- **CSS architecture**: cascade layers (`base → tokens → layout → components → utilities →
overrides`), design tokens (dark-first), logical properties, `@supports` progressive
  enhancement, `prefers-reduced-motion` guards.
- **Hardening**: security headers + CSP (`next.config.ts`), CORS origin checks (`proxy.ts`),
  input sanitization (`lib/sanitize.ts`), API rate limiting.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000 (service worker disabled in dev)
pnpm build      # production build (compiles the service worker)
pnpm start      # serve the production build (SW active)
pnpm typecheck  # tsc --noEmit
pnpm format     # prettier
```

The service worker is intentionally disabled in development (`next.config.ts`); test offline
behavior against `pnpm build && pnpm start`.

## Making it yours

1. **Identity**: search for `PWA Template` / `pwa-template` and replace: `app/layout.tsx`
   (metadata), `app/manifest.ts`, `components/navigation/top-bar.tsx`, `package.json`.
   Keep `DB_NAME` in `lib/db/index.ts` and `app/sw.ts` in sync (same database).
2. **Domain**: `lib/categories.ts` is the single source of truth for category IDs, labels,
   icons, and expiry. Rename the "report" concept to whatever your app queues offline.
3. **Persistence**: `app/api/reports/route.ts` uses an in-memory Map so the template works
   out of the box. Replace it with a real database; keep the client-supplied `id` as an
   idempotency key so retried syncs never duplicate rows.
4. **Domain URL**: set `NEXT_PUBLIC_SITE_URL` (see `.env.local.example`); production CORS in
   `proxy.ts` only allows that origin for mutating requests.
5. **Icons**: replace `public/icons/*` and the PNG exports referenced in `app/manifest.ts`.
6. **Push notifications**: the SW already handles `push`/`notificationclick` events; to send
   pushes you'll need a subscribe endpoint plus VAPID keys server-side (e.g. the `web-push`
   package).

## Structure

```
app/
  layout.tsx        App shell: header stack → main → queue status → bottom nav
  sw.ts             Service worker: caching, background sync, push
  manifest.ts       Web app manifest (served at /manifest.webmanifest)
  offline/          SW fallback page for failed navigations
  install/          iOS install instructions
  reports/          Example feature: list + new-report form
  api/reports/      Example API: Zod validation, rate limit, in-memory store
components/
  navigation/       top-bar (drawer menu), bottom-nav
  layout/           SW registrar, install bar, font-scale provider
  offline/          connectivity indicator, offline banner, queue status
  forms/ cards/     Example feature UI
  ui/               pull-to-refresh
lib/
  db/               IndexedDB: outbox queue, server cache, settings (idb)
  sync/             Queue drain with Web Locks + retries
  i18n/             Dictionaries (en/es), server + client accessors
  geolocation/      Geolocation hook/helpers used by the example feature
  hooks/            use-network-state, use-install-prompt, use-pull-to-refresh, …
  categories.ts     Category config (single source of truth)
  sanitize.ts       stripHtml() input sanitization
  site.ts           Site-wide constants (e.g. canonical URL)
styles/
  globals.css       Import manifest only; real CSS lives in the partials
  tokens.css        Design tokens (all colors/spacing/radii)
  components/       One file per component
```

## Conventions

- State changes via hooks/`useSyncExternalStore`; external stores never mirrored into
  `useState + useEffect`.
- All colors via CSS custom properties in `styles/tokens.css`; no hardcoded hex values.
- CSS state via `data-*` attributes, not inline styles.
- `rem` font sizes only, so user font scaling works.
- 44px minimum touch targets (enforced globally in `styles/base.css`).
- Zod validation at every external input boundary; `stripHtml()` before storage.
