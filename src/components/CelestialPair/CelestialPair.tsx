"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import earthProvidedImage from "../../../public/images/celestial/earth-provided.png";
import imagineEarthImage from "../../../public/images/celestial/imagine-earth.png";
import moonImage from "../../../public/images/celestial/Moon.png";
import { EditableSceneObject } from "@/components/EditableSceneObject/EditableSceneObject";
import { CelestialBody, type CelestialTone, type CelestialVariant } from "@/components/CelestialBody/CelestialBody";
import { getSceneMotion } from "@/data/celestialMotion";
import {
  defaultCelestialLayout,
  getSceneAnchor,
  getSceneScale,
  getSceneRotation,
  getSceneVisibility,
} from "@/lib/celestialLayout";
import type { SceneData, StickmanState, TimelineData, ViewportMode } from "@/lib/types";

const EARTH_IMAGE_URL = earthProvidedImage;
const IMAGINE_EARTH_IMAGE_URL = imagineEarthImage;
const NOW_MOON_IMAGE_URL = moonImage;
const IMAGINE_MOON_IMAGE_URL = moonImage;

type CelestialSide = "left" | "right";

interface StarSpec {
  x: number;
  y: number;
  size: number;
  opacity: number;
  drift: number;
  duration: number;
  delay: number;
}

interface CelestialPairProps {
  scene: SceneData;
  timeline: TimelineData;
  sceneIndex: number;
  sceneCount: number;
}

function normalizePose(pose: StickmanState): StickmanState {
  if (pose === "synchronized-walk") return "synchronized_walk";
  if (pose === "separated-walk") return "separated_walk";
  return pose;
}

