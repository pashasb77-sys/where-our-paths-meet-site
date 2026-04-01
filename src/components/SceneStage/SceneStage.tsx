"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { CelestialPair } from "@/components/CelestialPair/CelestialPair";
import { FinalMessageScreen } from "@/components/FinalMessageScreen/FinalMessageScreen";
import { SceneText } from "@/components/SceneText/SceneText";
import type { SceneData, TimelineData } from "@/lib/types";

const NEVER_BACKGROUND_URL = "/images/backgrounds/nasa-xFO2Xt33xgI-unsplash.jpg";
const STARRY_BACKGROUND_URL = "/images/backgrounds/starry-night-sky-background.jpg";
const CLOSING_BACKGROUND_URL = "/images/backgrounds/nasa-7Cz6bWjdlDs-unsplash.jpg";

type Props = {
  timeline: TimelineData;
  scene: SceneData;
  sceneIndex: number;
  sceneCount: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function SceneStage({ timeline, scene, sceneIndex, sceneCount }: Props) {
  const reduceMotion = useReducedMotion();
  const sceneKey = `${timeline.id}-${scene.title}`;
  const visualSceneIndex = timeline.id === "never" ? 0 : sceneIndex;
  const visualSceneCount = timeline.id === "never" ? 1 : sceneCount;
  const visualSceneKey = timeline.id === "never" ? `${timeline.id}-static-visual` : sceneKey;
  const isFinalScene = scene.finalScreen === true;
  const isClosingScene = timeline.id === "imagine" && isFinalScene;

  const stageStyle = useMemo(() => {
    const isNeverScene = timeline.id === "never";
    const [baseA, baseB] = timeline.theme.gradient;
    const [ambientA, ambientB] = timeline.theme.ambient;
    const sceneProgress = visualSceneCount > 1 ? visualSceneIndex / (visualSceneCount - 1) : 0;
    const vignette = clamp(timeline.theme.vignette + visualSceneIndex * 0.03, 0.42, 0.84);
    const primaryX = timeline.id === "never" ? 18 + sceneProgress * 7 : timeline.id === "now" ? 50 : 62 - sceneProgress * 8;
    const primaryY = timeline.id === "never" ? 18 + sceneProgress * 3 : timeline.id === "now" ? 46 : 34 - sceneProgress * 4;
    const secondaryX = timeline.id === "never" ? 82 - sceneProgress * 4 : timeline.id === "now" ? 82 : 78 - sceneProgress * 10;
    const secondaryY = timeline.id === "never" ? 28 + sceneProgress * 2 : timeline.id === "now" ? 28 : 30 - sceneProgress * 2;

    if (isNeverScene) {
      return {
        backgroundColor: "#000",
        backgroundImage: `url("${NEVER_BACKGROUND_URL}")`,
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, ${clamp(vignette * 0.42, 0.18, 0.46)})`
      } as const;
    }

    if (timeline.id === "now" || timeline.id === "imagine") {
      return {
        backgroundColor: "#000",
        backgroundImage: `url("${STARRY_BACKGROUND_URL}")`,
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, ${isClosingScene ? 0.18 : timeline.id === "now" ? 0.28 : 0.22})`
      } as const;
    }

    return {
      backgroundImage: `
        radial-gradient(1100px 840px at ${primaryX}% ${primaryY}%, ${ambientA}, transparent 62%),
        radial-gradient(960px 700px at ${secondaryX}% ${secondaryY}%, ${ambientB}, transparent 58%),
        linear-gradient(180deg, ${baseA}, ${baseB})
      `,
      boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, ${vignette})`
    } as const;
  }, [isClosingScene, timeline.id, timeline.theme, visualSceneCount, visualSceneIndex]);

  const driftStyle = useMemo(() => {
    const [ambientA, ambientB] = timeline.theme.ambient;
    const sceneProgress = visualSceneCount > 1 ? visualSceneIndex / (visualSceneCount - 1) : 0;
    const driftX = timeline.id === "never" ? 25 + sceneProgress * 8 : 18 - sceneProgress * 4;
    const driftY = timeline.id === "never" ? 18 + sceneProgress * 4 : 16 + sceneProgress * 3;
    const oppositeX = timeline.id === "never" ? 78 - sceneProgress * 8 : 82 - sceneProgress * 6;
    return {
      backgroundImage: `
        radial-gradient(680px 540px at ${driftX}% ${driftY}%, ${ambientA}, transparent 68%),
        radial-gradient(720px 560px at ${oppositeX}% 30%, ${ambientB}, transparent 66%)
      `
    } as const;
  }, [timeline.id, timeline.theme, visualSceneCount, visualSceneIndex]);

  return (
    <div className="scene-stage" aria-label={`${timeline.label}, scene ${sceneIndex + 1} of ${sceneCount}`}>
      <div aria-hidden="true" className="transition-overlay" style={stageStyle} />

      {isClosingScene ? (
        <motion.div
          aria-hidden="true"
          key={`${sceneKey}-closing-background`}
          className="transition-overlay"
          style={{
            backgroundColor: "#000",
            backgroundImage: `url("${CLOSING_BACKGROUND_URL}")`,
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            boxShadow: "inset 0 0 0 9999px rgba(0, 0, 0, 0.24)"
          }}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.035, filter: reduceMotion ? "none" : "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0.01 : 1.15, ease: [0.2, 0.8, 0.2, 1] }}
        />
      ) : null}

      {!isClosingScene ? (
        <div
          aria-hidden="true"
          key={`${visualSceneKey}-drift`}
          className="scene-stage-drift"
          style={{
            ...driftStyle,
            opacity: reduceMotion ? 0.18 : 0.24
          }}
        />
      ) : null}

      <div aria-hidden="true" className="scene-stage-grain" />
      <div aria-hidden="true" className="scene-stage-vignette" />

      {!isClosingScene ? (
        <CelestialPair
          scene={scene}
          timeline={timeline}
          sceneIndex={visualSceneIndex}
          sceneCount={visualSceneCount}
        />
      ) : null}

      <div className="scene-stage-content">
        <AnimatePresence initial={false} mode="sync">
          {isFinalScene ? (
            <FinalMessageScreen key={`${sceneKey}-final`} scene={scene} />
          ) : (
            <SceneText key={sceneKey} sceneKey={sceneKey} lines={scene.textLines} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
