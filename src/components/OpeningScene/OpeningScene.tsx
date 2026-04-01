"use client";

import { motion, useReducedMotion } from "framer-motion";

const NEVER_BACKGROUND_URL = "/images/backgrounds/nasa-xFO2Xt33xgI-unsplash.jpg";

type Props = {
  onBegin: () => void;
  transitionProgress: number;
  previewLines: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function splitWords(text: string) {
  return text.split(" ");
}

export function OpeningScene({ onBegin, transitionProgress, previewLines }: Props) {
  const reduceMotion = useReducedMotion();
  const dissolveProgress = reduceMotion ? 0 : clamp(transitionProgress, 0, 1);
  const assemblyProgress = reduceMotion ? 1 : clamp((transitionProgress - 0.28) / 0.72, 0, 1);
  const overlayOpacity = reduceMotion ? 1 : clamp(1 - Math.max(0, transitionProgress - 0.84) / 0.16, 0, 1);
  const introOpacity = reduceMotion ? 1 : clamp(1 - dissolveProgress * 1.25, 0, 1);
  const introScale = reduceMotion ? 1 : 1 - dissolveProgress * 0.08;
  const introBlur = reduceMotion ? 0 : 14 * dissolveProgress;
  const introGlow = reduceMotion ? 0.2 : 0.22 + (1 - dissolveProgress) * 0.2;
  const assemblyGlow = reduceMotion ? 0.45 : 0.14 + assemblyProgress * 0.5;
  const introBackgroundOpacity = reduceMotion ? 1 : clamp(1 - dissolveProgress * 1.08, 0, 1);
  const introBackgroundScale = reduceMotion ? 1 : 1 + dissolveProgress * 0.035;
  const nextBackgroundOpacity = reduceMotion ? 1 : clamp((transitionProgress - 0.14) / 0.72, 0, 1);
  const nextBackgroundScale = reduceMotion ? 1 : 1.06 - nextBackgroundOpacity * 0.06;
  const nextBackgroundBlur = reduceMotion ? 0 : (1 - nextBackgroundOpacity) * 10;

  const titleWords = splitWords("Some stories are not about what happened first.");
  const bodyWords = splitWords(
    "They are about what changes when one presence enters another life. This space holds three versions of that feeling at once: the path where nothing happened, the path we are living now, and the path the heart still dares to imagine."
  );

  return (
    <section
      className="opening-scene"
      aria-labelledby="opening-scene-title"
      style={{
        opacity: overlayOpacity,
        pointerEvents: overlayOpacity > 0.08 ? "auto" : "none"
      }}
    >
      <div
        aria-hidden="true"
        className="opening-scene-background opening-scene-background-intro"
        style={{
          opacity: introBackgroundOpacity,
          transform: `scale(${introBackgroundScale})`,
          filter: reduceMotion ? "none" : `blur(${dissolveProgress * 8}px)`
        }}
      />
      <div
        aria-hidden="true"
        className="opening-scene-background opening-scene-background-next"
        style={{
          opacity: nextBackgroundOpacity,
          transform: `scale(${nextBackgroundScale})`,
          filter: reduceMotion ? "none" : `blur(${nextBackgroundBlur}px)`,
          backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.28), rgba(0, 0, 0, 0.36)), url("${NEVER_BACKGROUND_URL}")`
        }}
      />
      <div
        aria-hidden="true"
        className="opening-scene-orb opening-scene-orb-left"
        style={{
          opacity: reduceMotion ? 0.5 : 0.56 - dissolveProgress * 0.28,
          transform: `translate3d(${-36 * dissolveProgress}px, ${-24 * dissolveProgress}px, 0) scale(${1 + dissolveProgress * 0.08})`
        }}
      />
      <div
        aria-hidden="true"
        className="opening-scene-orb opening-scene-orb-right"
        style={{
          opacity: reduceMotion ? 0.5 : 0.46 - dissolveProgress * 0.18,
          transform: `translate3d(${42 * dissolveProgress}px, ${28 * dissolveProgress}px, 0) scale(${1 + dissolveProgress * 0.12})`
        }}
      />
      <div aria-hidden="true" className="opening-scene-vignette" />
      <div
        aria-hidden="true"
        className="opening-scene-disintegration"
        style={{
          opacity: reduceMotion ? 0 : dissolveProgress * 0.48,
          transform: `scale(${1 + dissolveProgress * 0.06})`
        }}
      />

      <motion.div
        className="opening-scene-copy"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 28, filter: reduceMotion ? "none" : "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: reduceMotion ? 0.01 : 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        style={{
          opacity: introOpacity,
          transform: `scale(${introScale})`,
          filter: reduceMotion ? "none" : `blur(${introBlur}px)`,
          textShadow: `0 0 24px rgba(255, 194, 98, ${introGlow})`
        }}
      >
        <p className="opening-scene-kicker">Before The Timelines</p>
        <h2 id="opening-scene-title" className="opening-scene-title">
          {titleWords.map((word, index) => {
            const spread = dissolveProgress * (18 + index * 1.2);
            const driftX = (index % 2 === 0 ? -1 : 1) * spread;
            const driftY = ((index % 3) - 1) * spread * 0.34;
            const rotate = ((index % 4) - 1.5) * dissolveProgress * 9;

            return (
              <span
                key={`title-${word}-${index}`}
                className="opening-scene-particle"
                style={{
                  opacity: reduceMotion ? 1 : clamp(1 - dissolveProgress * 1.18, 0, 1),
                  transform: `translate3d(${driftX}px, ${driftY}px, 0) rotate(${rotate}deg)`,
                  filter: reduceMotion ? "none" : `blur(${dissolveProgress * 4}px)`
                }}
              >
                {word}
              </span>
            );
          })}
        </h2>
        <p className="opening-scene-body">
          {bodyWords.map((word, index) => {
            const spread = dissolveProgress * (10 + (index % 9) * 1.1);
            const driftX = ((index % 5) - 2) * spread * 0.55;
            const driftY = ((index % 4) - 1.5) * spread * 0.24;

            return (
              <span
                key={`body-${word}-${index}`}
                className="opening-scene-particle"
                style={{
                  opacity: reduceMotion ? 1 : clamp(1 - dissolveProgress * 1.24, 0, 1),
                  transform: `translate3d(${driftX}px, ${driftY}px, 0)`,
                  filter: reduceMotion ? "none" : `blur(${dissolveProgress * 3.4}px)`
                }}
              >
                {word}
              </span>
            );
          })}
        </p>

        <div className="opening-scene-actions">
          <button type="button" className="opening-scene-button" onClick={onBegin}>
            Enter the story
          </button>
          <p className="opening-scene-hint">Or scroll down to begin.</p>
        </div>
      </motion.div>

      <div
        className="opening-scene-assembly"
        aria-hidden="true"
        style={{
          opacity: reduceMotion ? 1 : clamp(assemblyProgress * 1.18, 0, 1)
        }}
      >
        <p className="opening-scene-assembly-kicker">Never Met</p>
        {previewLines.map((line, index) => {
          const settleProgress = reduceMotion ? 1 : clamp((assemblyProgress - index * 0.08) / 0.92, 0, 1);
          const spread = (1 - settleProgress) * (58 + index * 14);
          const driftX = ((index % 2 === 0 ? -1 : 1) * spread);
          const driftY = ((2 - index) * spread * 0.18);
          const sharpenGlow = 0.14 + settleProgress * 0.34;

          return (
            <p
              key={`assembly-${index}`}
              className={index === 0 ? "opening-scene-assembly-line opening-scene-assembly-line-lead" : "opening-scene-assembly-line"}
              style={{
                opacity: settleProgress,
                transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${0.9 + settleProgress * 0.1})`,
                letterSpacing: `${(1 - settleProgress) * 0.24}em`,
                filter: reduceMotion ? "none" : `blur(${(1 - settleProgress) * 12}px)`,
                textShadow: `0 0 ${16 + settleProgress * 20}px rgba(170, 213, 255, ${assemblyGlow}), 0 0 ${8 + settleProgress * 12}px rgba(255, 255, 255, ${sharpenGlow})`
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </section>
  );
}