function viewportModeFromQuery(isMobile: boolean): ViewportMode {
  return isMobile ? "mobile" : "desktop";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scaledSize(baseSize: number, scale: number) {
  return Math.round(baseSize * scale);
}

function buildStars(count: number, seed: number): StarSpec[] {
  return Array.from({ length: count }, (_, index) => {
    const x = (seed * 19 + index * 23) % 100;
    const y = (seed * 13 + index * 17) % 100;
    const size = index % 5 === 0 ? 2.2 : index % 3 === 0 ? 1.6 : 1.1;
    const opacity = 0.12 + ((index + seed) % 7) * 0.035;
    const drift = index % 2 === 0 ? 1 : -1;
    const duration = 3.8 + (index % 4) * 0.7;
    const delay = (index % 6) * 0.16;

    return { x, y, size, opacity, drift, duration, delay };
  });
}

function toneForTimeline(timeline: TimelineData, variant: CelestialVariant, side: CelestialSide): CelestialTone {
  const accent = timeline.theme.accent;

  if (timeline.id === "never") {
    return {
      primary: side === "left" ? "rgba(88, 94, 112, 0.96)" : "rgba(72, 76, 93, 0.96)",
      secondary: "rgba(20, 24, 36, 0.98)",
      accent,
      ambient: "rgba(120, 160, 255, 0.14)",
      shadow: "rgba(0, 0, 0, 0.76)",
      highlight: "rgba(238, 244, 255, 0.38)"
    };
  }

  if (timeline.id === "now") {
    if (variant === "moon") {
      return {
        primary: "rgba(196, 197, 201, 0.96)",
        secondary: "rgba(108, 112, 116, 0.98)",
        accent: "rgba(255, 255, 255, 0.5)",
        ambient: "rgba(255, 255, 255, 0.12)",
        shadow: "rgba(0, 0, 0, 0.58)",
        highlight: "rgba(255, 255, 255, 0.82)"
      };
    }

    return {
      primary: "rgba(54, 84, 101, 0.96)",
      secondary: "rgba(24, 37, 44, 0.98)",
      accent: "rgba(255, 205, 165, 0.78)",
      ambient: "rgba(255, 190, 140, 0.16)",
      shadow: "rgba(0, 0, 0, 0.56)",
      highlight: "rgba(255, 255, 255, 0.82)"
    };
  }

  return {
    primary: side === "left" ? "rgba(64, 90, 126, 0.96)" : "rgba(90, 114, 152, 0.96)",
    secondary: side === "left" ? "rgba(28, 42, 72, 0.98)" : "rgba(34, 52, 80, 0.98)",
    accent,
    ambient: "rgba(150, 210, 255, 0.15)",
    shadow: "rgba(0, 0, 0, 0.58)",
    highlight: "rgba(255, 255, 255, 0.84)"
  };
}

function RootFrame({
  children,
  animateOpacity,
  animateScale,
  reducedMotion
}: {
  children: ReactNode;
  animateOpacity: number;
  animateScale: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: animateOpacity, scale: animateScale }}
      transition={{ duration: reducedMotion ? 0.01 : 0.85, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function CelestialPair({ scene, timeline, sceneIndex, sceneCount }: CelestialPairProps) {
  // Keep the locked celestial composition fully still.
  const forceStillScene = true;
  const reducedMotion = useReducedMotion() === true || forceStillScene;
  const [viewportMode, setViewportMode] = useState<ViewportMode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia("(max-width: 640px)");
    const updateViewportMode = () => {
      setViewportMode(viewportModeFromQuery(mediaQueryList.matches));
    };

    updateViewportMode();
    mediaQueryList.addEventListener("change", updateViewportMode);

    return () => {
      mediaQueryList.removeEventListener("change", updateViewportMode);
    };
  }, []);

  const resolvedViewportMode: ViewportMode = viewportMode ?? "desktop";
  const sceneMotion = getSceneMotion(timeline.id, sceneIndex);
  const pose = normalizePose(scene.stickmanState);
  const sceneProgressValue = sceneCount > 1 ? sceneIndex / (sceneCount - 1) : 0;
  const stars = useMemo(() => {
    const seed = timeline.id === "never" ? 11 : timeline.id === "now" ? 23 : 37;
    const count = timeline.id === "never" ? 26 : timeline.id === "now" ? 16 : 20;
    return buildStars(count, seed + sceneIndex + sceneCount);
  }, [sceneCount, sceneIndex, timeline.id]);

  const layout = defaultCelestialLayout;
  const editMode = false;
  const ignorePositionChange = () => {};

  const rootStyle = useMemo(() => {
    return {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      bottom: "auto",
      left: 0,
      transform: "none",
      display: "grid",
      placeItems: "center",
      pointerEvents: "auto"
    } as const;
  }, []);

  const frameScale = scene.finalScreen && timeline.id === "imagine" ? 1.04 : 1;
  const frameOpacity = scene.finalScreen && timeline.id === "imagine" ? 0.9 : 1;
  const sharedGlowSize = timeline.id === "never" ? 280 : 430;
  const sharedGlowTop = "50%";
  const sharedGlowOpacity =
    timeline.id === "never"
      ? clamp(0.16 - sceneProgressValue * 0.02, 0.1, 0.18)
      : clamp(0.3 + sceneProgressValue * 0.05, 0.3, 0.4);
  const gap = sceneMotion.gapPx[resolvedViewportMode];
  const asteroidSize = resolvedViewportMode === "mobile" ? 138 : 176;
  const earthSize = resolvedViewportMode === "mobile" ? 172 : 224;
  const binarySize = resolvedViewportMode === "mobile" ? 164 : 204;

  const sharedGlowStyle = {
    position: "absolute",
    left: "50%",
    top: sharedGlowTop,
    width: sharedGlowSize,
    height: sharedGlowSize,
    transform: "translate(-50%, -50%)",
    borderRadius: "999px",
    background: `radial-gradient(circle, ${timeline.theme.accent} 0%, rgba(255,255,255,0.12) 22%, transparent 70%)`,
    filter: "blur(18px)",
    opacity: sharedGlowOpacity,
    pointerEvents: "none"
  } as const;

  const orbitRingStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: resolvedViewportMode === "mobile" ? 360 : 500,
    height: resolvedViewportMode === "mobile" ? 360 : 500,
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    border: `1px solid rgba(255,255,255,0.12)`,
    boxShadow: `0 0 24px rgba(255,255,255,0.08)`,
    opacity: 0.18,
    pointerEvents: "none"
  } as const;

  const starField = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        mixBlendMode: "screen"
      }}
    >
      {stars.map((star, index) => (
        <motion.span
          key={`${timeline.id}-${sceneIndex}-star-${index}`}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "999px",
            background: "rgba(255,255,255,1)",
            boxShadow: `0 0 8px ${timeline.theme.accent}`,
            opacity: star.opacity,
            filter: `blur(${index % 4 === 0 ? 0.4 : 0}px)`
          }}
          animate={
            reducedMotion
              ? { opacity: star.opacity }
              : {
                  opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.7],
                  scale: [1, 1.15, 1],
                  x: [0, star.drift * 3, 0],
                  y: [0, star.drift * -2, 0]
                }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : {
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                  ease: "easeInOut"
                }
          }
        />
      ))}
    </div>
  );

  function renderNeverScene() {
    const leftTone = toneForTimeline(timeline, "asteroid", "left");
    const rightTone = toneForTimeline(timeline, "asteroid", "right");
    const leftBaseSize = resolvedViewportMode === "mobile" ? 64 : 88;
    const rightBaseSize = resolvedViewportMode === "mobile" ? 228 : 320;
    const leftScale = getSceneScale(layout, timeline.id, "leftAsteroid");
    const rightScale = getSceneScale(layout, timeline.id, "rightAsteroid");
    const leftSize = scaledSize(leftBaseSize, leftScale);
    const rightSize = scaledSize(rightBaseSize, rightScale);
    const leftAnchor = getSceneAnchor(layout, timeline.id, "leftAsteroid", resolvedViewportMode);
    const rightAnchor = getSceneAnchor(layout, timeline.id, "rightAsteroid", resolvedViewportMode);
    const leftVisible = getSceneVisibility(layout, timeline.id, "leftAsteroid");
    const rightVisible = getSceneVisibility(layout, timeline.id, "rightAsteroid");
    const leftDrift = reducedMotion
      ? { x: 0, y: 0, rotate: 0 }
      : {
          x: [-10, -16, -10],
          y: [0, -8, 0],
          rotate: [-4, 2, -4]
        };
    const rightDrift = reducedMotion
      ? { x: 0, y: 0, rotate: 0 }
      : {
          x: [10, 16, 10],
          y: [0, 8, 0],
          rotate: [4, -2, 4]
        };
    const driftTransition = (duration: number) =>
      reducedMotion
        ? { duration: 0 }
        : {
            duration,
            repeat: Infinity,
            repeatType: "mirror" as const,
            ease: sceneMotion.easing
          };

    return (
      <>
        <motion.div
          aria-hidden="true"
          style={sharedGlowStyle}
          animate={reducedMotion ? { opacity: sharedGlowOpacity } : { opacity: [0.08, sharedGlowOpacity, 0.1], scale: [0.92, 1.04, 0.92] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
        />

        <EditableSceneObject
          label="Left asteroid"
          editMode={editMode}
          visible={leftVisible}
          position={leftAnchor}
          onPositionChange={ignorePositionChange}
          animate={editMode || reducedMotion ? { x: 0, y: 0, rotate: 0 } : leftDrift}
          transition={editMode || reducedMotion ? { duration: 0 } : driftTransition(sceneMotion.cycleDuration.left)}
          style={{ width: leftSize, height: leftSize, zIndex: 2 }}
        >
          <CelestialBody
            pose={pose}
            phaseOffset={0}
            gapPx={sceneMotion.gapPx}
            viewportMode={resolvedViewportMode}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            side="left"
            variant="asteroid"
            tone={leftTone}
            size={leftSize}
          />
        </EditableSceneObject>

        <EditableSceneObject
          label="Right asteroid"
          editMode={editMode}
          visible={rightVisible}
          position={rightAnchor}
          onPositionChange={ignorePositionChange}
          animate={editMode || reducedMotion ? { x: 0, y: 0, rotate: 0 } : rightDrift}
          transition={editMode || reducedMotion ? { duration: 0 } : driftTransition(sceneMotion.cycleDuration.right)}
          style={{ width: rightSize, height: rightSize, zIndex: 3 }}
        >
          <CelestialBody
            pose={pose}
            phaseOffset={sceneMotion.phaseOffset}
            gapPx={sceneMotion.gapPx}
            viewportMode={resolvedViewportMode}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            side="right"
            variant="asteroid"
            tone={rightTone}
            size={rightSize}
          />
        </EditableSceneObject>
      </>
    );
  }

  function renderNowScene() {
    const earthTone = toneForTimeline(timeline, "earth", "left");
    const moonTone = toneForTimeline(timeline, "moon", "right");
    const earthBaseSize = resolvedViewportMode === "mobile" ? 244 : 320;
    const moonBaseSize = resolvedViewportMode === "mobile" ? 108 : 128;
    const earthScale = getSceneScale(layout, timeline.id, "earth");
    const moonScale = getSceneScale(layout, timeline.id, "moon");
    const earthRotation = getSceneRotation(layout, timeline.id, "earth");
    const moonRotation = getSceneRotation(layout, timeline.id, "moon");
    const earthSize = scaledSize(earthBaseSize, earthScale);
    const moonSize = scaledSize(moonBaseSize, moonScale);
    const earthAnchor = getSceneAnchor(layout, timeline.id, "earth", resolvedViewportMode);
    const moonAnchor = getSceneAnchor(layout, timeline.id, "moon", resolvedViewportMode);
    const earthVisible = getSceneVisibility(layout, timeline.id, "earth");
    const moonVisible = getSceneVisibility(layout, timeline.id, "moon");
    const earthAnimate = editMode || reducedMotion ? { x: 0, y: 0 } : { x: [0, 0, 0], y: [0, 6, 0] };
    const moonAnimate = editMode || reducedMotion ? { x: 0, y: 0 } : { x: [0, -4, 0], y: [0, -3, 0] };
    const sharedGlowAnimate = reducedMotion ? { opacity: sharedGlowOpacity } : { opacity: [0.18, sharedGlowOpacity, 0.2], scale: [0.94, 1.06, 0.94] };

    return (
      <>
        <motion.div
          aria-hidden="true"
          style={sharedGlowStyle}
          animate={sharedGlowAnimate}
          transition={reducedMotion ? { duration: 0 } : { duration: 9, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
        />

        <motion.div
          aria-hidden="true"
          style={orbitRingStyle}
          animate={reducedMotion ? { opacity: 0.18 } : { rotateZ: [0, 6, 0] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 16, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
        />

        <EditableSceneObject
          label="Earth"
          editMode={editMode}
          visible={earthVisible}
          position={earthAnchor}
          onPositionChange={ignorePositionChange}
          animate={earthAnimate}
          transition={reducedMotion || editMode ? { duration: 0 } : { duration: 6.6, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
          style={{ width: earthSize, height: earthSize, zIndex: 20 }}
        >
          <CelestialBody
            tone={earthTone}
            pose={pose}
            phaseOffset={0}
            gapPx={sceneMotion.gapPx}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            viewportMode={resolvedViewportMode}
            side="left"
            variant="earth"
            size={earthSize}
            imageSrc={EARTH_IMAGE_URL}
            imageAlt="Earth"
            imageRotation={earthRotation}
          />
        </EditableSceneObject>

        <EditableSceneObject
          label="Moon"
          editMode={editMode}
          visible={moonVisible}
          position={moonAnchor}
          onPositionChange={ignorePositionChange}
          animate={moonAnimate}
          transition={reducedMotion || editMode ? { duration: 0 } : { duration: 7.8, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
          style={{ width: moonSize, height: moonSize, zIndex: 15 }}
        >
          <CelestialBody
            tone={moonTone}
            pose={pose}
            phaseOffset={sceneMotion.phaseOffset}
            gapPx={sceneMotion.gapPx}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            viewportMode={resolvedViewportMode}
            side="right"
            variant="moon"
            size={moonSize}
            imageSrc={NOW_MOON_IMAGE_URL}
            imageAlt="Moon"
            imageRotation={moonRotation}
          />
        </EditableSceneObject>
      </>
    );
  }

  function renderImagineScene() {
    const earthTone = toneForTimeline(timeline, "earth", "left");
    const moonTone = toneForTimeline(timeline, "moon", "right");
    const earthBaseSize = resolvedViewportMode === "mobile" ? 244 : 320;
    const moonBaseSize = resolvedViewportMode === "mobile" ? 108 : 128;
    const earthScale = getSceneScale(layout, timeline.id, "earth");
    const moonScale = getSceneScale(layout, timeline.id, "moon");
    const earthRotation = getSceneRotation(layout, timeline.id, "earth");
    const moonRotation = getSceneRotation(layout, timeline.id, "moon");
    const earthSize = scaledSize(earthBaseSize, earthScale);
    const moonSize = scaledSize(moonBaseSize, moonScale);
    const earthAnchor = getSceneAnchor(layout, timeline.id, "earth", resolvedViewportMode);
    const moonAnchor = getSceneAnchor(layout, timeline.id, "moon", resolvedViewportMode);
    const earthVisible = getSceneVisibility(layout, timeline.id, "earth");
    const moonVisible = getSceneVisibility(layout, timeline.id, "moon");
    const earthAnimate = editMode || reducedMotion ? { x: 0, y: 0 } : { x: [0, 0, 0], y: [0, 7, 0] };
    const moonAnimate = editMode || reducedMotion ? { x: 0, y: 0 } : { x: [0, 7, 0], y: [0, -5, 0] };

    return (
      <>
        <motion.div
          aria-hidden="true"
          style={sharedGlowStyle}
          animate={reducedMotion ? { opacity: sharedGlowOpacity } : { opacity: [0.18, sharedGlowOpacity, 0.2], scale: [0.94, 1.06, 0.94] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 9, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
        />

        <motion.div
          aria-hidden="true"
          style={orbitRingStyle}
          animate={reducedMotion ? { opacity: 0.18 } : { rotateZ: [0, 6, 0] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 16, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
        />

        <EditableSceneObject
          label="Earth"
          editMode={editMode}
          visible={earthVisible}
          position={earthAnchor}
          onPositionChange={ignorePositionChange}
          animate={earthAnimate}
          transition={reducedMotion || editMode ? { duration: 0 } : { duration: 6.6, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
          style={{ width: earthSize, height: earthSize, zIndex: 20 }}
        >
          <CelestialBody
            tone={earthTone}
            pose={pose}
            phaseOffset={0}
            gapPx={sceneMotion.gapPx}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            viewportMode={resolvedViewportMode}
            side="left"
            variant="earth"
            size={earthSize}
            imageSrc={IMAGINE_EARTH_IMAGE_URL}
            imageAlt="Earth"
            imageRotation={earthRotation}
          />
        </EditableSceneObject>

        <EditableSceneObject
          label="Moon"
          editMode={editMode}
          visible={moonVisible}
          position={moonAnchor}
          onPositionChange={ignorePositionChange}
          animate={moonAnimate}
          transition={reducedMotion || editMode ? { duration: 0 } : { duration: 7.8, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" }}
          style={{ width: moonSize, height: moonSize, zIndex: 15 }}
        >
          <CelestialBody
            tone={moonTone}
            pose={pose}
            phaseOffset={sceneMotion.phaseOffset}
            gapPx={sceneMotion.gapPx}
            reducedMotion={reducedMotion}
            freezeMotion={editMode}
            sceneMotion={sceneMotion}
            viewportMode={resolvedViewportMode}
            side="right"
            variant="moon"
            size={moonSize}
            imageSrc={IMAGINE_MOON_IMAGE_URL}
            imageAlt="Moon"
            imageRotation={moonRotation}
          />
        </EditableSceneObject>
      </>
    );
  }

  return (
    <div
      className="scene-pair"
      style={rootStyle}
    >
      {viewportMode == null ? null : (
        <div aria-hidden="true" className="absolute inset-0">
          <RootFrame animateOpacity={frameOpacity} animateScale={frameScale} reducedMotion={reducedMotion}>
            {starField}
            {timeline.id === "never"
              ? renderNeverScene()
              : timeline.id === "now"
                ? renderNowScene()
                : renderImagineScene()}
          </RootFrame>
        </div>
      )}
    </div>
  );
}
