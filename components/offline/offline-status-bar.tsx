"use client";

import { useState, useEffect } from "react";
import { Check, WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function OfflineStatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="offline-banner"
      data-online={isOnline ? "true" : "false"}
    >
      {isOnline ? (
        <Check size={15} strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <WifiOff size={15} strokeWidth={2} aria-hidden="true" />
      )}
      {isOnline ? t.statusBar.restored : t.statusBar.offline}
    </div>
  );
}
