import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, DICTIONARIES, LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";

// Server-side locale resolution: explicit cookie choice wins, then the
// browser's Accept-Language, then the default. Reading cookies()/headers()
// opts pages into dynamic rendering — fine here, the service worker already
// treats pages as network-first runtime caches, not static exports.
export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase().split("-")[0];
    if (isLocale(lang)) return lang;
  }

  return DEFAULT_LOCALE;
}

export async function getServerDictionary(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}
