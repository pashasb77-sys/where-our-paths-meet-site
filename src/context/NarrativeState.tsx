"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { AppState, TimelineType } from "@/lib/types";

export interface NarrativeStateValue extends AppState {
  setTimeline: (timeline: TimelineType) => void;
  setSceneIndex: (sceneIndex: number) => void;
  setTextStep: (textStep: number) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

const NarrativeStateContext = createContext<NarrativeStateValue | null>(null);

export function NarrativeStateProvider({
  value,
  children
}: {
  value: NarrativeStateValue;
  children: ReactNode;
}) {
  return <NarrativeStateContext.Provider value={value}>{children}</NarrativeStateContext.Provider>;
}

export function useNarrativeState() {
  const value = useContext(NarrativeStateContext);
  if (!value) {
    throw new Error("useNarrativeState must be used within a NarrativeStateProvider");
  }
  return value;
}
