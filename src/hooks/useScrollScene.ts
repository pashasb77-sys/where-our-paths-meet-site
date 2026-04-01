"use client";

import { useEffect, useMemo, useRef } from "react";

type ScrollSceneOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

export function useScrollScene(
  sceneCount: number,
  sceneKey: string,
  onSceneChange: (sceneIndex: number) => void,
  options?: ScrollSceneOptions
) {
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const rootMargin = options?.rootMargin ?? "0px 0px -15% 0px";
  const threshold = useMemo(() => options?.threshold ?? [0.45, 0.55, 0.7], [options?.threshold]);

  const setSceneRef = useMemo(
    () =>
      Array.from({ length: sceneCount }, (_, index) => {
        return (node: HTMLElement | null) => {
          sceneRefs.current[index] = node;
        };
      }),
    [sceneCount]
  );

  useEffect(() => {
    const elements = sceneRefs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const best = visible.reduce((current, next) =>
          next.intersectionRatio > current.intersectionRatio ? next : current
        );

        const indexAttr = (best.target as HTMLElement).dataset.sceneIndex;
        if (indexAttr == null) return;

        const nextIndex = Number(indexAttr);
        if (!Number.isFinite(nextIndex)) return;

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => onSceneChange(nextIndex));
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    for (const element of elements) observer.observe(element);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [onSceneChange, rootMargin, sceneCount, sceneKey, threshold]);

  return { setSceneRef, sceneRefs };
}
