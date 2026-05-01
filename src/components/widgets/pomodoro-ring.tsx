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

export type PomodoroRingScale = "compact" | "full";

/**
 * Quiet OS pomodoro ring — solid stroke for focus, dashed for break.
 * Animates `stroke-dashoffset` only.
 */
export function PomodoroRing({
  secondsLeft,
  total,
  mode,
  scale = "full",
  children,
}: {
  secondsLeft: number;
  total: number;
  mode: PomodoroMode;
  scale?: PomodoroRingScale;
  children?: React.ReactNode;
}) {
  const offset = computeRingDashOffset(secondsLeft, total);
  const isBreak = mode === "break";
  const display = scale === "compact" ? 96 : RING_DIAMETER;
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
