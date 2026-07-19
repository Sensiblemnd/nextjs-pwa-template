"use client";

import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <div className="offline-page">
      <WifiOff className="offline-page-icon" size={56} strokeWidth={1.5} aria-hidden="true" />
      <h1>{t.offlinePage.title}</h1>
      <p>{t.offlinePage.body}</p>
      <div className="offline-page-actions">
        <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
          <RefreshCw size={18} aria-hidden="true" />
          {t.offlinePage.retry}
        </button>
        <Link href="/" className="btn-secondary">
          {t.offlinePage.goHome}
        </Link>
      </div>
    </div>
  );
}
