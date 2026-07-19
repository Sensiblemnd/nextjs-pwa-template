"use client";

import { getPendingReports, recoverStaleSyncingReports, updateReportStatus } from "@/lib/db";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
// Must stay in sync with the lock name in app/sw.ts
export const SYNC_LOCK_NAME = "pwa-template-sync-reports";

const EMPTY_RESULT = { synced: 0, failed: 0 };

export async function syncPendingReports(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return EMPTY_RESULT;
  }

  // Web Locks (Chrome 69+): the page sync and the SW background sync share this
  // lock so only one context drains the queue at a time. ifAvailable skips
  // instead of queueing — the other context is already handling it. Browsers
  // without Web Locks run unlocked; client-supplied report ids keep a double
  // sync from duplicating server-side.
  if ("locks" in navigator) {
    return navigator.locks.request(SYNC_LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (!lock) {
        return EMPTY_RESULT;
      }
      return drainQueue(onProgress);
    });
  }
  return drainQueue(onProgress);
}

async function drainQueue(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  await recoverStaleSyncingReports();

  const pending = await getPendingReports();
  if (pending.length === 0) return EMPTY_RESULT;

  let synced = 0;
  let failed = 0;

  for (const report of pending) {
    await updateReportStatus(report.id, "syncing");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: report.id,
          category: report.category,
          description: report.description,
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
          severity: report.severity,
          createdAt: report.createdAt,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await updateReportStatus(report.id, "synced", { syncedAt: Date.now() });
      synced++;
      onProgress?.(synced, pending.length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      const nextRetry = (report.retryCount ?? 0) + 1;

      if (nextRetry >= MAX_RETRIES) {
        await updateReportStatus(report.id, "error", {
          errorMessage: errorMsg,
          retryCount: nextRetry,
        });
        failed++;
      } else {
        await updateReportStatus(report.id, "pending", {
          errorMessage: errorMsg,
          retryCount: nextRetry,
        });
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * nextRetry));
      }
    }
  }

  if (synced > 0) {
    window.dispatchEvent(new CustomEvent("pwa:synced"));
  }
  return { synced, failed };
}
