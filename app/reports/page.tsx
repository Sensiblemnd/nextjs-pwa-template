"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { fetchAndCacheReports, type CachedReport } from "@/lib/db";
import { ReportList, ReportListSkeleton } from "@/components/reports/report-list";

export default function ReportsPage() {
  const [promise, setPromise] = useState<Promise<CachedReport[]> | null>(null);

  useEffect(() => {
    setPromise(fetchAndCacheReports());
  }, []);

  return (
    <div>
      <header className="list-page-header">
        <h1 className="list-page-title">Reportes</h1>
        <Link href="/reports/new" className="list-page-new-btn" aria-label="Crear nuevo reporte">
          +
        </Link>
      </header>

      {promise ? (
        <Suspense fallback={<ReportListSkeleton />}>
          <ReportList promise={promise} newHref="/reports/new" emptyMessage="No hay reportes" />
        </Suspense>
      ) : (
        <ReportListSkeleton />
      )}
    </div>
  );
}
