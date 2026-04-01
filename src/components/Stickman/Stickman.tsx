"use client";

import { motion, type Transition } from "framer-motion";
import type { SceneMotionSpec } from "@/data/stickmanMotion";
import type { MotionEasing, StickmanState, ViewportMode } from "@/lib/types";

type StickmanSide = "left" | "right";

export interface StickmanProps {
  pose: StickmanState;
  phaseOffset: number;
  gapPx: { desktop: number; mobile: number };
  viewportMode: ViewportMode;
  reducedMotion: boolean;
  sceneMotion: SceneMotionSpec;
  side: StickmanSide;
  size?: number;
}

const DEFAULT_SIZE: Record<ViewportMode, number> = {
  desktop: 180,
  mobile: 148
};

function normalizePose(pose: StickmanState): StickmanState {
  if (pose === "synchronized-walk") return "synchronized_walk";
  if (pose === "separated-walk") return "separated_walk";
  return pose;
}

function scaleValue(value: number, viewportMode: ViewportMode) {
  return viewportMode === "mobile" ? value * 0.5 : value;
}

function scaleSeries(values: number[], viewportMode: ViewportMode) {
  return values.map((value) => scaleValue(value, viewportMode));
}

function buildHoldTimes(duration: number, holdDuration: number) {
  const holdRatio = Math.max(0, Math.min(0.34, holdDuration / duration));
  const start = 0.5 - holdRatio / 2;
  const end = 0.5 + holdRatio / 2;
  return [0, start, end, 1];
}

function loopTransition(
  duration: number,
  easing: MotionEasing,
  delay: number,
  repeatDelay: number,
  reducedMotion: boolean,
  imperfectLoop: boolean,
  times?: number[]
): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }

  const transition: Transition = {
    duration,
    delay,
    ease: easing,
    repeat: Infinity,
    repeatType: imperfectLoop ? "mirror" : "loop",
    repeatDelay
  };

  if (times) {
    transition.times = times;
  }

  return transition;
}

function staticTransition(): Transition {
  return { duration: 0 };
}

function buildStaticMotion() {
  return {
    body: { animate: { y: 0 }, transition: staticTransition() },
    head: { animate: { rotate: 0 }, transition: staticTransition() },
    leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
    rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
    leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
    rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
    outer: { animate: { x: 0 }, transition: staticTransition() }
  };
}

