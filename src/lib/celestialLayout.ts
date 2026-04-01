import type { TimelineType, ViewportMode } from "@/lib/types";

export type SceneObjectKey = "leftAsteroid" | "rightAsteroid" | "earth" | "moon";

export interface SceneAnchor {
  desktop: {
    left: number;
    top: number;
  };
  mobile: {
    left: number;
    top: number;
  };
}

export interface SceneObjectLayout {
  position: SceneAnchor;
  scale: number;
  rotation: number;
  visible: boolean;
}

export interface CelestialLayoutState {
  never: {
    leftAsteroid: SceneObjectLayout;
    rightAsteroid: SceneObjectLayout;
  };
  now: {
    earth: SceneObjectLayout;
    moon: SceneObjectLayout;
  };
  imagine: {
    earth: SceneObjectLayout;
    moon: SceneObjectLayout;
  };
}

export const CELESTIAL_LAYOUT_STORAGE_KEY = "mission-impossible-celestial-layout-v4";
export const CELESTIAL_EDITOR_STORAGE_KEY = "mission-impossible-celestial-editor-mode-v1";

const MIN_ANCHOR = -100;
const MAX_ANCHOR = 200;
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const MIN_ROTATION = -180;
const MAX_ROTATION = 180;

function createAnchor(desktopLeft: number, desktopTop: number, mobileLeft: number, mobileTop: number): SceneAnchor {
  return {
    desktop: {
      left: desktopLeft,
      top: desktopTop
    },
    mobile: {
      left: mobileLeft,
      top: mobileTop
    }
  };
}

function createObjectLayout(
  desktopLeft: number,
  desktopTop: number,
  mobileLeft: number,
  mobileTop: number,
  scale = 1,
  rotation = 0,
  visible = true
): SceneObjectLayout {
  return {
    position: createAnchor(desktopLeft, desktopTop, mobileLeft, mobileTop),
    scale: roundScaleValue(clampScaleValue(scale)),
    rotation: roundRotationValue(clampRotationValue(rotation)),
    visible
  };
}

export const defaultCelestialLayout: CelestialLayoutState = {
  never: {
    leftAsteroid: createObjectLayout(26.7, 29.5, 50, 18, 1, 0, false),
    rightAsteroid: createObjectLayout(43.4, 29.5, 82, 60, 1, 0, false)
  },
  now: {
    earth: createObjectLayout(-29.5, -79.2, 26, 62, 4.22, 22, true),
    moon: createObjectLayout(56.6, 1.2, 56, 10, 1.24, 0, true)
  },
  imagine: {
    earth: createObjectLayout(7.1, -98.3, 26, 62, 4.22, 22, true),
    moon: createObjectLayout(41.5, -2.2, 56, 10, 1.61, 0, true)
  }
};

export function clampAnchorValue(value: number) {
  return Math.max(MIN_ANCHOR, Math.min(MAX_ANCHOR, value));
}

export function clampScaleValue(value: number) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, value));
}

