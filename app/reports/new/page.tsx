"use client";

import { useRouter } from "next/navigation";
import { ReportForm } from "@/components/forms/report-form";
import { REPORT_CATEGORIES } from "@/lib/categories";

export default function Page() {
  const router = useRouter();
  return (
    <div>
      <header className="list-page-header" data-variant="form">
        <button onClick={() => router.back()} className="list-page-back-btn" aria-label="Volver">
          ←
        </button>
        <h1 className="list-page-title">Nuevo reporte</h1>
      </header>
      <ReportForm categories={[...REPORT_CATEGORIES]} onSuccess={() => router.back()} />
    </div>
  );
}
