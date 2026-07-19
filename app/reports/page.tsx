"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { fetchAndCacheReports, type CachedReport } from "@/lib/db";
import { ReportList, ReportListSkeleton } from "@/components/reports/report-list";
import { useI18n } from "@/lib/i18n/client";

export default function ReportsPage() {
  const [promise, setPromise] = useState<Promise<CachedReport[]> | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    setPromise(fetchAndCacheReports());
  }, []);

  return (
    <div>
      <header className="list-page-header">
        <h1 className="list-page-title">{t.reports.title}</h1>
        <Link href="/reports/new" className="list-page-new-btn" aria-label={t.reports.newAria}>
          +
        </Link>
      </header>

      {promise ? (
        <Suspense fallback={<ReportListSkeleton />}>
          <ReportList promise={promise} newHref="/reports/new" emptyMessage={t.reports.empty} />
        </Suspense>
      ) : (
        <ReportListSkeleton />
      )}
    </div>
  );
}
