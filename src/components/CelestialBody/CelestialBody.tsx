"use client";

import { motion, type Transition } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import type { SceneMotionSpec } from "@/data/celestialMotion";
import type { MotionEasing, StickmanState, ViewportMode } from "@/lib/types";

type CelestialSide = "left" | "right";

export type CelestialVariant = "asteroid" | "earth" | "moon" | "planet" | "ringed" | "star" | "eclipse";

export interface CelestialTone {
  primary: string;
  secondary: string;
  accent: string;
  ambient: string;
  shadow: string;
  highlight: string;
}

export interface CelestialBodyProps {
  pose: StickmanState;
  phaseOffset: number;
  gapPx: { desktop: number; mobile: number };
  viewportMode: ViewportMode;
  reducedMotion: boolean;
  freezeMotion?: boolean;
  sceneMotion: SceneMotionSpec;
  side: CelestialSide;
  variant: CelestialVariant;
  tone: CelestialTone;
  size?: number;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  imageRotation?: number;
}

const DEFAULT_SIZE: Record<ViewportMode, number> = {
  desktop: 190,
  mobile: 154
};

function normalizePose(pose: StickmanState): StickmanState {
  if (pose === "synchronized-walk") return "synchronized_walk";
  if (pose === "separated-walk") return "separated_walk";
  return pose;
}

function scaleValue(value: number, viewportMode: ViewportMode) {
  return viewportMode === "mobile" ? value * 0.55 : value;
}

function scaleSeries(values: number[], viewportMode: ViewportMode) {
  return values.map((value) => scaleValue(value, viewportMode));
}

function buildHoldTimes(duration: number, holdDuration: number) {
  const holdRatio = Math.max(0.08, Math.min(0.34, holdDuration / duration));
  const start = 0.5 - holdRatio / 2;
  const end = 0.5 + holdRatio / 2;
  return [0, start, end, 1];
}

function loopTransition(
  duration: number,
  easing: MotionEasing,
  delay: number,
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
    repeatDelay: 0
  };

  if (times) {
    transition.times = times;
  }

  return transition;
}

function staticTransition(): Transition {
  return { duration: 0 };
}

