export type TimelineType = "never" | "now" | "imagine";
export type TimelineId = TimelineType;
export type ViewportMode = "mobile" | "desktop";

export type StickmanState =
  | "idle"
  | "walking"
  | "synchronized_walk"
  | "separated_walk"
  | "stillness"
  | "approaching"
  | "turning"
  | "sitting"
  | "thinking"
  | "waiting"
  // Backward-compatible aliases for the first draft of the app.
  | "synchronized-walk"
  | "separated-walk";

export type StickmanFacing = "left" | "right";
export type MotionEasing = "linear" | "easeInOut" | "easeOut";

export interface SceneTiming {
  duration: number | null;
  easing: MotionEasing | null;
}

export interface SceneGap {
  desktop: number;
  mobile: number;
}

export interface SceneData {
  title: string;
  textLines: string[];
  stickmanState: StickmanState;
  gap: SceneGap;
  transition: SceneTiming;
  textDelays: number[];
  finalScreen?: boolean;
}

export type Scene = SceneData;

export interface TimelineTheme {
  gradient: readonly [string, string];
  ambient: readonly [string, string];
  accent: string;
  vignette: number;
}

export interface TimelineData {
  id: TimelineType;
  label: string;
  selectorLabel: string;
  theme: TimelineTheme;
  scenes: SceneData[];
}

export type Timeline = TimelineData;

export interface AppState {
  timeline: TimelineType;
  sceneIndex: number;
  textStep: number;
  isTransitioning: boolean;
}
