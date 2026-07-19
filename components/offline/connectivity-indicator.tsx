"use client";

import { useState, useEffect } from "react";
import { getPendingCount } from "@/lib/db";

export function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const updatePending = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };

    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("es", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updatePending();
    updateTime();

    const onOnline = () => {
      setIsOnline(true);
      updatePending();
    };
    const onOffline = () => {
      setIsOnline(false);
      updatePending();
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const pendingInterval = setInterval(updatePending, 10000);
    const timeInterval = setInterval(updateTime, 30000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(pendingInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div
      className="connectivity-bar"
      data-online={isOnline ? "true" : "false"}
      role="status"
      aria-label={`Estado: ${isOnline ? "en línea" : "sin conexión"}`}
    >
      <span className="connectivity-dot" aria-hidden="true" />
      <span>{isOnline ? "En línea" : "Sin conexión"}</span>

      {pendingCount > 0 && (
        <span className="connectivity-pending">
          {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
        </span>
      )}

      {currentTime && <span className="connectivity-time">{currentTime}</span>}
    </div>
  );
}
