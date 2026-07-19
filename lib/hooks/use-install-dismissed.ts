import { useSyncExternalStore } from "react";

const DISMISS_KEY = "install_bar_dismissed";

let _dismissed = false;
const _subs = new Set<() => void>();

if (typeof window !== "undefined") {
  _dismissed = localStorage.getItem(DISMISS_KEY) === "1";
}

function subscribe(fn: () => void) {
  _subs.add(fn);
  return () => _subs.delete(fn);
}

export function dismissInstallBar() {
  _dismissed = true;
  if (typeof window !== "undefined") localStorage.setItem(DISMISS_KEY, "1");
  _subs.forEach((fn) => fn());
}

export function useInstallDismissed() {
  return useSyncExternalStore(
    subscribe,
    () => _dismissed,
    () => false
  );
}
