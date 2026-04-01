"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useNarrativeState } from "@/context/NarrativeState";
import type { SceneData } from "@/lib/types";

type Props = {
  scene: SceneData;
};

export function FinalMessageScreen({ scene }: Props) {
  const reduceMotion = useReducedMotion();
  const { textStep } = useNarrativeState();
  const visibleCount = reduceMotion
    ? scene.textLines.length
    : Math.min(scene.textLines.length, Math.max(1, textStep + 1));

  return (
    <motion.div
      className="final-message"
      aria-label="Closing message"
      initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: reduceMotion ? "none" : "blur(12px)" }}
      transition={{ duration: reduceMotion ? 0.01 : 0.56, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.div
        className="final-message-copy"
        initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: reduceMotion ? 0.01 : 0.75, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {scene.textLines.slice(0, visibleCount).map((line, index) =>
          line.length === 0 ? (
            <motion.div
              key={`${scene.title}-${index}-gap`}
              className="final-message-gap"
              initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: reduceMotion ? 0.01 : 0.38, ease: [0.2, 0.8, 0.2, 1] }}
              aria-hidden="true"
            />
          ) : (
            <motion.p
              key={`${scene.title}-${index}`}
              className={index === 0 ? "final-message-line final-message-line-lead" : "final-message-line"}
              initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: reduceMotion ? 0.01 : index === 0 ? 0.72 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {line}
            </motion.p>
          )
        )}
      </motion.div>
    </motion.div>
  );
}
