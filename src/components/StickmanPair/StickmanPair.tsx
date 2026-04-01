"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Stickman } from "@/components/Stickman/Stickman";
import { getSceneMotion } from "@/data/stickmanMotion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { SceneData, StickmanState, TimelineType, ViewportMode } from "@/lib/types";

type Props = {
  scene: SceneData;
  timelineId: TimelineType;
  sceneIndex: number;
};

function normalizeState(state: StickmanState): StickmanState {
  if (state === "synchronized-walk") return "synchronized_walk";
  if (state === "separated-walk") return "separated_walk";
  return state;
}

function viewportModeFromQuery(isMobile: boolean): ViewportMode {
  return isMobile ? "mobile" : "desktop";
}

export function StickmanPair({ scene, timelineId, sceneIndex }: Props) {
  const reducedMotion = useReducedMotion() === true;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const viewportMode = viewportModeFromQuery(isMobile);
  const motionSpec = getSceneMotion(timelineId, sceneIndex);
  const pose = normalizeState(scene.stickmanState);
  const gap = motionSpec.gapPx[viewportMode];
  const figureSize = viewportMode === "mobile" ? 148 : 178;

  return (
    <div className="scene-pair" aria-hidden="true">
      <div className="scene-ground" />

      <motion.div
        className="scene-pair-figure"
        initial={false}
        animate={{ x: -gap / 2 }}
      >
        <Stickman
          side="left"
          pose={pose}
          phaseOffset={0}
          gapPx={motionSpec.gapPx}
          viewportMode={viewportMode}
          reducedMotion={reducedMotion}
          sceneMotion={motionSpec}
          size={figureSize}
        />
      </motion.div>

      <motion.div
        className="scene-pair-figure"
        initial={false}
        animate={{ x: gap / 2 }}
      >
        <Stickman
          side="right"
          pose={pose}
          phaseOffset={motionSpec.phaseOffset}
          gapPx={motionSpec.gapPx}
          viewportMode={viewportMode}
          reducedMotion={reducedMotion}
          sceneMotion={motionSpec}
          size={figureSize}
        />
      </motion.div>
    </div>
  );
}
