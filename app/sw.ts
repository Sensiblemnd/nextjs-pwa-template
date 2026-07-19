import { openDB } from "idb";
import { defaultCache, PAGES_CACHE_NAME } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  actions?: { action: string; title: string }[];
}

const SYNC_TAG_REPORTS = "sync-reports";
// Must stay in sync with DB_NAME/DB_VERSION in lib/db/index.ts
const DB_NAME = "pwa-template";
const DB_VERSION = 1;
const MAX_RETRIES = 3;

// The Serwist build plugin injects the manifest at this exact expression and
// requires it to appear only once in the source — reference this const instead
const precacheManifest = self.__SW_MANIFEST;

const serwist = new Serwist({
  precacheEntries: precacheManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Google Fonts — cache first
    {
      matcher: ({ url }: { url: URL }) =>
        url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })],
      }),
    },
    // Report data — network first, 3s timeout fallback to cache
    {
      matcher: /\/api\/reports/,
      handler: new NetworkFirst({
        cacheName: "reports",
        networkTimeoutSeconds: 3,
        plugins: [new ExpirationPlugin({ maxEntries: 50 })],
      }),
    },
    // Other API routes — network first; avoids serving stale data
    {
      matcher: /\/api\//,
      handler: new NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 4,
        plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 })],
      }),
    },
    // Page navigations + RSC payloads — defaultCache's equivalents have NO
    // networkTimeoutSeconds, so a barely-alive connection hangs until the
    // browser gives up (~60s → Safari error page) even when the page is
    // cached. These mirror defaultCache's routes but cut to cache after 5s.
    {
      matcher: ({ request, url: { pathname }, sameOrigin }) =>
        request.headers.get("RSC") === "1" &&
        request.headers.get("Next-Router-Prefetch") === "1" &&
        sameOrigin &&
        !pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.rscPrefetch,
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 })],
      }),
    },
    {
      matcher: ({ request, url: { pathname }, sameOrigin }) =>
        request.headers.get("RSC") === "1" && sameOrigin && !pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.rsc,
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 })],
      }),
    },
    // 7-day expiry (vs defaultCache's 24h): the shell is static and a stale
    // shell beats the offline page — live data comes from the api caches
    {
      matcher: ({ request, url: { pathname }, sameOrigin }) =>
        request.destination === "document" && sameOrigin && !pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.html,
        networkTimeoutSeconds: 5,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 7 * 24 * 60 * 60 })],
      }),
    },
    // Static assets
    ...defaultCache,
  ],
  // Last resort for failed navigations with nothing cached: without this,
  // NetworkFirst throws and the browser shows "FetchEvent.respondWith
  // received an error: no-response" instead of anything useful
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

// A new build's precache only holds that build's hashed assets, but the pages
// caches can still hold HTML from a previous build pointing at CSS/JS that no
// longer exists anywhere — served offline, that renders an unstyled page.
// Purge page caches when the build changes so HTML and assets can never mix
// builds; worst case offline right after a deploy is the /offline fallback.
const buildId =
  (precacheManifest ?? [])
    .map((entry) => (typeof entry === "string" ? entry : entry.url))
    .find((url) => url.endsWith("_buildManifest.js"))
    ?.match(/\/_next\/static\/([^/]+)\//)?.[1] ?? "unknown";

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const meta = await caches.open("sw-meta");
      const stored = await meta.match("/build-id");
      if (stored && (await stored.text()) === buildId) return;
      await Promise.all(
        [PAGES_CACHE_NAME.html, PAGES_CACHE_NAME.rsc, PAGES_CACHE_NAME.rscPrefetch].map((name) =>
          caches.delete(name)
        )
      );
      await meta.put("/build-id", new Response(buildId));
    })()
  );
});

serwist.addEventListeners();

// ── Background Sync ──────────────────────────────
self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === SYNC_TAG_REPORTS) {
    syncEvent.waitUntil(syncPendingReports());
  }
});

interface QueuedReport {
  id: string;
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  severity: string;
  status: string;
  createdAt: number;
  retryCount?: number;
}

// Shares the "pwa-template-sync-reports" lock with lib/sync so the page-level
// sync and this background sync never drain the queue concurrently. ifAvailable
// skips instead of queueing; without Web Locks the client-supplied report id
// keeps a double sync from duplicating server-side.
async function syncPendingReports(): Promise<void> {
  if ("locks" in self.navigator) {
    return self.navigator.locks.request(
      "pwa-template-sync-reports",
      { ifAvailable: true },
      async (lock) => {
        if (!lock) return;
        return drainQueue();
      }
    );
  }
  return drainQueue();
}

async function drainQueue(): Promise<void> {
  const db = await openDB(DB_NAME, DB_VERSION);

  // Recover rows stranded in "syncing" by an interrupted run — they are
  // otherwise never picked up again
  const stale = (await db.getAllFromIndex("reports", "by-status", "syncing")) as QueuedReport[];
  for (const report of stale) {
    await db.put("reports", { ...report, status: "pending" });
  }

  const pending = (await db.getAllFromIndex("reports", "by-status", "pending")) as QueuedReport[];

  if (pending.length === 0) return;

  let synced = 0;
  for (const report of pending) {
    try {
      await db.put("reports", { ...report, status: "syncing" });

      const res = await fetch("/api/reports", {
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
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await db.put("reports", { ...report, status: "synced", syncedAt: Date.now() });
      synced++;
    } catch (err) {
      const nextRetry = (report.retryCount ?? 0) + 1;
      await db.put("reports", {
        ...report,
        status: nextRetry >= MAX_RETRIES ? "error" : "pending",
        retryCount: nextRetry,
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => client.postMessage({ type: "SYNC_COMPLETE", synced }));
}

// ── Push Notifications ───────────────────────────
// Receiving end only — sending push requires a server with VAPID keys.
self.addEventListener("push", (event: Event) => {
  const pushEvent = event as PushEvent;
  let data: Record<string, unknown> = {};
  try {
    data = pushEvent.data?.json() ?? {};
  } catch {
    data = { body: pushEvent.data?.text() };
  }

  const body = typeof data.body === "string" ? data.body : "Tienes una nueva notificación";
  const title = typeof data.title === "string" ? data.title : "PWA Template";
  const tag = typeof data.tag === "string" ? data.tag : "pwa-template";
  const url = typeof data.url === "string" ? data.url : "/";
  const critical = data.critical === true;

  const options: ExtendedNotificationOptions = {
    body,
    icon: "/icons/icon.png",
    badge: "/icons/badge.png",
    tag,
    data: { url },
    requireInteraction: critical,
    vibrate: critical ? [200, 100, 200] : [100],
    actions: [
      { action: "view", title: "Ver" },
      { action: "dismiss", title: "Cerrar" },
    ],
  };

  pushEvent.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: Event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();

  if (notifEvent.action === "view" || !notifEvent.action) {
    const rawUrl =
      typeof notifEvent.notification.data?.url === "string"
        ? notifEvent.notification.data.url
        : "/";
    // Never open cross-origin URLs from notification data — fall back to home
    // if the origin doesn't match
    const resolved = new URL(rawUrl, self.location.href);
    const targetUrl =
      resolved.origin === self.location.origin ? resolved : new URL("/", self.location.href);
    notifEvent.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          const clientUrl = new URL(client.url, self.location.href);
          if (clientUrl.pathname === targetUrl.pathname && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl.href);
      })
    );
  }
});

// ── Type declarations for non-standard APIs ──────
interface SyncEvent extends Event {
  tag: string;
  waitUntil(promise: Promise<unknown>): void;
}
