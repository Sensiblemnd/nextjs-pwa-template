"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <p className="error-page-icon" aria-hidden="true">
        ⚠️
      </p>
      <h2>{t.errorPage.title}</h2>
      <p className="error-page-text">{t.errorPage.body}</p>
      <button onClick={reset} className="btn-primary">
        {t.errorPage.retry}
      </button>
    </div>
  );
}
