"use client";
import { usePullToRefresh } from "@/lib/hooks/use-pull-to-refresh";

const THRESHOLD = 72;

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
      className="pull-to-refresh"
      style={{ "--pull-y": `${pullY}px` } as React.CSSProperties}
    >
      {/* Spinner — sits above the content, slides into view as you pull */}
      <div
        aria-hidden="true"
        className="pull-to-refresh-spinner-wrap"
        data-active={isActive}
        data-snapping={isSnapping}
      >
        <div
          className="pull-to-refresh-spinner"
          data-refreshing={refreshing}
          style={{ "--pull-progress": progress } as React.CSSProperties}
        />
      </div>

      {/* Content shifts down with pull, snaps back on release */}
      <div
        className="pull-to-refresh-content"
        data-snapping={isSnapping}
        data-pulling={pullY > 0}
        style={{ "--pull-y": `${pullY}px` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
