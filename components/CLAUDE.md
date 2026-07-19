# CLAUDE.md — components/

Scoped guidance for `components/`. Root `CLAUDE.md` still applies; this covers component-level rules that only matter when editing files in this folder.

## Conventions

- External stores (network state, install prompt, IndexedDB) are consumed via `useSyncExternalStore` hooks in `lib/hooks/` — never mirrored into `useState` + `useEffect`. If a component needs a new piece of external/browser state, add a hook there rather than polling or re-deriving it locally.
- **Never hardcode user-facing strings.** Use `useI18n()` (client components) or `getServerDictionary()`/`getLocale()` (server components) and add the key to both `lib/i18n/dictionaries/en.ts` and `es.ts` — a missing key in `es.ts` is a compile error by design, so this can't silently drift. See root `CLAUDE.md` → i18n for the full plumbing (cookie resolution, SW localization, etc).
- `lib/categories.ts` is the single source of truth for category IDs, per-locale labels, icons, and expiry — don't inline category metadata in a component.
- Styling is CSS classes + `data-*` attributes, not inline `style={{}}` — see `styles/CLAUDE.md` for the CSS-side conventions (touch targets, token usage, the one documented inline-style exception).