export function roundAnchorValue(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundScaleValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function clampRotationValue(value: number) {
  return Math.max(MIN_ROTATION, Math.min(MAX_ROTATION, value));
}

export function roundRotationValue(value: number) {
  return Math.round(value);
}

function normalizeViewportAnchor(candidate: unknown, fallback: SceneAnchor["desktop"]): SceneAnchor["desktop"] {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const maybeAnchor = candidate as Partial<SceneAnchor["desktop"]>;
  const left = typeof maybeAnchor.left === "number" ? maybeAnchor.left : fallback.left;
  const top = typeof maybeAnchor.top === "number" ? maybeAnchor.top : fallback.top;
  return {
    left: roundAnchorValue(clampAnchorValue(left)),
    top: roundAnchorValue(clampAnchorValue(top))
  };
}

function normalizeAnchor(candidate: unknown, fallback: SceneAnchor): SceneAnchor {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const maybeAnchor = candidate as Partial<SceneAnchor>;
  return {
    desktop: normalizeViewportAnchor(maybeAnchor.desktop, fallback.desktop),
    mobile: normalizeViewportAnchor(maybeAnchor.mobile, fallback.mobile)
  };
}

function normalizeObjectLayout(candidate: unknown, fallback: SceneObjectLayout): SceneObjectLayout {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const maybeLayout = candidate as Partial<SceneObjectLayout> & Partial<SceneAnchor>;
  const scale = typeof maybeLayout.scale === "number" ? roundScaleValue(clampScaleValue(maybeLayout.scale)) : fallback.scale;
  const rotation = typeof maybeLayout.rotation === "number" ? roundRotationValue(clampRotationValue(maybeLayout.rotation)) : fallback.rotation;
  const visible = typeof maybeLayout.visible === "boolean" ? maybeLayout.visible : fallback.visible;

  if ("position" in maybeLayout && maybeLayout.position) {
    return {
      position: normalizeAnchor(maybeLayout.position, fallback.position),
      scale,
      rotation,
      visible
    };
  }

  if ("desktop" in maybeLayout || "mobile" in maybeLayout) {
    return {
      position: normalizeAnchor(candidate, fallback.position),
      scale,
      rotation,
      visible
    };
  }

  return fallback;
}

function normalizeLayoutScene<T extends Record<string, SceneObjectLayout>>(candidate: unknown, fallback: T): T {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const maybeScene = candidate as Partial<T>;
  return Object.entries(fallback).reduce((acc, [key, value]) => {
    acc[key as keyof T] = normalizeObjectLayout(maybeScene[key as keyof T], value) as T[keyof T];
    return acc;
  }, {} as T);
}

export function normalizeCelestialLayout(candidate: unknown): CelestialLayoutState {
  if (!candidate || typeof candidate !== "object") {
    return defaultCelestialLayout;
  }

  const maybeLayout = candidate as Partial<CelestialLayoutState>;
  return {
    never: normalizeLayoutScene(maybeLayout.never, defaultCelestialLayout.never),
    now: normalizeLayoutScene(maybeLayout.now, defaultCelestialLayout.now),
    imagine: normalizeLayoutScene(maybeLayout.imagine, defaultCelestialLayout.imagine)
  };
}

export function getSceneAnchor(
  layout: CelestialLayoutState,
  scene: TimelineType,
  objectKey: SceneObjectKey,
  viewportMode: ViewportMode
) {
  if (scene === "never") {
    const anchor = layout.never[objectKey as "leftAsteroid" | "rightAsteroid"].position;
    return anchor[viewportMode];
  }

  const anchor = (scene === "now" ? layout.now : layout.imagine)[objectKey as "earth" | "moon"].position;
  return anchor[viewportMode];
}

export function getSceneScale(layout: CelestialLayoutState, scene: TimelineType, objectKey: SceneObjectKey) {
  if (scene === "never") {
    return layout.never[objectKey as "leftAsteroid" | "rightAsteroid"].scale;
  }

  return (scene === "now" ? layout.now : layout.imagine)[objectKey as "earth" | "moon"].scale;
}

export function getSceneRotation(layout: CelestialLayoutState, scene: TimelineType, objectKey: SceneObjectKey) {
  if (scene === "never") {
    return layout.never[objectKey as "leftAsteroid" | "rightAsteroid"].rotation;
  }

  return (scene === "now" ? layout.now : layout.imagine)[objectKey as "earth" | "moon"].rotation;
}

export function setSceneAnchor(
  layout: CelestialLayoutState,
  scene: TimelineType,
  objectKey: SceneObjectKey,
  viewportMode: ViewportMode,
  next: SceneAnchor["desktop"]
) {
  if (scene === "never") {
    const currentScene = layout.never;
    const currentObjectKey = objectKey as "leftAsteroid" | "rightAsteroid";
    const currentAnchor = currentScene[currentObjectKey];
    return {
      ...layout,
      never: {
        ...currentScene,
        [objectKey]: {
          ...currentAnchor,
          position: {
            ...currentAnchor.position,
            [viewportMode]: {
              left: roundAnchorValue(clampAnchorValue(next.left)),
              top: roundAnchorValue(clampAnchorValue(next.top))
            }
          }
        }
      }
    } satisfies CelestialLayoutState;
  }

  const sceneKey = scene === "now" ? "now" : "imagine";
  const currentScene = layout[sceneKey];
  const currentObjectKey = objectKey as "earth" | "moon";
  const currentAnchor = currentScene[currentObjectKey];
  return {
    ...layout,
    [sceneKey]: {
      ...currentScene,
        [objectKey]: {
          ...currentAnchor,
          position: {
            ...currentAnchor.position,
            [viewportMode]: {
              left: roundAnchorValue(clampAnchorValue(next.left)),
              top: roundAnchorValue(clampAnchorValue(next.top))
            }
          }
        }
      }
    } satisfies CelestialLayoutState;
}

export function setSceneScale(
  layout: CelestialLayoutState,
  scene: TimelineType,
  objectKey: SceneObjectKey,
  nextScale: number
) {
  const scale = roundScaleValue(clampScaleValue(nextScale));

  if (scene === "never") {
    const currentScene = layout.never;
    const currentObjectKey = objectKey as "leftAsteroid" | "rightAsteroid";
    const currentObject = currentScene[currentObjectKey];
    return {
      ...layout,
      never: {
        ...currentScene,
        [objectKey]: {
          ...currentObject,
          scale
        }
      }
    } satisfies CelestialLayoutState;
  }

  const sceneKey = scene === "now" ? "now" : "imagine";
  const currentScene = layout[sceneKey];
  const currentObjectKey = objectKey as "earth" | "moon";
  const currentObject = currentScene[currentObjectKey];
  return {
    ...layout,
    [sceneKey]: {
      ...currentScene,
      [objectKey]: {
        ...currentObject,
        scale
      }
    }
  } satisfies CelestialLayoutState;
}

export function setSceneRotation(
  layout: CelestialLayoutState,
  scene: TimelineType,
  objectKey: SceneObjectKey,
  nextRotation: number
) {
  const rotation = roundRotationValue(clampRotationValue(nextRotation));

  if (scene === "never") {
    const currentScene = layout.never;
    const currentObjectKey = objectKey as "leftAsteroid" | "rightAsteroid";
    const currentObject = currentScene[currentObjectKey];
    return {
      ...layout,
      never: {
        ...currentScene,
        [objectKey]: {
          ...currentObject,
          rotation
        }
      }
    } satisfies CelestialLayoutState;
  }

  const sceneKey = scene === "now" ? "now" : "imagine";
  const currentScene = layout[sceneKey];
  const currentObjectKey = objectKey as "earth" | "moon";
  const currentObject = currentScene[currentObjectKey];
  return {
    ...layout,
    [sceneKey]: {
      ...currentScene,
      [objectKey]: {
        ...currentObject,
        rotation
      }
    }
  } satisfies CelestialLayoutState;
}

export function getSceneVisibility(layout: CelestialLayoutState, scene: TimelineType, objectKey: SceneObjectKey) {
  if (scene === "never") {
    return layout.never[objectKey as "leftAsteroid" | "rightAsteroid"].visible;
  }

  return (scene === "now" ? layout.now : layout.imagine)[objectKey as "earth" | "moon"].visible;
}

export function setSceneVisibility(
  layout: CelestialLayoutState,
  scene: TimelineType,
  objectKey: SceneObjectKey,
  visible: boolean
) {
  if (scene === "never") {
    const currentScene = layout.never;
    const currentObjectKey = objectKey as "leftAsteroid" | "rightAsteroid";
    const currentObject = currentScene[currentObjectKey];
    return {
      ...layout,
      never: {
        ...currentScene,
        [objectKey]: {
          ...currentObject,
          visible
        }
      }
    } satisfies CelestialLayoutState;
  }

  const sceneKey = scene === "now" ? "now" : "imagine";
  const currentScene = layout[sceneKey];
  const currentObjectKey = objectKey as "earth" | "moon";
  const currentObject = currentScene[currentObjectKey];
  return {
    ...layout,
    [sceneKey]: {
      ...currentScene,
      [objectKey]: {
        ...currentObject,
        visible
      }
    }
  } satisfies CelestialLayoutState;
}
