"use client";

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

const RING_SIZE_PX: Record<PomodoroRingSize, number> = {
  sm: 88,
  md: 112,
  lg: 128,
};

/**
 * Quiet OS pomodoro ring — solid stroke for focus, dashed for break.
 * Animates `stroke-dashoffset` only. The displayed diameter is driven by
 * the explicit `size` prop (sm = 88px / md = 112px / lg = 128px); the SVG
 * geometry stays at {@link RING_GEOMETRY} so dash math remains stable.
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
  const offset = computeRingDashOffset(secondsLeft, total);
  const isBreak = mode === "break";
  const display = RING_SIZE_PX[size];
  return (
    <div
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
