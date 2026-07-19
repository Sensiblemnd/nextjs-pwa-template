"use client";

import { useEffect } from "react";
import { getSetting } from "@/lib/db";

export function FontScaleProvider() {
  useEffect(() => {
    getSetting<number>("font-scale").then((scale) => {
      if (scale && scale !== 1) {
        document.documentElement.style.setProperty("--font-scale", String(scale));
      }
    });
  }, []);

  return null;
}