function buildPoseMotion(params: {
  pose: StickmanState;
  phaseOffset: number;
  gapPx: { desktop: number; mobile: number };
  viewportMode: ViewportMode;
  reducedMotion: boolean;
  sceneMotion: SceneMotionSpec;
  side: StickmanSide;
}) {
  const { pose, phaseOffset, gapPx, viewportMode, reducedMotion, sceneMotion, side } = params;
  const normalizedPose = normalizePose(pose);
  const durationScale = viewportMode === "mobile" ? 1.12 : 1;
  const delay = phaseOffset;
  const infiniteDuration = (value: number) => value * durationScale;
  const walkingDuration = sceneMotion.cycleDuration[side];
  const approachShift = Math.round(
    Math.min(viewportMode === "mobile" ? 12 : 20, gapPx[viewportMode] * 0.18)
  );
  const holdTimes = sceneMotion.microPauseDelay > 0 ? buildHoldTimes(walkingDuration, sceneMotion.microPauseDelay) : undefined;
  const walkBodyFrames = holdTimes ? scaleSeries([0, -4, -4, 0], viewportMode) : scaleSeries([0, -4, 0], viewportMode);
  const walkArmForward = holdTimes ? scaleSeries([-15, 15, 15, -15], viewportMode) : scaleSeries([-15, 15, -15], viewportMode);
  const walkArmReverse = holdTimes ? scaleSeries([15, -15, -15, 15], viewportMode) : scaleSeries([15, -15, 15], viewportMode);
  const walkLegForward = holdTimes ? scaleSeries([20, -20, -20, 20], viewportMode) : scaleSeries([20, -20, 20], viewportMode);
  const walkLegReverse = holdTimes ? scaleSeries([-20, 20, 20, -20], viewportMode) : scaleSeries([-20, 20, -20], viewportMode);
  const approachBodyFrames = holdTimes ? scaleSeries([0, -3, -3, 0], viewportMode) : scaleSeries([0, -3, 0], viewportMode);
  const approachArmForward = holdTimes ? scaleSeries([-10, 10, 10, -10], viewportMode) : scaleSeries([-10, 10, -10], viewportMode);
  const approachArmReverse = holdTimes ? scaleSeries([10, -10, -10, 10], viewportMode) : scaleSeries([10, -10, 10], viewportMode);
  const approachLegForward = holdTimes ? scaleSeries([15, -15, -15, 15], viewportMode) : scaleSeries([15, -15, 15], viewportMode);
  const approachLegReverse = holdTimes ? scaleSeries([-15, 15, 15, -15], viewportMode) : scaleSeries([-15, 15, -15], viewportMode);
  const approachOuterFrames = holdTimes ? scaleSeries([0, approachShift, approachShift, 0], viewportMode) : scaleSeries([0, approachShift, 0], viewportMode);

  if (reducedMotion) {
    return buildStaticMotion();
  }

  switch (normalizedPose) {
    case "idle":
      return {
        body: {
          animate: { y: scaleSeries([0, -2, 0], viewportMode) },
          transition: loopTransition(infiniteDuration(2), "easeInOut", delay, 0, false, sceneMotion.imperfectLoop)
        },
        head: {
          animate: { rotate: scaleSeries([0, 2, 0, -2, 0], viewportMode) },
          transition: loopTransition(infiniteDuration(2), "easeInOut", delay, 0, false, sceneMotion.imperfectLoop)
        },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };

    case "walking":
    case "synchronized_walk":
    case "separated_walk":
      return {
        body: {
          animate: { y: walkBodyFrames },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            sceneMotion.easing,
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        head: { animate: { rotate: 0 }, transition: staticTransition() },
        leftArm: {
          animate: { rotate: walkArmForward },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            sceneMotion.easing,
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        rightArm: {
          animate: { rotate: walkArmReverse },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            sceneMotion.easing,
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        leftLeg: {
          animate: { rotate: walkLegForward },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            sceneMotion.easing,
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        rightLeg: {
          animate: { rotate: walkLegReverse },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            sceneMotion.easing,
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };

    case "approaching":
      return {
        body: {
          animate: { y: approachBodyFrames },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            "easeInOut",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        head: { animate: { rotate: 0 }, transition: staticTransition() },
        leftArm: {
          animate: { rotate: approachArmForward },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            "easeInOut",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        rightArm: {
          animate: { rotate: approachArmReverse },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            "easeInOut",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        leftLeg: {
          animate: { rotate: approachLegForward },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            "easeInOut",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        rightLeg: {
          animate: { rotate: approachLegReverse },
          transition: loopTransition(
            infiniteDuration(walkingDuration),
            "easeInOut",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        },
        outer: {
          animate: { x: approachOuterFrames },
          transition: loopTransition(
            infiniteDuration(2.4),
            "linear",
            delay,
            0,
            false,
            sceneMotion.imperfectLoop,
            holdTimes
          )
        }
      };

    case "stillness":
      return {
        body: sceneMotion.idleBreathing
          ? {
              animate: { y: scaleSeries([0, -1, 0], viewportMode) },
              transition: loopTransition(infiniteDuration(2), "linear", delay, 0, false, sceneMotion.imperfectLoop)
            }
          : {
              animate: { y: 0 },
              transition: staticTransition()
            },
        head: { animate: { rotate: 0 }, transition: staticTransition() },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };

    case "thinking":
      return {
        body: {
          animate: { y: scaleSeries([0, -1, 0], viewportMode) },
          transition: loopTransition(infiniteDuration(1.5), "easeInOut", delay, 0, false, sceneMotion.imperfectLoop)
        },
        head: {
          animate: { rotate: scaleSeries([0, -5, 0, 5, 0], viewportMode) },
          transition: loopTransition(infiniteDuration(1.5), "easeInOut", delay, 0, false, sceneMotion.imperfectLoop)
        },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };

    case "turning":
      return {
        body: { animate: { y: 0 }, transition: staticTransition() },
        head: {
          animate: { rotate: scaleSeries([0, 15, 0], viewportMode) },
          transition: {
            duration: infiniteDuration(0.6),
            delay,
            ease: "easeInOut" as const,
            repeat: 0
          }
        },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: {
          animate: { scaleX: [1, -1] },
          transition: {
            duration: infiniteDuration(0.6),
            delay,
            ease: "easeInOut" as const,
            repeat: 0
          }
        }
      };

    case "sitting":
      return {
        body: { animate: { y: 0 }, transition: staticTransition() },
        head: { animate: { rotate: 0 }, transition: staticTransition() },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };

    case "waiting":
    default:
      return {
        body: { animate: { y: 0 }, transition: staticTransition() },
        head: { animate: { rotate: 0 }, transition: staticTransition() },
        leftArm: { animate: { rotate: 0 }, transition: staticTransition() },
        rightArm: { animate: { rotate: 0 }, transition: staticTransition() },
        leftLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        rightLeg: { animate: { rotate: 0 }, transition: staticTransition() },
        outer: { animate: { x: 0 }, transition: staticTransition() }
      };
  }
}

export function Stickman({
  pose,
  phaseOffset,
  gapPx,
  viewportMode,
  reducedMotion,
  sceneMotion,
  side,
  size
}: StickmanProps) {
  const resolvedPose = normalizePose(pose);
  const figureSize = size ?? DEFAULT_SIZE[viewportMode];
  const figureHeight = Math.round(figureSize * 1.3);
  const stroke = side === "left" ? "rgba(245, 248, 255, 0.96)" : "rgba(230, 234, 242, 0.88)";
  const accent = side === "left" ? "rgba(176, 214, 255, 0.56)" : "rgba(255, 217, 186, 0.42)";
  const poseMotion = buildPoseMotion({
    pose: resolvedPose,
    phaseOffset,
    gapPx,
    viewportMode,
    reducedMotion,
    sceneMotion,
    side
  });

  const svgStyle = {
    overflow: "visible",
    transformBox: "fill-box",
    transformOrigin: "50% 100%"
  } as const;

  const groupStyle = {
    transformBox: "fill-box",
    transformOrigin: "50% 50%"
  } as const;

  const limbStyle = {
    transformBox: "fill-box",
    transformOrigin: "50% 0%"
  } as const;

  const mirroredShellStyle = {
    transform: side === "right" ? "scaleX(-1)" : "none",
    transformOrigin: "center bottom",
    willChange: "transform"
  } as const;

  return (
    <div style={mirroredShellStyle}>
      <motion.div
        initial={false}
        animate={poseMotion.outer.animate}
        transition={poseMotion.outer.transition}
        style={{ willChange: "transform" }}
      >
        <motion.svg
          width={figureSize}
          height={figureHeight}
          viewBox="0 0 100 150"
          role="img"
          aria-label={side === "left" ? "Left stick figure" : "Right stick figure"}
          style={svgStyle}
        >
          <motion.g
            animate={poseMotion.body.animate}
            transition={poseMotion.body.transition}
            style={groupStyle}
          >
            <ellipse
              cx="50"
              cy="136"
              rx="18"
              ry="3"
              fill={accent}
              opacity={resolvedPose === "walking" || resolvedPose === "synchronized_walk" || resolvedPose === "separated_walk" || resolvedPose === "approaching" ? 0.2 : 0.14}
            />

            <g transform="translate(50 20)">
              <motion.g
                animate={poseMotion.head.animate}
                transition={poseMotion.head.transition}
                style={groupStyle}
              >
                <circle cx="0" cy="0" r="11.5" fill="none" stroke={stroke} strokeWidth="3.8" />
                <path
                  d="M -5.6 -11 Q 0 -16.4 5.6 -11"
                  stroke={accent}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity={side === "left" ? 0.72 : 0.48}
                />
              </motion.g>
            </g>

            <g transform="translate(50 34)">
              <line x1="0" y1="0" x2="0" y2="40" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
            </g>

            <g transform="translate(50 48)">
              <motion.g
                animate={poseMotion.leftArm.animate}
                transition={poseMotion.leftArm.transition}
                style={limbStyle}
              >
                <line
                  x1="0"
                  y1="0"
                  x2="-23"
                  y2={resolvedPose === "thinking" ? 4 : 15}
                  stroke={stroke}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              </motion.g>

              <motion.g
                animate={poseMotion.rightArm.animate}
                transition={poseMotion.rightArm.transition}
                style={limbStyle}
              >
                <line
                  x1="0"
                  y1="0"
                  x2="23"
                  y2={resolvedPose === "thinking" ? 14 : 15}
                  stroke={stroke}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
              </motion.g>
            </g>

            <g transform={resolvedPose === "sitting" ? "translate(50 72)" : "translate(50 80)"}>
              {resolvedPose === "sitting" ? (
                <>
                  <line x1="0" y1="0" x2="0" y2="24" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
                  <line x1="0" y1="24" x2="-22" y2="18" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
                  <line x1="0" y1="24" x2="20" y2="18" stroke={stroke} strokeWidth="3.8" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <motion.g
                    animate={poseMotion.leftLeg.animate}
                    transition={poseMotion.leftLeg.transition}
                    style={limbStyle}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="-14"
                      y2={resolvedPose === "walking" || resolvedPose === "synchronized_walk" || resolvedPose === "separated_walk" || resolvedPose === "approaching" ? 38 : 36}
                      stroke={stroke}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                    />
                  </motion.g>

                  <motion.g
                    animate={poseMotion.rightLeg.animate}
                    transition={poseMotion.rightLeg.transition}
                    style={limbStyle}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="14"
                      y2={resolvedPose === "walking" || resolvedPose === "synchronized_walk" || resolvedPose === "separated_walk" || resolvedPose === "approaching" ? 38 : 36}
                      stroke={stroke}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                    />
                  </motion.g>
                </>
              )}
            </g>
          </motion.g>
        </motion.svg>
      </motion.div>
    </div>
  );
}
