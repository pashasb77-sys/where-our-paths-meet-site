"use client";

import { motion, type MotionProps, type Transition } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { clampAnchorValue, roundAnchorValue, type SceneAnchor } from "@/lib/celestialLayout";

interface EditableSceneObjectProps {
  label: string;
  editMode: boolean;
  visible?: boolean;
  position: SceneAnchor["desktop"];
  onPositionChange: (next: SceneAnchor["desktop"]) => void;
  children: ReactNode;
  animate?: MotionProps["animate"];
  transition?: Transition;
  style?: CSSProperties;
  zIndex?: number;
}

interface DragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startLeft: number;
  startTop: number;
}

export function EditableSceneObject({
  label,
  editMode,
  visible = true,
  position,
  onPositionChange,
  children,
  animate,
  transition,
  style,
  zIndex
}: EditableSceneObjectProps) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setIsDragging(false);
      dragRef.current = null;
      cleanupRef.current?.();
      cleanupRef.current = null;
    }
  }, [editMode]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  if (!visible) {
    return null;
  }

  const stopDrag = () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    dragRef.current = null;
    setIsDragging(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!editMode || event.button !== 0) {
      return;
    }

    if (event.target instanceof HTMLElement && event.target.closest('[data-editor-control="true"]')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const startState: DragState = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: position.left,
      startTop: position.top
    };

    dragRef.current = startState;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current || moveEvent.pointerId !== startState.pointerId) {
        return;
      }

      moveEvent.preventDefault();
      const viewportWidth = window.innerWidth || 1;
      const viewportHeight = window.innerHeight || 1;
      const nextLeft = roundAnchorValue(
        clampAnchorValue(startState.startLeft + ((moveEvent.clientX - startState.startClientX) / viewportWidth) * 100)
      );
      const nextTop = roundAnchorValue(
        clampAnchorValue(startState.startTop + ((moveEvent.clientY - startState.startClientY) / viewportHeight) * 100)
      );
      onPositionChange({ left: nextLeft, top: nextTop });
    };

    const handleUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== startState.pointerId) {
        return;
      }

      stopDrag();
    };

    const handleCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId !== startState.pointerId) {
        return;
      }

      stopDrag();
    };

    cleanupRef.current = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleCancel);
  };

  return (
    <motion.div
      aria-label={editMode ? `${label} position handle` : undefined}
      style={{
        position: "absolute",
        left: `${position.left}%`,
        top: `${position.top}%`,
        transform: "translate(-50%, -50%)",
        zIndex,
        cursor: editMode ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
        userSelect: "none",
        ...style
      }}
      animate={animate}
      transition={transition}
      onPointerDown={handlePointerDown}
    >
      {children}
    </motion.div>
  );
}
