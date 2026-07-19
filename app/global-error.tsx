"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, DICTIONARIES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getClientLocale } from "@/lib/i18n/client";

// Renders outside the root layout, so globals.css may not be loaded —
// inline styles are the only reliable styling here. No <LocaleProvider>
// either: resolve the locale from the cookie after mount (a server-rendered
// shell can't know it, and a hydration mismatch on the error page is worse
// than a brief default-language flash).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const t = DICTIONARIES[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    setLocale(getClientLocale());
  }, []);

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          background: "hsl(220 14% 8%)",
          color: "hsl(220 10% 95%)",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "32px 24px",
          textAlign: "center",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        <p style={{ fontSize: "2.5rem", lineHeight: 1 }} aria-hidden="true">
          ⚠️
        </p>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{t.errorPage.title}</h2>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "hsl(220 10% 75%)",
            maxWidth: "280px",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {t.errorPage.bodyShort}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "8px",
            padding: "12px 28px",
            borderRadius: "8px",
            border: "1px solid hsl(210 100% 60% / 0.6)",
            background: "hsl(210 100% 60% / 0.15)",
            color: "hsl(210 100% 70%)",
            fontSize: "0.9375rem",
            fontWeight: 700,
            cursor: "pointer",
            minHeight: "44px",
          }}
        >
          {t.errorPage.retry}
        </button>
      </body>
    </html>
  );
}
