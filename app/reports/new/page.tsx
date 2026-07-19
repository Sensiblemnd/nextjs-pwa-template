"use client";

import { useRouter } from "next/navigation";
import { ReportForm } from "@/components/forms/report-form";
import { REPORT_CATEGORIES } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/client";

export default function Page() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div>
      <header className="list-page-header" data-variant="form">
        <button
          onClick={() => router.back()}
          className="list-page-back-btn"
          aria-label={t.reports.back}
        >
          ←
        </button>
        <h1 className="list-page-title">{t.reports.newTitle}</h1>
      </header>
      <ReportForm categories={[...REPORT_CATEGORIES]} onSuccess={() => router.back()} />
    </div>
  );
}
