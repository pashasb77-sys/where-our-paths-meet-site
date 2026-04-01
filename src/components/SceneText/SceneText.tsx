"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useNarrativeState } from "@/context/NarrativeState";

type Props = {
  sceneKey: string;
  lines: string[];
};

export function SceneText({ sceneKey, lines }: Props) {
  const reduceMotion = useReducedMotion();
  const { textStep } = useNarrativeState();
  const visibleCount = reduceMotion ? lines.length : Math.min(lines.length, Math.max(1, textStep + 1));

  return (
    <motion.div
      className="scene-text"
      aria-label="Narrative text"
      initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(6px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: reduceMotion ? "none" : "blur(10px)" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.52, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {lines.slice(0, visibleCount).map((line, index) => {
        const isLead = index === 0;

        if (line.length === 0) {
          return (
            <motion.div
              key={`${sceneKey}-${index}-gap`}
              className="scene-text-gap"
              initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              aria-hidden="true"
            />
          );
        }

        return (
          <motion.p
            key={`${sceneKey}-${index}`}
            className={isLead ? "scene-text-line scene-text-line-lead" : "scene-text-line"}
            initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: reduceMotion ? 0.01 : isLead ? 0.72 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {line}
          </motion.p>
        );
      })}
    </motion.div>
  );
}
