"use client";

import { useEffect, useRef, useState } from "react";
import type { PomodoroMode } from "@/components/widgets/pomodoro-engine";

const RING_DIAMETER = 140;
const RING_STROKE = 6;
const RING_RADIUS = (RING_DIAMETER - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function computeRingDashOffset(secondsLeft: number, total: number): number {
  if (total <= 0) return 0;
  const progress = Math.min(1, Math.max(0, 1 - secondsLeft / total));
  return RING_CIRCUMFERENCE * progress;
}

export const RING_GEOMETRY = {
  diameter: RING_DIAMETER,
  stroke: RING_STROKE,
  radius: RING_RADIUS,
  circumference: RING_CIRCUMFERENCE,
};

export type PomodoroRingSize = "sm" | "md" | "lg";

export const RING_SIZE_PX: Record<PomodoroRingSize, number> = {
  sm: 88,
  md: 112,
  lg: 128,
};

/** Universal safety margin (in CSS pixels) checked across BOTH parent
 *  dimensions before the ring renders. The host should provide a slot with
 *  at least `ringSize + RING_SAFETY_MARGIN_PX` of space; below that the ring
 *  hides itself so the host can fall back to a flat composition. */
const RING_SAFETY_MARGIN_PX = 24;

/**
 * Quiet OS pomodoro ring — solid stroke for focus, dashed for break.
 * Animates `stroke-dashoffset` only. The displayed diameter is driven by
 * the explicit `size` prop (sm = 88px / md = 112px / lg = 128px); the SVG
 * geometry stays at {@link RING_GEOMETRY} so dash math remains stable.
 *
 * Self-guard: the component observes its parent via `ResizeObserver` and
 * renders nothing when `min(parentW, parentH) - 24 < RING_SIZE_PX[size]`.
 * The host widget is expected to render a flat fallback in that case.
 */
export function PomodoroRing({
  secondsLeft,
  total,
  mode,
  size = "md",
  children,
}: {
  secondsLeft: number;
  total: number;
  mode: PomodoroMode;
  size?: PomodoroRingSize;
  children?: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Optimistic default: assume the parent has room. The ResizeObserver will
  // flip us off if (and only if) the parent shrinks below the safe square.
  // This keeps SSR / non-observed contexts visible by default.
  const [hasRoom, setHasRoom] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const parent = wrapper?.parentElement;
    if (!parent || typeof ResizeObserver === "undefined") return;
    const need = RING_SIZE_PX[size];
    const evaluate = (width: number, height: number) => {
      // Ignore zero-by-zero seeds (jsdom / detached layouts) — only flip on
      // genuine measurements.
      if (width <= 0 && height <= 0) return;
      const available = Math.min(width, height) - RING_SAFETY_MARGIN_PX;
      setHasRoom(available >= need);
    };
    // Seed from current layout so we don't flash on mount.
    const rect = parent.getBoundingClientRect();
    evaluate(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      // Observer entries are real measurements — always honour them.
      const available = Math.min(width, height) - RING_SAFETY_MARGIN_PX;
      setHasRoom(available >= need);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [size]);

  const offset = computeRingDashOffset(secondsLeft, total);
  const isBreak = mode === "break";
  const display = RING_SIZE_PX[size];

  // Always render a small probe so `parentElement` is reachable for the
  // observer effect. When `hasRoom` is false, render an empty span (no
  // SVG, no dimensions) — the host widget shows its flat fallback.
  if (!hasRoom) {
    return <span ref={wrapperRef} aria-hidden="true" data-testid="pomodoro-ring-hidden" />;
  }

  return (
    <div
      ref={wrapperRef}
      className="relative grid place-items-center"
      style={{ width: display, height: display }}
    >
      <svg
        width={display}
        height={display}
        viewBox={`0 0 ${RING_DIAMETER} ${RING_DIAMETER}`}
        className="-rotate-90"
        aria-hidden="true"
        data-testid="pomodoro-ring"
        data-mode={mode}
      >
        <circle
          cx={RING_DIAMETER / 2}
          cy={RING_DIAMETER / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--surface-strong)"
          strokeWidth={RING_STROKE}
        />
        <circle
          data-testid="pomodoro-ring-progress"
          cx={RING_DIAMETER / 2}
          cy={RING_DIAMETER / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={isBreak ? "4 6" : `${RING_CIRCUMFERENCE}`}
          strokeDashoffset={isBreak ? 0 : offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
