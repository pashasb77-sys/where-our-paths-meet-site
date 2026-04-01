"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { OpeningScene } from "@/components/OpeningScene/OpeningScene";
import { SceneStage } from "@/components/SceneStage/SceneStage";
import { TimelineSelector } from "@/components/TimelineSelector/TimelineSelector";
import { NarrativeStateProvider } from "@/context/NarrativeState";
import { timelines } from "@/data/timelines";
import { useScrollScene } from "@/hooks/useScrollScene";
import type { SceneData, TimelineData, TimelineType } from "@/lib/types";

const TEXT_REVEAL_STEP_VH = 28;

type TimelineStageSnapshot = {
  timeline: TimelineData;
  scene: SceneData;
  sceneIndex: number;
  sceneCount: number;
};

type TimelineSwitchOverlayState = {
  from: TimelineStageSnapshot;
  to: TimelineStageSnapshot;
};

function getRenderedScenesForTimeline(timelineId: TimelineType) {
  const currentTimeline = timelines[timelineId];
  if (timelineId !== "never") {
    return currentTimeline.scenes;
  }

  return currentTimeline.scenes.slice(1);
}

export function TimelineContainer() {
  const reduceMotion = useReducedMotion();
  const [timeline, setTimeline] = useState<TimelineType>("never");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [textStep, setTextStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [introTransitionProgress, setIntroTransitionProgress] = useState(0);
  const [timelineSwitchOverlay, setTimelineSwitchOverlay] = useState<TimelineSwitchOverlayState | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const timelineSwitchTimer = useRef<number | null>(null);
  const timelineResetTimer = useRef<number | null>(null);
  const timelineResetRaf = useRef<number | null>(null);
  const isTimelineSwitchingRef = useRef(false);
  const introRef = useRef<HTMLElement | null>(null);
  const timelineStartRef = useRef<HTMLDivElement | null>(null);

  const currentTimeline = timelines[timeline];
  const introPreviewScene = timelines.never.scenes[0];
  const renderedScenes = useMemo(() => getRenderedScenesForTimeline(timeline), [timeline]);
  const sceneCount = renderedScenes.length;
  const currentScene = renderedScenes[sceneIndex] ?? renderedScenes[0] ?? currentTimeline.scenes[0];

  const scrollOptions = useMemo(
    () => ({
      rootMargin: "0px 0px -15% 0px",
      threshold: [0.45, 0.55, 0.7]
    }),
    []
  );

  const handleSceneChange = useCallback((nextSceneIndex: number) => {
    if (isTimelineSwitchingRef.current) {
      return;
    }

    setSceneIndex(nextSceneIndex);
  }, []);

  const { setSceneRef, sceneRefs } = useScrollScene(sceneCount, timeline, handleSceneChange, scrollOptions);

  const scrollToTimelineStart = useCallback(() => {
    if (typeof window === "undefined" || !timelineStartRef.current) {
      return;
    }

    const top = timelineStartRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top,
      behavior: "auto"
    });
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const historyState = window.history;
    const previousScrollRestoration = historyState.scrollRestoration;
    historyState.scrollRestoration = "manual";

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

    const raf = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto"
      });
    });

    return () => {
      window.cancelAnimationFrame(raf);
      historyState.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    setIsTransitioning(true);
    if (transitionTimer.current != null) {
      window.clearTimeout(transitionTimer.current);
    }

    transitionTimer.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 560);

    return () => {
      if (transitionTimer.current != null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, [sceneIndex, timeline]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current != null) {
        window.clearTimeout(transitionTimer.current);
      }

      if (timelineSwitchTimer.current != null) {
        window.clearTimeout(timelineSwitchTimer.current);
      }

      if (timelineResetTimer.current != null) {
        window.clearTimeout(timelineResetTimer.current);
      }

      if (timelineResetRaf.current != null) {
        window.cancelAnimationFrame(timelineResetRaf.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let raf = 0;

    const updateSelectorVisibility = () => {
      const introElement = introRef.current;
      if (!introElement) {
        setShowSelector(true);
        setIntroTransitionProgress(1);
        return;
      }

      const introRect = introElement.getBoundingClientRect();
      const introTravel = Math.max(introElement.offsetHeight - window.innerHeight, 1);
      const nextProgress = Math.max(0, Math.min(1, -introRect.top / introTravel));
      const shouldShow = nextProgress >= 0.84;

      setIntroTransitionProgress((current) =>
        Math.abs(current - nextProgress) < 0.002 ? current : nextProgress
      );
      setShowSelector((current) => (current === shouldShow ? current : shouldShow));
    };

    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateSelectorVisibility);
    };

    updateSelectorVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setTextStep(Math.max(0, currentScene.textLines.length - 1));
      return;
    }

    let raf = 0;

    const updateTextStepFromScroll = () => {
      const activeScene = sceneRefs.current[sceneIndex];
      if (!activeScene || typeof window === "undefined") {
        return;
      }

      const totalLines = Math.max(currentScene.textLines.length, 1);
      const maxTravel = Math.max(activeScene.offsetHeight - window.innerHeight, 1);
      const sceneTopProgress = Math.max(0, Math.min(1, -activeScene.getBoundingClientRect().top / maxTravel));
      const nextTextStep = Math.max(0, Math.min(totalLines - 1, Math.floor(sceneTopProgress * totalLines)));

      setTextStep((current) => (current === nextTextStep ? current : nextTextStep));
    };

    const handleScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateTextStepFromScroll);
    };

    updateTextStepFromScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [currentScene.textLines.length, reduceMotion, sceneIndex, sceneRefs]);

  const handleSelectTimeline = (nextTimeline: TimelineType) => {
    if (nextTimeline === timeline || timelineSwitchOverlay) {
      return;
    }

    const nextTimelineData = timelines[nextTimeline];
    const nextRenderedScenes = getRenderedScenesForTimeline(nextTimeline);
    const nextScene = nextRenderedScenes[0] ?? nextTimelineData.scenes[0];
    const nextSceneCount = nextRenderedScenes.length;

    setTimelineSwitchOverlay({
      from: {
        timeline: currentTimeline,
        scene: currentScene,
        sceneIndex,
        sceneCount
      },
      to: {
        timeline: nextTimelineData,
        scene: nextScene,
        sceneIndex: 0,
        sceneCount: nextSceneCount
      }
    });

    setTimeline(nextTimeline);
    setSceneIndex(0);
    setTextStep(0);
    setIsTransitioning(true);
    isTimelineSwitchingRef.current = true;
    scrollToTimelineStart();

    if (timelineResetRaf.current != null) {
      window.cancelAnimationFrame(timelineResetRaf.current);
    }

    timelineResetRaf.current = window.requestAnimationFrame(() => {
      scrollToTimelineStart();
    });

    if (timelineResetTimer.current != null) {
      window.clearTimeout(timelineResetTimer.current);
    }

    timelineResetTimer.current = window.setTimeout(() => {
      scrollToTimelineStart();
      setSceneIndex(0);
      setTextStep(0);
    }, reduceMotion ? 20 : 90);

    if (timelineSwitchTimer.current != null) {
      window.clearTimeout(timelineSwitchTimer.current);
    }

    timelineSwitchTimer.current = window.setTimeout(() => {
      setTimelineSwitchOverlay(null);
      isTimelineSwitchingRef.current = false;
      setSceneIndex(0);
      setTextStep(0);
    }, reduceMotion ? 40 : 980);
  };

  const handleBegin = () => {
    if (typeof window === "undefined" || !timelineStartRef.current) {
      return;
    }

    const top = timelineStartRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  };

  const narrativeState = {
    timeline,
    sceneIndex,
    textStep,
    isTransitioning,
    setTimeline: handleSelectTimeline,
    setSceneIndex,
    setTextStep,
    setIsTransitioning
  };

  return (
    <NarrativeStateProvider value={narrativeState}>
      <section className="timeline-shell" aria-label={currentTimeline.label}>
        <section ref={introRef} className="opening-scene-shell">
          <OpeningScene
            onBegin={handleBegin}
            transitionProgress={introTransitionProgress}
            previewLines={introPreviewScene?.textLines ?? []}
          />
        </section>

        <div className={`selector-shell${showSelector ? " selector-shell-visible" : ""}`}>
          <TimelineSelector
            currentTimeline={timeline}
            onSelect={handleSelectTimeline}
            disabled={timelineSwitchOverlay != null}
          />
        </div>

        <div className="srOnly" aria-live="polite">
          {currentTimeline.label}, scene {sceneIndex + 1} of {sceneCount}
        </div>

        <div ref={timelineStartRef} className="timeline-scroller">
          <div className="timeline-stage-sticky">
            <SceneStage
              timeline={currentTimeline}
              scene={currentScene}
              sceneIndex={sceneIndex}
              sceneCount={sceneCount}
            />
          </div>

          <div aria-hidden="true">
            {renderedScenes.map((scene, index) => (
              <section
                key={`${timeline}-${scene.title}-${index}`}
                ref={setSceneRef[index]}
                data-scene-index={index}
                className="scene-step"
                style={{
                  height: `calc(100svh + ${Math.max(scene.textLines.length - 1, 0)} * ${TEXT_REVEAL_STEP_VH}svh)`
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {timelineSwitchOverlay ? (
            <motion.div
              key={`${timelineSwitchOverlay.from.timeline.id}-${timelineSwitchOverlay.to.timeline.id}-overlay`}
              className="timeline-switch-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              aria-hidden="true"
            >
              <motion.div
                className="timeline-switch-layer"
                initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 1.035, filter: reduceMotion ? "none" : "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: reduceMotion ? 0.01 : 0.82, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <SceneStage
                  timeline={timelineSwitchOverlay.to.timeline}
                  scene={timelineSwitchOverlay.to.scene}
                  sceneIndex={timelineSwitchOverlay.to.sceneIndex}
                  sceneCount={timelineSwitchOverlay.to.sceneCount}
                />
              </motion.div>

              <motion.div
                className="timeline-switch-disintegration"
                initial={{ opacity: 0 }}
                animate={{ opacity: reduceMotion ? 0 : [0.08, 0.36, 0.12] }}
                transition={{ duration: reduceMotion ? 0.01 : 0.92, times: [0, 0.45, 1], ease: "easeInOut" }}
              />

              <motion.div
                className="timeline-switch-layer"
                initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                animate={{ opacity: 0, scale: reduceMotion ? 1 : 1.04, filter: reduceMotion ? "none" : "blur(16px)" }}
                transition={{ duration: reduceMotion ? 0.01 : 0.88, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <SceneStage
                  timeline={timelineSwitchOverlay.from.timeline}
                  scene={timelineSwitchOverlay.from.scene}
                  sceneIndex={timelineSwitchOverlay.from.sceneIndex}
                  sceneCount={timelineSwitchOverlay.from.sceneCount}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </NarrativeStateProvider>
  );
}
