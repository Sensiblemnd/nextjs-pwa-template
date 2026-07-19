"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistrar() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

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

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // An update fetched on a previous visit may still be parked in waiting
        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // A controller only exists if an older SW owns the page — so this
            // is a real new version, not the first-ever install
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch((err) => {
        console.error("[SW] Registration failed:", err);
      });
  }, []);

  if (!updateAvailable) return null;

  return (
    <div role="status" aria-live="polite" className="sw-update-toast">
      <span>Nueva versión disponible</span>
      <button onClick={() => window.location.reload()} className="sw-update-btn">
        Actualizar
      </button>
    </div>
  );
}
