import type { LucideIcon } from "lucide-react";
import { TriangleAlert, Wrench, HelpCircle, Tag } from "lucide-react";
import type { Locale } from "@/lib/i18n";

// Single source of truth for report categories: IDs, labels, icons, expiry.
// Replace these with your own domain's categories — components and API routes
// read from this config and never hardcode category IDs or labels.
export const REPORT_CATEGORIES = ["incident", "maintenance", "question", "other"] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

interface CategoryConfig {
  labels: Record<Locale, string>;
  icon: LucideIcon;
  expiryHours: number;
}

export const CATEGORY_CONFIG: Record<ReportCategory, CategoryConfig> = {
  incident: {
    labels: { en: "Incident", es: "Incidente" },
    icon: TriangleAlert,
    expiryHours: 24,
  },
  maintenance: {
    labels: { en: "Maintenance", es: "Mantenimiento" },
    icon: Wrench,
    expiryHours: 168,
  },
  question: {
    labels: { en: "Question", es: "Consulta" },
    icon: HelpCircle,
    expiryHours: 72,
  },
  other: {
    labels: { en: "Other", es: "Otro" },
    icon: Tag,
    expiryHours: 72,
  },
};

export function getCategoryConfig(id: ReportCategory): CategoryConfig {
  return CATEGORY_CONFIG[id];
}

export function getCategoryLabel(id: ReportCategory, locale: Locale): string {
  return CATEGORY_CONFIG[id].labels[locale];
}

export function getExpiryHours(category: ReportCategory): number {
  return CATEGORY_CONFIG[category].expiryHours;
}
