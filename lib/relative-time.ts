import type { Dictionary } from "@/lib/i18n";

export function relativeTime(ts: number, t: Dictionary["time"]): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return t.minutesAgo(mins);
  if (hours < 24) return t.hoursAgo(hours);
  return t.daysAgo(days);
}
