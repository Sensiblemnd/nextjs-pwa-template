"use client";

import { useState, useEffect, useCallback } from "react";
import { getPendingCount } from "@/lib/db";
import { syncPendingReports } from "@/lib/sync";
import { useNetworkState } from "@/lib/hooks/use-network-state";
import { useI18n } from "@/lib/i18n/client";

export function OfflineQueueStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { online } = useNetworkState();
  const { t } = useI18n();

  const refresh = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || !online) return;
    setIsSyncing(true);
    try {
      await syncPendingReports();
      await refresh();
    } finally {
      setIsSyncing(false);
    }
  };

  // Load count on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-sync: fires on mount and whenever online flips true.
  // Checks pending count first so isSyncing never flashes when the queue is empty.
  useEffect(() => {
    if (!online) return;
    let cancelled = false;

    getPendingCount().then((count) => {
      if (cancelled || count === 0) return;
      setIsSyncing(true);
      syncPendingReports()
        .then(() => {
          if (!cancelled) refresh();
        })
        .finally(() => {
          if (!cancelled) setIsSyncing(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [online, refresh]);

  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <div className="offline-queue">
      <span className="queue-count">{isSyncing ? "↻" : pendingCount}</span>
      <span>{isSyncing ? t.queue.syncing : t.queue.pending(pendingCount)}</span>
      {!isSyncing && online && (
        <button className="queue-sync-btn" onClick={handleManualSync}>
          {t.queue.syncNow}
        </button>
      )}
    </div>
  );
}
