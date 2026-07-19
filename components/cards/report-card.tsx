"use client";

import { MapPinOff } from "lucide-react";
import type { CachedReport } from "@/lib/db";
import { getCategoryConfig } from "@/lib/categories";
import { relativeTime } from "@/lib/relative-time";

export function ReportCard({ report }: { report: CachedReport }) {
  const { icon: Icon, labelES } = getCategoryConfig(report.category);

  return (
    <article className="alert-card" data-severity={report.severity} aria-label={report.title}>
      <div className="alert-icon" aria-hidden="true" title={labelES}>
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="alert-card-body">
        <div className="alert-title-row">
          <p className="alert-title">{report.title}</p>
        </div>
        <p className="alert-body">{report.description}</p>
        <div className="alert-meta">
          <p className="alert-card-time">{relativeTime(report.createdAt)}</p>
          {(report.latitude === null || report.longitude === null) && (
            <span className="alert-no-location">
              <MapPinOff size={11} aria-hidden="true" />
              Sin ubicación
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
