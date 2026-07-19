"use client";

import { use, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ReportCard } from "@/components/cards/report-card";
import { fetchAndCacheReports, type CachedReport } from "@/lib/db";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

interface ReportListProps {
  promise: Promise<CachedReport[]>;
  newHref: string;
  emptyMessage: string;
}

export function ReportListSkeleton() {
  return (
    <div className="alert-list">
      <div className="skeleton alert-list-skeleton" />
      <div className="skeleton alert-list-skeleton" />
      <div className="skeleton alert-list-skeleton" />
    </div>
  );
}

export function ReportList({ promise, newHref, emptyMessage }: ReportListProps) {
  const all = use(promise);
  const [reports, setReports] = useState(all);

  const refresh = useCallback(async () => {
    const fresh = await fetchAndCacheReports();
    setReports(fresh);
  }, []);

  // The offline queue dispatches "pwa:synced" after draining — refresh so
  // just-synced reports appear without a manual reload
  useEffect(() => {
    const handler = () => {
      refresh();
    };
    window.addEventListener("pwa:synced", handler);
    return () => window.removeEventListener("pwa:synced", handler);
  }, [refresh]);

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="alert-list">
        {reports.length === 0 ? (
          <div className="alert-empty">
            <p>{emptyMessage}</p>
            <Link href={newHref} className="btn-primary">
              Crear reporte
            </Link>
          </div>
        ) : (
          reports.map((report) => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    </PullToRefresh>
  );
}
