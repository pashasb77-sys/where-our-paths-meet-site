"use client";

import { timelines, timelineOrder } from "@/data/timelines";
import type { TimelineType } from "@/lib/types";

type Props = {
  currentTimeline: TimelineType;
  onSelect: (timeline: TimelineType) => void;
  disabled?: boolean;
};

export function TimelineSelector({ currentTimeline, onSelect, disabled = false }: Props) {
  return (
    <nav className="timeline-selector" aria-label="Switch timelines">
      {timelineOrder.map((timelineId, index) => {
        const timeline = timelines[timelineId];
        const active = timelineId === currentTimeline;

        return (
          <span key={timelineId} className="timeline-selector-item">
            <button
              type="button"
              className="timeline-selector-button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onSelect(timelineId)}
              style={active ? { color: timeline.theme.accent } : undefined}
            >
              {timeline.selectorLabel}
            </button>
            {index < timelineOrder.length - 1 ? (
              <span className="timeline-selector-separator" aria-hidden="true">
                •
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
