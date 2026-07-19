import type { LucideIcon } from "lucide-react";
import { TriangleAlert, Wrench, HelpCircle, Tag } from "lucide-react";

// Single source of truth for report categories: IDs, labels, icons, expiry.
// Replace these with your own domain's categories — components and API routes
// read from this config and never hardcode category IDs or labels.
export const REPORT_CATEGORIES = ["incident", "maintenance", "question", "other"] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

interface CategoryConfig {
  labelES: string;
  icon: LucideIcon;
  expiryHours: number;
}

export const CATEGORY_CONFIG: Record<ReportCategory, CategoryConfig> = {
  incident: { labelES: "Incidente", icon: TriangleAlert, expiryHours: 24 },
  maintenance: { labelES: "Mantenimiento", icon: Wrench, expiryHours: 168 },
  question: { labelES: "Consulta", icon: HelpCircle, expiryHours: 72 },
  other: { labelES: "Otro", icon: Tag, expiryHours: 72 },
};

export function getCategoryConfig(id: ReportCategory): CategoryConfig {
  return CATEGORY_CONFIG[id];
}

export function getExpiryHours(category: ReportCategory): number {
  return CATEGORY_CONFIG[category].expiryHours;
}
