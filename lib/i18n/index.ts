import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import type { Dictionary } from "./dictionaries/en";

export type { Dictionary };

// Locale never appears in the URL — it lives in a cookie (server render), the
// IndexedDB settings store (service worker), and React context (client). Path
// prefixes like /es would fragment the service worker's precache and its
// /offline fallback, so this template deliberately avoids them.
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

// Both dictionaries ship in the client bundle so switching language works
// offline — they're a few KB combined.
export const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
