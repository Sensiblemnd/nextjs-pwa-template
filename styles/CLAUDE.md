# CLAUDE.md — styles/

Scoped guidance for `styles/`. Root `CLAUDE.md` still applies; this covers CSS-specific rules that only matter when editing files in this folder.

## Architecture

Native CSS with cascade layers, ordered `base → tokens → layout → components → utilities → overrides` (declared at the bottom of `globals.css`). `globals.css` is an import manifest only — it has no rules of its own beyond the `@import` list and the `@layer` order declaration. Real CSS lives in `styles/*.css` (one file per layer) and `styles/components/*.css` (one file per component, imported into the `components` layer). No Tailwind classes in components despite Tailwind being installed for the pipeline — it only feeds `postcss-import`/`autoprefixer`.

Adding a new component stylesheet: create `styles/components/<name>.css`, add `@import "./components/<name>.css" layer(components);` to `globals.css` in the same position as its neighbors (list order doesn't affect the cascade — layers do — but keep it alphabetical-ish for scanability).

## Conventions

- All colors/spacing/radii via CSS custom properties in `tokens.css` (dark-first) — never hardcode hex. One-off white/black-with-alpha (e.g. text-on-brand, overlay scrims) uses raw `hsl(0 0% 100%)` / `hsl(0 0% 0% / alpha)` rather than `rgba()`, matching the `hsl(var(--token) / alpha)` pattern used for tokenized colors — keep alpha colors in `hsl()` form throughout, even untokenized ones.
- CSS state via `data-*` attributes, not inline styles. Inline `style={{}}` is reserved for values computed at runtime (e.g. drag-position transforms) — even then, pass only the dynamic number through a CSS custom property (`style={{ "--pull-y": ... }}`) and let the stylesheet own everything else. The only sanctioned exception is `app/global-error.tsx`, which replaces the root layout when *it* crashes, so `globals.css` may not have loaded — see the comment there before changing it.
- `rem` font sizes only (user font scaling).
- **44px minimum touch targets are enforced globally** in `base.css` (`min-inline-size`/`min-block-size: var(--spacing-touch)` on every `button`, `a`, `[role="button"]`). This is a floor, not a default — an explicit smaller `width`/`height`/`inline-size`/`block-size` on one of those elements will not visually shrink it below 44px, it'll just make the declared size misleading. Don't redeclare `44px`/`var(--spacing-touch)` explicitly on plain buttons/links either; it's redundant with `base.css`.
- Before removing a component (`.tsx`), grep its CSS class names across `app/`, `components/`, `lib/` — dead selectors accumulate silently since nothing errors on an unused class. Also check attribute selectors (`[data-foo]`) the same way; they don't show up in a plain classname grep.
