"use client";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";

const THRESHOLD = 72;
const INDICATOR_SIZE = 32;

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}) {
  const { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(onRefresh);

  const progress = Math.min(pullY / THRESHOLD, 1);
  const isActive = pullY > 4 || refreshing;
  const isSnapping = pullY === 0;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: "relative" }}
    >
      {/* Spinner — sits above the content, slides into view as you pull */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: pullY - INDICATOR_SIZE - 8,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          height: INDICATOR_SIZE + 8,
          pointerEvents: "none",
          opacity: isActive ? 1 : 0,
          transition: isSnapping ? "top 0.2s ease, opacity 0.15s" : "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: INDICATOR_SIZE,
            height: INDICATOR_SIZE,
            borderRadius: "50%",
            borderWidth: "2.5px",
            borderStyle: "solid",
            borderColor: "var(--border-subtle)",
            borderTopColor: "hsl(var(--brand))",
            transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
            animation: refreshing ? "spin 0.75s linear infinite" : undefined,
            transition: refreshing ? undefined : "transform 0.05s linear",
          }}
        />
      </div>

      {/* Content shifts down with pull, snaps back on release */}
      <div
        style={{
          transform: `translateY(${pullY}px)`,
          transition: isSnapping ? "transform 0.2s ease" : "none",
          willChange: pullY > 0 ? "transform" : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
