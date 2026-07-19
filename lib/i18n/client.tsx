"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { DEFAULT_LOCALE, DICTIONARIES, LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import { setSetting } from "@/lib/db";

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// The locale prop comes from the server (cookie / Accept-Language), so server
// HTML and client hydration always agree — no language flash.
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: DICTIONARIES[locale] }), [locale]);

  // Persist the resolved locale where the server can't: the cookie (so an
  // Accept-Language-derived locale becomes sticky and /api/reports sees it)
  // and the IndexedDB settings store (so the service worker can localize
  // push notifications).
  useEffect(() => {
    setLocaleCookie(locale);
    setSetting("locale", locale).catch(() => {});
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}

export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
}

// For components that render outside the root layout (global-error), where no
// provider exists: cookie first, then browser language.
export function getClientLocale(): Locale {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
    if (match && isLocale(match[1])) return match[1];
    const browser = navigator.language.toLowerCase().split("-")[0];
    if (isLocale(browser)) return browser;
  }
  return DEFAULT_LOCALE;
}
