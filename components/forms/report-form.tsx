"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { enqueueReport } from "@/lib/db";
import { syncPendingReports } from "@/lib/sync";
import { getCurrentPosition } from "@/lib/geolocation";
import { REPORT_CATEGORIES, getCategoryLabel } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/client";
import type { ReportCategory } from "@/lib/db";

// Schema is built per-locale so Zod validation messages follow the UI language
function makeReportSchema(required: string, max: string) {
  return z.object({
    category: z.enum(REPORT_CATEGORIES),
    description: z.string().min(1, required).max(500, max),
    address: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
  });
}

type ReportFormValues = z.infer<ReturnType<typeof makeReportSchema>>;

const makeResolver = (schema: ReturnType<typeof makeReportSchema>) => async (values: unknown) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (path && !errors[path]) errors[path] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};

export function ReportForm({
  categories,
  defaultCategory,
  onSuccess,
}: {
  categories: ReportCategory[];
  defaultCategory?: ReportCategory;
  onSuccess?: () => void;
}) {
  const { locale, t } = useI18n();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (successTimerRef.current !== null) clearTimeout(successTimerRef.current);
    },
    []
  );

  const resolver = useMemo(
    () => makeResolver(makeReportSchema(t.form.descriptionRequired, t.form.descriptionMax)),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver,
    defaultValues: {
      category: defaultCategory ?? categories[0],
      description: "",
      address: "",
      severity: "medium",
    },
  });

  const descriptionLength = watch("description")?.length ?? 0;
  const currentSeverity = watch("severity");

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        getCategoryLabel(a, locale).localeCompare(getCategoryLabel(b, locale), locale)
      ),
    [categories, locale]
  );

  const handleLocate = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const pos = await getCurrentPosition();
      setCoords({ lat: pos.latitude, lng: pos.longitude });
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      const msg =
        code === "1"
          ? t.form.geoPermission
          : code === "2"
            ? t.form.geoUnsupported
            : code === "3"
              ? t.form.geoTimeout
              : t.form.geoFailed;
      setGeoError(msg);
    } finally {
      setGeoLoading(false);
    }
  };

  const onSubmit = async (data: ReportFormValues) => {
    await enqueueReport({
      category: data.category,
      description: data.description,
      address: data.address,
      severity: data.severity,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    });

    if (navigator.onLine) {
      await syncPendingReports();
    }

    setSubmitted(true);
    if (onSuccess) successTimerRef.current = setTimeout(onSuccess, 1500);
  };

  if (submitted) {
    return (
      <div className="form-success">
        <CheckCircle size={48} color="hsl(var(--alert-safe))" aria-hidden="true" />
        <p className="form-success-text">{t.form.saved}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="report-form">
      <div className="form-field">
        <label htmlFor="category">{t.form.type}</label>
        <select id="category" {...register("category")}>
          {sortedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryLabel(cat, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label>{t.form.severity}</label>
        <div className="severity-grid">
          {(["low", "medium", "high", "critical"] as const).map((lvl) => (
            <label
              key={lvl}
              className="severity-option"
              data-active={currentSeverity === lvl ? "true" : undefined}
            >
              <input type="radio" value={lvl} {...register("severity")} className="hidden-radio" />
              {t.form.severities[lvl]}
            </label>
          ))}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="description">{t.form.description} *</label>
        <textarea
          id="description"
          {...register("description")}
          placeholder={t.form.descriptionPlaceholder}
          maxLength={500}
          data-error={errors.description ? "true" : undefined}
        />
        <div className="form-feedback">
          {errors.description && (
            <span className="form-error" role="alert">
              {errors.description.message}
            </span>
          )}
          <span className="form-char-count">{descriptionLength}/500</span>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="address">{t.form.address}</label>
        <input
          id="address"
          type="text"
          {...register("address")}
          placeholder={t.form.addressPlaceholder}
        />
      </div>

      <div className="locate-wrapper">
        <button
          type="button"
          onClick={handleLocate}
          disabled={geoLoading}
          className="locate-btn"
          data-state={geoLoading ? "loading" : coords ? "success" : geoError ? "error" : undefined}
        >
          <MapPin size={14} aria-hidden="true" />{" "}
          {geoLoading
            ? t.form.locating
            : coords
              ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              : t.form.locate}
        </button>
        {geoError && (
          <p className="form-error" role="alert">
            {geoError}
          </p>
        )}
      </div>

      <div className="form-footer">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          {t.form.cancel}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? t.form.submitting : t.form.submit}
        </button>
      </div>
    </form>
  );
}
