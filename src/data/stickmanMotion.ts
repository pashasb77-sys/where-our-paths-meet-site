import type { MotionEasing, TimelineType } from "@/lib/types";

export interface SceneMotionSpec {
  gapPx: { desktop: number; mobile: number };
  phaseOffset: number;
  cycleDuration: { left: number; right: number };
  easing: MotionEasing;
  idleBreathing: boolean;
  microPauseDelay: number;
  imperfectLoop: boolean;
}

const stickmanMotion: Record<TimelineType, SceneMotionSpec[]> = {
  never: [
    {
      gapPx: { desktop: 180, mobile: 120 },
      phaseOffset: 0.35,
      cycleDuration: { left: 0.7, right: 0.95 },
      easing: "linear",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 180, mobile: 120 },
      phaseOffset: 0.35,
      cycleDuration: { left: 0.7, right: 0.95 },
      easing: "linear",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 160, mobile: 100 },
      phaseOffset: 0.3,
      cycleDuration: { left: 0.8, right: 1.0 },
      easing: "easeOut",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 180, mobile: 120 },
      phaseOffset: 0.3,
      cycleDuration: { left: 0.7, right: 0.95 },
      easing: "linear",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 180, mobile: 120 },
      phaseOffset: 0,
      cycleDuration: { left: 0.7, right: 0.95 },
      easing: "linear",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    }
  ],
  now: [
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0,
      cycleDuration: { left: 0.8, right: 0.8 },
      easing: "easeInOut",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0,
      cycleDuration: { left: 0.8, right: 0.8 },
      easing: "easeInOut",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0,
      cycleDuration: { left: 0.8, right: 0.8 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0,
      cycleDuration: { left: 0.8, right: 0.8 },
      easing: "easeInOut",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0,
      cycleDuration: { left: 0.8, right: 0.8 },
      easing: "easeInOut",
      idleBreathing: false,
      microPauseDelay: 0,
      imperfectLoop: true
    }
  ],
  imagine: [
    {
      gapPx: { desktop: 120, mobile: 80 },
      phaseOffset: 0.2,
      cycleDuration: { left: 1.0, right: 1.0 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0.3,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 100, mobile: 60 },
      phaseOffset: 0.15,
      cycleDuration: { left: 1.0, right: 1.1 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0.3,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 80, mobile: 50 },
      phaseOffset: 0.1,
      cycleDuration: { left: 1.1, right: 1.2 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0.3,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 70, mobile: 50 },
      phaseOffset: 0.05,
      cycleDuration: { left: 1.1, right: 1.2 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0.3,
      imperfectLoop: true
    },
    {
      gapPx: { desktop: 60, mobile: 40 },
      phaseOffset: 0,
      cycleDuration: { left: 1.2, right: 1.2 },
      easing: "easeInOut",
      idleBreathing: true,
      microPauseDelay: 0.3,
      imperfectLoop: true
    }
  ]
};

export function getSceneMotion(timelineId: TimelineType, sceneIndex: number): SceneMotionSpec {
  return stickmanMotion[timelineId][sceneIndex] ?? stickmanMotion[timelineId][0];
}

