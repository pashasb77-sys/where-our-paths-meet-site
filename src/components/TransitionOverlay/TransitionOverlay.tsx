"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";

type Props = {
  sceneKey: string;
  style: CSSProperties;
};

export function TransitionOverlay({ sceneKey, style }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        className="transition-overlay"
        style={style}
        initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: reduceMotion ? "none" : "blur(10px)" }}
        transition={{ duration: reduceMotion ? 0.01 : 0.75, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </AnimatePresence>
  );
}
