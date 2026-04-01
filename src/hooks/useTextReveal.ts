"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useTextReveal(sceneKey: string, delays: number[]) {
  const reduceMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(() => (reduceMotion ? delays.length : 0));

  useEffect(() => {
    if (reduceMotion) {
      setVisibleCount(delays.length);
      return;
    }

    setVisibleCount(delays.length > 0 ? 1 : 0);

    const timers = delays.map((delay, index) =>
      window.setTimeout(() => {
        setVisibleCount(index + 1);
      }, Math.max(0, delay * 1000))
    );

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [delays, reduceMotion, sceneKey]);

  return visibleCount;
}
