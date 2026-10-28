"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";

// Soft navigations and resuming an installed app from the background never
// trigger the browser's own sw.js update check — re-check on resume instead
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function ServiceWorkerRegistrar() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadOnControllerChange = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Serwist is disabled in dev (next.config.ts) — a stale public/sw.js from
    // an earlier build would serve cached prod assets, so dev must stay
    // unregistered. Never unregister in production: re-registering on every
    // load makes the initial install look like an update and loops the toast.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister().catch(() => {});
        }
      });
      return;
    }

    // Only the tab that accepted the update reloads. Other tabs keep their
    // toast, so unsaved input survives until the user refreshes them too.
    const handleControllerChange = () => {
      if (reloadOnControllerChange.current) window.location.reload();
    };

    let lastUpdateCheck = Date.now();
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastUpdateCheck < UPDATE_CHECK_INTERVAL_MS) return;
      lastUpdateCheck = Date.now();
      registrationRef.current?.update().catch(() => {});
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    navigator.serviceWorker
      // Always hit the network for sw.js, never the HTTP cache
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        registrationRef.current = reg;

        // An update fetched on a previous visit may still be parked in waiting
        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          let installed = false;
          newWorker.addEventListener("statechange", () => {
            // A controller only exists if an older SW owns the page — so this
            // is a real new version, not the first-ever install
            if (newWorker.state === "installed") {
              installed = true;
              if (navigator.serviceWorker.controller) setUpdateAvailable(true);
            }
            // Precaching is atomic: one failed fetch discards the whole install
            // and the old SW silently stays in charge
            if (newWorker.state === "redundant" && !installed) {
              console.error("[SW] Install failed — check precache requests in DevTools");
            }
          });
        });
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const applyUpdate = () => {
    const waiting = registrationRef.current?.waiting;
    // Another tab already activated it — this tab just needs the new build
    if (!waiting) {
      window.location.reload();
      return;
    }
    reloadOnControllerChange.current = true;
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  if (!updateAvailable) return null;

  return (
    <div role="status" aria-live="polite" className="sw-update-toast">
      <span>{t.swUpdate.newVersion}</span>
      <button onClick={applyUpdate} className="sw-update-btn">
        {t.swUpdate.refresh}
      </button>
    </div>
  );
}
