import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Module-level store for installed state — driven by the appinstalled window event.
// All hook instances share a single listener and a single source of truth.
let _installed = false;
const _installedSubs = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("appinstalled", () => {
    _installed = true;
    _installedSubs.forEach((fn) => fn());
  });
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const isInstalled = useSyncExternalStore(
    (callback) => {
      _installedSubs.add(callback);
      return () => _installedSubs.delete(callback);
    },
    () => _installed,
    () => false
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  // Clear the cached prompt when the app gets installed via OS or another tab
  useEffect(() => {
    if (isInstalled) setInstallPrompt(null);
  }, [isInstalled]);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  return { installPrompt, isInstalled, install };
}