function poseAccentForVariant(variant: CelestialVariant, tone: CelestialTone) {
  switch (variant) {
    case "asteroid":
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 100%)`,
        glow: tone.ambient,
        ring: "rgba(255,255,255,0.08)"
      };
    case "earth":
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 55%, ${tone.accent} 100%)`,
        glow: tone.accent,
        ring: "rgba(255,255,255,0.12)"
      };
    case "eclipse":
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 100%)`,
        glow: "rgba(255,255,255,0.14)",
        ring: "rgba(255,255,255,0.12)"
      };
    case "moon":
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 100%)`,
        glow: tone.ambient,
        ring: "rgba(255,255,255,0.08)"
      };
    case "star":
      return {
        surface: `linear-gradient(145deg, ${tone.accent} 0%, ${tone.primary} 100%)`,
        glow: tone.accent,
        ring: "rgba(255,255,255,0.14)"
      };
    case "ringed":
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 52%, ${tone.accent} 100%)`,
        glow: tone.accent,
        ring: "rgba(255,255,255,0.24)"
      };
    case "planet":
    default:
      return {
        surface: `linear-gradient(145deg, ${tone.secondary} 0%, ${tone.primary} 52%, ${tone.accent} 100%)`,
        glow: tone.ambient,
        ring: "rgba(255,255,255,0.12)"
      };
  }
}

function bodyMotionForPose(params: {
  pose: StickmanState;
  phaseOffset: number;
  gapPx: { desktop: number; mobile: number };
  viewportMode: ViewportMode;
  reducedMotion: boolean;
  sceneMotion: SceneMotionSpec;
  side: CelestialSide;
}) {
  const { pose, phaseOffset, gapPx, viewportMode, reducedMotion, sceneMotion, side } = params;
  const resolvedPose = normalizePose(pose);
  const isMobile = viewportMode === "mobile";
  const durationScale = isMobile ? 1.1 : 1;
  const delay = side === "right" ? phaseOffset : 0;
  const sideBias = side === "left" ? -1 : 1;
  const baseDuration = sceneMotion.cycleDuration[side] * durationScale;
  const holdTimes =
    sceneMotion.microPauseDelay > 0 &&
    (resolvedPose === "approaching" || resolvedPose === "walking" || resolvedPose === "synchronized_walk" || resolvedPose === "separated_walk" || resolvedPose === "thinking")
      ? buildHoldTimes(baseDuration, sceneMotion.microPauseDelay)
      : undefined;
  const approachNudge = Math.round(Math.min(isMobile ? 10 : 18, gapPx[viewportMode] * 0.12));

  if (reducedMotion) {
    return {
      shell: { animate: { x: 0, y: 0 }, transition: staticTransition() },
      body: { animate: { x: 0, y: 0, scale: 1, rotate: 0 }, transition: staticTransition() },
      halo: { animate: { opacity: 0.18 }, transition: staticTransition() },
      orbit: { animate: { rotate: 0 }, transition: staticTransition() }
    };
  }

  switch (resolvedPose) {
    case "walking":
    case "synchronized_walk":
    case "separated_walk":
      return {
        shell: {
          animate: {
            x: 0,
            y: scaleSeries([0, -4, 0], viewportMode)
          },
          transition: loopTransition(baseDuration, sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: [0, sideBias * 1.5, 0],
            y: scaleSeries([0, -1, 0], viewportMode),
            scale: [1, 1.02, 1],
            rotate: [0, sideBias * 2, 0]
          },
          transition: loopTransition(baseDuration, sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.18, 0.24, 0.18]
          },
          transition: loopTransition(baseDuration, sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 360] : [0, -360]
          },
          transition: {
            duration: Math.max(4.4, baseDuration * 3.6),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };

    case "approaching":
      return {
        shell: {
          animate: {
            x: side === "left" ? [0, approachNudge, 0] : [0, -approachNudge, 0],
            y: scaleSeries([0, -3, 0], viewportMode)
          },
          transition: loopTransition(baseDuration, "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: side === "left" ? [0, 2, 0] : [0, -2, 0],
            y: scaleSeries([0, -1, 0], viewportMode),
            scale: [1, 1.04, 1],
            rotate: [0, sideBias * 1.5, 0]
          },
          transition: loopTransition(baseDuration, "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.2, 0.3, 0.2]
          },
          transition: loopTransition(baseDuration, "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 360] : [0, -360]
          },
          transition: {
            duration: Math.max(4.8, baseDuration * 3.8),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };

    case "stillness":
      return {
        shell: {
          animate: {
            x: 0,
            y: sceneMotion.idleBreathing ? scaleSeries([0, -1, 0], viewportMode) : 0
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: 0,
            y: scaleSeries([0, 0, 0], viewportMode),
            scale: [1, 1.01, 1],
            rotate: [0, sideBias * 0.8, 0]
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.14, 0.18, 0.14]
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), sceneMotion.easing, delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 180] : [0, -180]
          },
          transition: {
            duration: Math.max(6, baseDuration * 3.5),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };

    case "thinking":
      return {
        shell: {
          animate: {
            x: 0,
            y: scaleSeries([0, -1, 0], viewportMode)
          },
          transition: loopTransition(Math.max(1.6, baseDuration * 1.8), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: 0,
            y: scaleSeries([0, -1, 0], viewportMode),
            scale: [1, 1.02, 1],
            rotate: [0, sideBias * 1.2, 0, sideBias * -1.2, 0]
          },
          transition: loopTransition(Math.max(1.6, baseDuration * 1.8), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.18, 0.24, 0.18]
          },
          transition: loopTransition(Math.max(1.6, baseDuration * 1.8), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 240] : [0, -240]
          },
          transition: {
            duration: Math.max(5.2, baseDuration * 3.4),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };

    case "turning":
      return {
        shell: {
          animate: { x: 0, y: 0 },
          transition: staticTransition()
        },
        body: {
          animate: {
            x: 0,
            y: 0,
            scale: 1,
            rotate: [0, 180]
          },
          transition: {
            duration: 0.6,
            delay,
            ease: "easeInOut" as const,
            repeat: 0
          }
        },
        halo: {
          animate: {
            opacity: [0.16, 0.22, 0.16]
          },
          transition: {
            duration: 0.6,
            delay,
            ease: "easeInOut" as const,
            repeat: 0
          }
        },
        orbit: {
          animate: { rotate: 0 },
          transition: staticTransition()
        }
      };

    case "sitting":
      return {
        shell: {
          animate: {
            x: 0,
            y: [0, 4, 0]
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: 0,
            y: [0, 1, 0],
            scale: [1, 0.98, 1],
            rotate: [0, sideBias * 0.8, 0]
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.14, 0.18, 0.14]
          },
          transition: loopTransition(Math.max(1.8, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 180] : [0, -180]
          },
          transition: {
            duration: Math.max(6, baseDuration * 3.5),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };

    case "waiting":
    case "idle":
    default:
      return {
        shell: {
          animate: {
            x: 0,
            y: scaleSeries([0, -2, 0], viewportMode)
          },
          transition: loopTransition(Math.max(2, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        body: {
          animate: {
            x: 0,
            y: scaleSeries([0, -1, 0], viewportMode),
            scale: [1, 1.01, 1],
            rotate: 0
          },
          transition: loopTransition(Math.max(2, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        halo: {
          animate: {
            opacity: [0.16, 0.22, 0.16]
          },
          transition: loopTransition(Math.max(2, baseDuration * 2), "easeInOut", delay, false, sceneMotion.imperfectLoop, holdTimes)
        },
        orbit: {
          animate: {
            rotate: side === "left" ? [0, 180] : [0, -180]
          },
          transition: {
            duration: Math.max(5.6, baseDuration * 3.2),
            delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop" as const
          } as Transition
        }
      };
  }
}

function createVariantDetails(variant: CelestialVariant, tone: CelestialTone) {
  switch (variant) {
    case "earth":
      return {
        overlays: (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "12%",
                borderRadius: "50%",
                backgroundImage: [
                  "radial-gradient(circle at 30% 56%, rgba(62, 140, 82, 0.9) 0 12%, transparent 13%)",
                  "radial-gradient(circle at 58% 42%, rgba(85, 154, 100, 0.86) 0 13%, transparent 14%)",
                  "radial-gradient(circle at 74% 66%, rgba(133, 146, 86, 0.64) 0 10%, transparent 11%)",
                  "radial-gradient(circle at 42% 28%, rgba(255,255,255,0.24) 0 8%, transparent 10%)"
                ].join(", "),
                opacity: 0.85,
                mixBlendMode: "screen",
                pointerEvents: "none"
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "8%",
                borderRadius: "50%",
                backgroundImage: [
                  "radial-gradient(circle at 24% 30%, rgba(255,255,255,0.28) 0 6%, transparent 8%)",
                  "radial-gradient(circle at 50% 22%, rgba(255,255,255,0.18) 0 7%, transparent 9%)",
                  "radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0 7%, transparent 9%)"
                ].join(", "),
                opacity: 0.45,
                mixBlendMode: "screen",
                pointerEvents: "none"
              }}
            />
          </>
        )
      };
    case "moon":
      return {
        overlays: (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "10%",
              borderRadius: "50%",
              backgroundImage: [
                "radial-gradient(circle at 28% 30%, rgba(0,0,0,0.22) 0 4px, transparent 5px)",
                "radial-gradient(circle at 42% 44%, rgba(0,0,0,0.18) 0 3px, transparent 4px)",
                "radial-gradient(circle at 62% 28%, rgba(0,0,0,0.16) 0 4px, transparent 5px)",
                `radial-gradient(circle at 74% 56%, ${tone.highlight} 0 1px, transparent 2px)`
              ].join(", "),
              opacity: 0.46,
              mixBlendMode: "overlay",
              pointerEvents: "none"
            }}
          />
        )
      };
    case "asteroid":
      return {
        overlays: (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "10%",
              borderRadius: "inherit",
              backgroundImage: [
                "radial-gradient(circle at 28% 36%, rgba(0, 0, 0, 0.26) 0 7%, transparent 9%)",
                "radial-gradient(circle at 64% 46%, rgba(0, 0, 0, 0.18) 0 8%, transparent 10%)",
                "radial-gradient(circle at 42% 68%, rgba(255, 255, 255, 0.08) 0 2px, transparent 3px)",
                "linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0))"
              ].join(", "),
              opacity: 0.5,
              mixBlendMode: "overlay",
              pointerEvents: "none"
            }}
          />
        )
      };
    case "ringed":
      return {
        overlays: (
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: "52%",
              width: "168%",
              height: "58%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              border: `2px solid ${tone.highlight}`,
              opacity: 0.48,
              pointerEvents: "none"
            }}
            animate={{ rotate: [-12, -8, -12] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      };
    case "star":
      return {
        overlays: (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "-10%",
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, rgba(255,255,255,0.04) 0deg, rgba(255,255,255,0.22) 15deg, rgba(255,255,255,0.04) 30deg, rgba(255,255,255,0.18) 45deg, rgba(255,255,255,0.04) 60deg, rgba(255,255,255,0.18) 75deg, rgba(255,255,255,0.04) 90deg, rgba(255,255,255,0.22) 105deg, rgba(255,255,255,0.04) 120deg)",
              opacity: 0.18,
              filter: "blur(1px)",
              pointerEvents: "none"
            }}
          />
        )
      };
    case "eclipse":
    case "planet":
    default:
      return {
        overlays: null
      };
  }
}

export function CelestialBody({
  pose,
  phaseOffset,
  gapPx,
  viewportMode,
  reducedMotion,
  freezeMotion = false,
  sceneMotion,
  side,
  variant,
  tone,
  size,
  imageSrc,
  imageAlt,
  imageRotation = 0
}: CelestialBodyProps) {
  const resolvedPose = normalizePose(pose);
  const sphereSize = size ?? DEFAULT_SIZE[viewportMode];
  const hasImageSurface = Boolean(imageSrc);
  const shellHeight = Math.round(sphereSize * (hasImageSurface ? 1 : 1.14));
  const motionDisabled = reducedMotion || freezeMotion;
  const poseMotion = bodyMotionForPose({
    pose: resolvedPose,
    phaseOffset,
    gapPx,
    viewportMode,
    reducedMotion: motionDisabled,
    sceneMotion,
    side
  });
  const accent = poseAccentForVariant(variant, tone);
  const isAsteroid = variant === "asteroid";
  const isEarth = variant === "earth";
  const isMoon = variant === "moon";
  const isPlanet = variant === "planet" || variant === "ringed";
  const isRinged = variant === "ringed";
  const isStar = variant === "star";
  const isEclipse = variant === "eclipse";
  const orbitRadius = Math.round(Math.max(44, sphereSize * (isStar ? 0.22 : isMoon ? 0.25 : 0.31)));
  const orbitOffset = Math.round(isMoon ? sphereSize * 0.04 : sphereSize * 0.08);
  const borderRadius = isAsteroid ? "46% 54% 48% 52% / 44% 40% 60% 56%" : "50%";

  const shellStyle = {
    position: "relative",
    width: sphereSize,
    height: shellHeight
  } as const;

  const haloStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: sphereSize * 1.32,
    height: sphereSize * 1.32,
    transform: "translate(-50%, -50%)",
    borderRadius: "999px",
    background: `radial-gradient(circle, ${accent.glow} 0%, rgba(255,255,255,0.08) 28%, transparent 68%)`,
    filter: "blur(12px)",
    opacity: isEclipse ? 0.22 : isStar ? 0.34 : 0.2,
    pointerEvents: "none",
    willChange: "opacity, transform"
  } as const;

  const bodyStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: sphereSize,
    height: sphereSize,
    transform: "translate(-50%, -50%)",
    borderRadius: hasImageSurface ? 0 : borderRadius,
    background: hasImageSurface ? "transparent" : accent.surface,
    boxShadow: hasImageSurface ? "none" : `0 0 0 1px rgba(255,255,255,0.04)`,
    overflow: hasImageSurface ? "visible" : "hidden",
    transformStyle: "flat",
    filter: "none",
    willChange: "transform, opacity"
  } as const;

  const orbitPlaneStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none"
  } as const;

  const orbitTrackStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: sphereSize * 1.44,
    height: sphereSize * 1.44,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    border: `1px solid rgba(255,255,255,0.08)`,
    opacity: isStar ? 0.08 : 0.14,
    pointerEvents: "none"
  } as const;

  const satelliteStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: Math.max(7, Math.round(sphereSize * 0.06)),
    height: Math.max(7, Math.round(sphereSize * 0.06)),
    transform: `translate(${orbitRadius}px, ${orbitOffset}px)`,
    borderRadius: "999px",
    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.94), ${tone.highlight} 42%, ${tone.secondary} 100%)`,
    boxShadow: `0 0 12px ${tone.accent}`,
    pointerEvents: "none"
  } as const;

  const variantDetails = createVariantDetails(variant, tone);
  const bodyAnimate = hasImageSurface ? { ...poseMotion.body.animate, rotate: 0 } : poseMotion.body.animate;

  const bodyInnerStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    overflow: "hidden"
  } as const;

  const surfaceImageStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    transform: `rotate(${imageRotation}deg)`,
    transformOrigin: "center center",
    userSelect: "none",
    pointerEvents: "none",
    display: "block"
  } as const;

  const commonOverlayStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none"
  } as const;

  return (
    <div style={shellStyle}>
      <motion.div aria-hidden="true" style={haloStyle} animate={poseMotion.halo.animate} transition={poseMotion.halo.transition} />

      <motion.div style={orbitPlaneStyle} animate={poseMotion.orbit.animate} transition={poseMotion.orbit.transition}>
        <div style={orbitTrackStyle} />
        {isPlanet ? <div style={satelliteStyle} /> : null}
      </motion.div>

      <motion.div
        style={bodyStyle}
        animate={bodyAnimate}
        transition={poseMotion.body.transition}
      >
        <div style={bodyInnerStyle}>
          {hasImageSurface ? (
            <Image
              src={imageSrc ?? ""}
              alt={imageAlt ?? ""}
              width={sphereSize}
              height={sphereSize}
              draggable={false}
              style={surfaceImageStyle}
            />
          ) : (
            <>
              <div aria-hidden="true" style={commonOverlayStyle}>
                {variantDetails.overlays}
              </div>

              {!isEclipse ? (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background:
                      "linear-gradient(108deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 30%, rgba(0,0,0,0.06) 100%)",
                    opacity: 0.26,
                    pointerEvents: "none"
                  }}
                />
              ) : null}

              {isRinged ? (
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "52%",
                    width: sphereSize * 1.7,
                    height: sphereSize * 0.58,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    border: `2px solid ${accent.ring}`,
                    opacity: 0.48,
                    pointerEvents: "none"
                  }}
                  animate={{ rotate: [-12, -8, -12] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
