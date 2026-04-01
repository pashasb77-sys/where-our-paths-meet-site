"use client";

import { TimelineContainer } from "@/components/TimelineContainer/TimelineContainer";

export function NarrativeExperience() {
  return (
    <main className="page narrative-shell">
      <h1 className="srOnly">
        Where Our Paths Meet. Scroll through the story of what never happened, what exists now,
        and what is still imagined.
      </h1>
      <TimelineContainer />
    </main>
  );
}
