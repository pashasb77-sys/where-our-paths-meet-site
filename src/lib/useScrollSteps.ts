"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StepOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

const DEFAULT_THRESHOLD: number[] = [0.35, 0.55, 0.75];

export function useScrollSteps(stepCount: number, options?: StepOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepEls = useRef<Array<HTMLDivElement | null>>([]);

  const rootMargin = options?.rootMargin ?? "0px 0px -15% 0px";
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;

  const setStepEl = useMemo(() => {
    return Array.from({ length: stepCount }, (_, index) => {
      return (el: HTMLDivElement | null) => {
        stepEls.current[index] = el;
      };
    });
  }, [stepCount]);

  useEffect(() => {
    const elements = stepEls.current.filter(Boolean) as HTMLDivElement[];
    if (elements.length === 0) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        const best = visible.reduce((acc, cur) =>
          cur.intersectionRatio > acc.intersectionRatio ? cur : acc
        );

        const indexAttr = (best.target as HTMLDivElement).dataset.stepIndex;
        if (indexAttr == null) return;
        const nextIndex = Number(indexAttr);
        if (!Number.isFinite(nextIndex)) return;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setActiveIndex(nextIndex));
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    for (const el of elements) observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [stepCount, rootMargin, threshold]);

  return { activeIndex, setActiveIndex, setStepEl };
}
