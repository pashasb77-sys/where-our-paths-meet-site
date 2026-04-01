import type { SceneMotionSpec } from "@/data/stickmanMotion";
import { getSceneMotion as getStickmanSceneMotion } from "@/data/stickmanMotion";
import type { TimelineType } from "@/lib/types";

export type { SceneMotionSpec };

export function getSceneMotion(timelineId: TimelineType, sceneIndex: number): SceneMotionSpec {
  return getStickmanSceneMotion(timelineId, sceneIndex);
}
