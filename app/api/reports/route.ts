import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { REPORT_CATEGORIES, getCategoryLabel, getExpiryHours } from "@/lib/categories";
import type { ReportCategory } from "@/lib/categories";
import type { CachedReport } from "@/lib/db";
import { stripHtml } from "@/lib/sanitize";
import { getLocale } from "@/lib/i18n/server";

// In-memory store so the template works end-to-end out of the box. It resets
// on every server restart and doesn't share state across serverless instances
// — replace with a real database (Supabase, Postgres, etc.) for production.
interface StoredReport {
  id: string;
  category: ReportCategory;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: number;
  expiresAt: number;
}

const REPORTS = new Map<string, StoredReport>();

const insertSchema = z.object({
  // Client-generated report id (idempotency key): a retry after a lost
  // response re-sends the same id and the duplicate maps to success
  id: z.uuid().optional(),
  category: z.enum(REPORT_CATEGORIES),
  description: z.string().min(1).max(500),
  address: z.string().max(200).optional().default(""),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export async function GET() {
  // Titles are derived from the category at read time, so they follow the
  // requester's locale (cookie set by LocaleProvider)
  const locale = await getLocale();
  const now = Date.now();
  const reports: CachedReport[] = [...REPORTS.values()]
    .filter((r) => r.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((r) => ({
      id: r.id,
      category: r.category,
      title: getCategoryLabel(r.category, locale),
      description: r.description,
      address: r.address || undefined,
      latitude: r.latitude,
      longitude: r.longitude,
      severity: r.severity,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    }));

  return NextResponse.json(reports);
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_CACHE: Map<string, { timestamp: number; count: number }> = new Map();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const cached = RATE_LIMIT_CACHE.get(ip);

  if (!cached || now - cached.timestamp > RATE_LIMIT_WINDOW_MS) {
    RATE_LIMIT_CACHE.set(ip, { timestamp: now, count: 1 });
    return true;
  }

  if (cached.count >= RATE_LIMIT_MAX) {
    return false;
  }

  cached.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body: unknown = await req.json();
    const parsed = insertSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, category, description, address, severity, latitude, longitude } = parsed.data;

    // An earlier attempt already stored this report — the retry is a
    // duplicate, report success
    if (id && REPORTS.has(id)) {
      return NextResponse.json({ success: true, id }, { status: 200 });
    }

    const reportId = id ?? crypto.randomUUID();
    const createdAt = Date.now();

    REPORTS.set(reportId, {
      id: reportId,
      category,
      description: stripHtml(description),
      address: stripHtml(address),
      severity,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      createdAt,
      expiresAt: createdAt + getExpiryHours(category) * 60 * 60 * 1000,
    });

    return NextResponse.json({ success: true, id: reportId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
