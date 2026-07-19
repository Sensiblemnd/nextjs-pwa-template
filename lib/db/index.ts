import { openDB, IDBPDatabase } from "idb";
import type { ReportCategory } from "@/lib/categories";
export type { ReportCategory } from "@/lib/categories";

// Must stay in sync with DB_NAME/DB_VERSION in app/sw.ts — the service
// worker's background sync opens this same database by name.
const DB_NAME = "pwa-template";
const DB_VERSION = 1;

export interface Report {
  id: string;
  category: ReportCategory;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "syncing" | "synced" | "error";
  createdAt: number;
  syncedAt?: number;
  retryCount: number;
  errorMessage?: string;
}

export interface CachedReport {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  address?: string;
  latitude: number | null;
  longitude: number | null;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: number;
  expiresAt: number;
}

let _db: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;

  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("reports")) {
        const store = db.createObjectStore("reports", { keyPath: "id" });
        store.createIndex("by-status", "status");
        store.createIndex("by-created", "createdAt");
      }
      if (!db.objectStoreNames.contains("cached_reports")) {
        const store = db.createObjectStore("cached_reports", { keyPath: "id" });
        store.createIndex("by-expires", "expiresAt");
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });

  return _db;
}

// OUTBOX QUEUE — reports written locally, synced to the API on reconnect
export async function enqueueReport(
  data: Omit<Report, "id" | "status" | "createdAt" | "retryCount">
): Promise<Report> {
  const db = await getDB();
  const report: Report = {
    ...data,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: Date.now(),
    retryCount: 0,
  };
  await db.add("reports", report);
  return report;
}

export async function getAllReports(): Promise<Report[]> {
  const db = await getDB();
  const all = await db.getAll("reports");
  return (all as Report[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPendingReports(): Promise<Report[]> {
  const db = await getDB();
  return (await db.getAllFromIndex("reports", "by-status", "pending")) as Report[];
}

// A sync interrupted between "syncing" and "synced"/"pending" (tab closed, SW killed)
// strands the row forever — getPendingReports never picks "syncing" up again.
// Call at the start of every sync run, while holding the sync lock.
export async function recoverStaleSyncingReports(): Promise<void> {
  const db = await getDB();
  const stale = (await db.getAllFromIndex("reports", "by-status", "syncing")) as Report[];
  await Promise.all(stale.map((r) => db.put("reports", { ...r, status: "pending" })));
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  const pending = await db.getAllFromIndex("reports", "by-status", "pending");
  const syncing = await db.getAllFromIndex("reports", "by-status", "syncing");
  return pending.length + syncing.length;
}

export async function updateReportStatus(
  id: string,
  status: Report["status"],
  extra?: Partial<Report>
): Promise<void> {
  const db = await getDB();
  const report = (await db.get("reports", id)) as Report | undefined;
  if (!report) return;
  await db.put("reports", { ...report, ...extra, status });
}

export async function deleteReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("reports", id);
}

// SERVER CACHE — read-through cache of the API's report list for offline use
export async function getCachedReports(): Promise<CachedReport[]> {
  const db = await getDB();
  const all = (await db.getAll("cached_reports")) as CachedReport[];
  const now = Date.now();
  return all.filter((r) => r.expiresAt > now);
}

// Reports deleted server-side must be evicted locally, or they linger in the
// list until expiresAt — a full fetch is authoritative, so replace the cache.
async function reconcileReportCache(fresh: CachedReport[]): Promise<void> {
  const db = await getDB();
  const freshIds = new Set(fresh.map((r) => r.id));
  const all = (await db.getAll("cached_reports")) as CachedReport[];
  const stale = all.filter((r) => !freshIds.has(r.id));
  const tx = db.transaction("cached_reports", "readwrite");
  await Promise.all([
    ...fresh.map((r) => tx.store.put(r)),
    ...stale.map((r) => tx.store.delete(r.id)),
    tx.done,
  ]);
}

export async function fetchAndCacheReports(): Promise<CachedReport[]> {
  if (!navigator.onLine) return getCachedReports();
  try {
    const res = await fetch("/api/reports");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fresh: CachedReport[] = await res.json();
    await reconcileReportCache(fresh);
    return fresh;
  } catch {
    return getCachedReports();
  }
}

export async function purgeExpiredReports(): Promise<void> {
  const db = await getDB();
  const all = (await db.getAll("cached_reports")) as CachedReport[];
  const now = Date.now();
  const expired = all.filter((r) => r.expiresAt <= now);
  await Promise.all(expired.map((r) => db.delete("cached_reports", r.id)));
}

// SETTINGS — small key/value store for user preferences
export async function getSetting<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const row = await db.get("settings", key);
  if (!row) return null;
  return (row as { value: unknown }).value as T;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}
