"use client";
import { useRef, useState, useCallback } from "react";

const THRESHOLD = 72;
const DAMPING = 0.45;
const MAX_PULL = THRESHOLD + 24;

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const startY = useRef<number | null>(null);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const scroller = document.getElementById("main-content");
      if (!scroller || scroller.scrollTop > 0 || refreshing) return;
      startY.current = e.touches[0].clientY;
    },
    [refreshing]
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      startY.current = null;
      setPullY(0);
      return;
    }
    setPullY(Math.min(delta * DAMPING, MAX_PULL));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    const dist = pullY;
    startY.current = null;
    setPullY(0);
    if (dist >= THRESHOLD) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [pullY, onRefresh]);

  return { pullY, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}
