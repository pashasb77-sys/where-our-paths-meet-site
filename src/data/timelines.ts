import type { SceneData, SceneTiming, TimelineData, TimelineTheme, TimelineType } from "@/lib/types";

const neverTheme: TimelineTheme = {
  gradient: ["#1c1f2b", "#0f1117"],
  ambient: ["rgba(120, 160, 255, 0.18)", "rgba(240, 245, 255, 0.06)"],
  accent: "rgba(120, 160, 255, 0.82)",
  vignette: 0.68
};

const nowTheme: TimelineTheme = {
  gradient: ["#2a2f2f", "#1c1e1e"],
  ambient: ["rgba(255, 190, 140, 0.16)", "rgba(255, 255, 255, 0.06)"],
  accent: "rgba(255, 190, 140, 0.8)",
  vignette: 0.58
};

const imagineTheme: TimelineTheme = {
  gradient: ["#3a4a6a", "#1f2a44"],
  ambient: ["rgba(150, 210, 255, 0.16)", "rgba(255, 255, 255, 0.08)"],
  accent: "rgba(150, 210, 255, 0.82)",
  vignette: 0.52
};

function scene(
  title: string,
  textLines: string[],
  stickmanState: SceneData["stickmanState"],
  gap: SceneData["gap"],
  transition: SceneTiming,
  textDelays: number[],
  finalScreen = false
): SceneData {
  return {
    title,
    textLines,
    stickmanState,
    gap,
    transition,
    textDelays,
    finalScreen
  };
}

export const timelines: Record<TimelineType, TimelineData> = {
  never: {
    id: "never",
    label: "If We Never Met",
    selectorLabel: "Never Met",
    theme: neverTheme,
    scenes: [
      scene(
        "Separate Paths",
        [
          "There are paths in this world",
          "that run quietly beside each other...",
          "close in distance,",
          "yet never meant to meet."
        ],
        "separated_walk",
        { desktop: 180, mobile: 120 },
        { duration: 0.7, easing: "linear" },
        [0, 1.2, 2.4, 3.6]
      ),
      scene(
        "Same Place, Diff Time",
        [
          "The same places would still exist...",
          "the same moments would still pass...",
          "but never at the same time",
          "for us to notice."
        ],
        "separated_walk",
        { desktop: 180, mobile: 120 },
        { duration: 0.7, easing: "linear" },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Missed Presence",
        [
          "Maybe we would have come close...",
          "just enough to matter -",
          "but not enough",
          "to ever realize it."
        ],
        "separated_walk",
        { desktop: 160, mobile: 100 },
        { duration: 0.8, easing: "easeOut" },
        [0, 1.1, 2.2, 3.3]
      ),
      scene(
        "Empty Shared Space",
        [
          "Some spaces would feel incomplete...",
          "without any visible reason -",
          "as if something was missing,",
          "that was never even known."
        ],
        "stillness",
        { desktop: 180, mobile: 120 },
        { duration: null, easing: null },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Closure of Absence",
        [
          "And life would continue...",
          "perfectly normal on the surface -",
          "with a story",
          "that was never given a beginning."
        ],
        "separated_walk",
        { desktop: 180, mobile: 120 },
        { duration: 0.7, easing: "linear" },
        [0, 1.2, 2.4, 3.6]
      )
    ]
  },
  now: {
    id: "now",
    label: "What We Are Now",
    selectorLabel: "Now",
    theme: nowTheme,
    scenes: [
      scene(
        "First Alignment",
        [
          "And then, out of all possibilities...",
          "our paths did align -",
          "not by force,",
          "but with a quiet kind of certainty."
        ],
        "synchronized_walk",
        { desktop: 80, mobile: 50 },
        { duration: 0.8, easing: "easeInOut" },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Walking Together",
        [
          "Not one leading,",
          "not one following -",
          "just moving side by side,",
          "with a rhythm that feels natural."
        ],
        "synchronized_walk",
        { desktop: 80, mobile: 50 },
        { duration: 0.8, easing: "easeInOut" },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Shared Stillness",
        [
          "Even in silence,",
          "there is no discomfort -",
          "just a presence",
          "that feels complete on its own."
        ],
        "stillness",
        { desktop: 80, mobile: 50 },
        { duration: null, easing: null },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Subtle Connection",
        [
          "There is no need",
          "for constant words or explanations -",
          "because some understandings",
          "exist without being spoken."
        ],
        "synchronized_walk",
        { desktop: 80, mobile: 50 },
        { duration: 0.8, easing: "easeInOut" },
        [0, 1.2, 2.4, 3.6]
      ),
      scene(
        "Stability",
        [
          "And in all its simplicity...",
          "this connection -",
          "makes sense",
          "in a way that is hard to question."
        ],
        "stillness",
        { desktop: 80, mobile: 50 },
        { duration: null, easing: null },
        [0, 1.3, 2.6, 3.9]
      )
    ]
  },
  imagine: {
    id: "imagine",
    label: "What I Imagine",
    selectorLabel: "Imagine",
    theme: imagineTheme,
    scenes: [
      scene(
        "Moving Forward",
        [
          "And maybe this is not just",
          "a moment that exists now -",
          "but something",
          "that continues forward with meaning."
        ],
        "synchronized_walk",
        { desktop: 120, mobile: 80 },
        { duration: 1.0, easing: "easeInOut" },
        [0, 1.3, 2.6, 3.9]
      ),
      scene(
        "Facing Difficulty",
        [
          "Not every step ahead will be easy...",
          "there will be pauses, obstacles, and doubts -",
          "but some paths are still worth walking,",
          "despite all of that."
        ],
        "separated_walk",
        { desktop: 100, mobile: 60 },
        { duration: 1.0, easing: "easeInOut" },
        [0, 1.4, 2.8, 4.2]
      ),
      scene(
        "Reduced Distance",
        [
          "Over time,",
          "distances begin to change -",
          "not suddenly,",
          "but in ways that feel natural and real."
        ],
        "approaching",
        { desktop: 100, mobile: 60 },
        { duration: 1.2, easing: "easeInOut" },
        [0, 1.0, 2.0, 3.0]
      ),
      scene(
        "Shared Direction",
        [
          "It becomes less about where we are...",
          "and more about where we are heading -",
          "with a direction",
          "that starts to feel shared."
        ],
        "synchronized_walk",
        { desktop: 60, mobile: 40 },
        { duration: 1.0, easing: "easeInOut" },
        [0, 1.2, 2.4, 3.6]
      ),
      scene(
        "Final Conclusion",
        [
          "Out of all the paths this life could take...",
          "this one feels right to me.",
          "",
          "That clarity is enough",
          "to let the feeling remain."
        ],
        "stillness",
        { desktop: 60, mobile: 40 },
        { duration: null, easing: null },
        [0, 1.5, 3.0, 4.5, 6.0]
      ),
      scene(
        "Closing Scene",
        [
          "And if it continues forward -",
          "then I would choose to walk it,",
          "with consistency and intention."
        ],
        "stillness",
        { desktop: 60, mobile: 40 },
        { duration: null, easing: null },
        [0, 1.8, 3.6],
        true
      )
    ]
  }
};

export const timelineOrder: TimelineType[] = ["never", "now", "imagine"];
