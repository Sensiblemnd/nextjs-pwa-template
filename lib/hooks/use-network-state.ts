"use client";

import { useRef, useSyncExternalStore } from "react";

// Network Information API — not yet in lib.dom.d.ts
interface NetworkConnection extends EventTarget {
  readonly downlink?: number;
  readonly downlinkMax?: number;
  readonly effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  readonly rtt?: number;
  readonly saveData?: boolean;
  readonly type?:
    "bluetooth" | "cellular" | "ethernet" | "none" | "wifi" | "wimax" | "other" | "unknown";
}

export interface NetworkState {
  online: boolean;
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  rtt?: number;
  saveData?: boolean;
  type?: "bluetooth" | "cellular" | "ethernet" | "none" | "wifi" | "wimax" | "other" | "unknown";
}

function getConnection(): NetworkConnection | undefined {
  const nav = navigator as Navigator & {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function isShallowEqual(a: NetworkState, b: NetworkState): boolean {
  const keysA = Object.keys(a) as (keyof NetworkState)[];
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  const connection = getConnection();
  connection?.addEventListener("change", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
    connection?.removeEventListener("change", callback);
  };
}

const SERVER_SNAPSHOT: NetworkState = { online: true };

export function useNetworkState(): NetworkState {
  const cache = useRef<NetworkState>({} as NetworkState);

  return useSyncExternalStore(
    subscribe,
    () => {
      const connection = getConnection();
      const next: NetworkState = {
        online: navigator.onLine,
        downlink: connection?.downlink,
        downlinkMax: connection?.downlinkMax,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
        type: connection?.type,
      };
      if (isShallowEqual(cache.current, next)) return cache.current;
      cache.current = next;
      return next;
    },
    () => SERVER_SNAPSHOT
  );
}
