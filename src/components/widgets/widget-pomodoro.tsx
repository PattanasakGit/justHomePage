"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import {
  createInitialPomodoroState,
  formatPomodoroTime,
  pomodoroReducer,
  type PomodoroMode,
} from "@/components/widgets/pomodoro-engine";
import { PomodoroRing, RING_SIZE_PX, type PomodoroRingSize } from "@/components/widgets/pomodoro-ring";
import type { PomodoroConfig, WidgetSize, WidgetVariant } from "@/lib/types";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

const DEFAULTS: PomodoroConfig = { focusMinutes: 25, breakMinutes: 5 };

/** Inner safety margin (in CSS px) reserved on each side of the ring inside
 *  the widget body. Matches the rule in `pomodoro-ring.tsx` (12 each side =
 *  24 total) and is also the padding inside the dedicated ring slot so the
 *  ring observes a stable, oversized parent. */
const RING_SAFETY_MARGIN_PX = 12;
const RING_SLOT_PADDING_PX = 12;

export function WidgetPomodoro({
  config,
  size,
  variant,
}: {
  config: Partial<PomodoroConfig>;
  /** @deprecated Pass `variant` instead. Kept for legacy call sites. */
  size?: WidgetSize;
  /** Active widget variant id. Drives body composition. */
  variant?: WidgetVariant;
}) {
  const focusMinutes = config.focusMinutes ?? DEFAULTS.focusMinutes;
  const breakMinutes = config.breakMinutes ?? DEFAULTS.breakMinutes;
  const [state, dispatch] = useReducer(
    pomodoroReducer,
    createInitialPomodoroState(focusMinutes, breakMinutes),
  );
  const accentColor = useAccentTextColor();

  useEffect(() => {
    if (!state.running) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [state.running]);

  const totalSeconds = (state.mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const time = formatPomodoroTime(state.remainingSeconds);

  // Resolve variant. Fall back to legacy `size` for any caller that hasn't
  // been migrated yet.
  const resolved = resolveVariantFromProps(variant, size);

  if (resolved === "pomo-compact") {
    return (
      <CompactBody
        time={time}
        secondsLeft={state.remainingSeconds}
        total={totalSeconds}
        mode={state.mode}
        running={state.running}
        accentColor={accentColor}
        onSwitch={(mode) => dispatch({ type: "switchMode", mode })}
        onToggle={() => dispatch({ type: state.running ? "pause" : "start" })}
        onReset={() => dispatch({ type: "reset" })}
      />
    );
  }

  if (resolved === "pomo-wide") {
    return (
      <BodyWithRing
        ringSize="lg"
        renderRing={(visible) => (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="grid min-h-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-6">
              {visible ? (
                <div
                  className="flex shrink-0 items-center justify-center"
                  style={{
                    width: RING_SIZE_PX.lg + RING_SLOT_PADDING_PX * 2,
                    height: RING_SIZE_PX.lg + RING_SLOT_PADDING_PX * 2,
                  }}
                >
                  <PomodoroRing
                    secondsLeft={state.remainingSeconds}
                    total={totalSeconds}
                    mode={state.mode}
                    size="lg"
                  />
                </div>
              ) : null}
              <div
                data-testid="pomo-digits"
                className="flex min-w-0 flex-col items-start gap-1 text-4xl font-semibold tabular-nums leading-none tracking-tight"
                style={{ color: accentColor }}
              >
                <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  {state.mode}
                </span>
                <span>{time}</span>
              </div>
              <div
                data-testid="pomo-controls"
                className="grid grid-rows-[auto_auto] gap-2 justify-items-end"
              >
                <ModeSwitch
                  mode={state.mode}
                  onSwitch={(mode) => dispatch({ type: "switchMode", mode })}
                />
                <ControlButtons
                  running={state.running}
                  onToggle={() => dispatch({ type: state.running ? "pause" : "start" })}
                  onReset={() => dispatch({ type: "reset" })}
                />
              </div>
            </div>
          </div>
        )}
      />
    );
  }

  // pomo-card (default): ring left (sm 88px) + grid-rows right column.
  return (
    <BodyWithRing
      ringSize="sm"
      renderRing={(visible) => (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 items-center gap-4">
            {visible ? (
              <div
                className="flex shrink-0 items-center justify-center"
                style={{
                  width: RING_SIZE_PX.sm + RING_SLOT_PADDING_PX * 2,
                  height: RING_SIZE_PX.sm + RING_SLOT_PADDING_PX * 2,
                }}
              >
                <PomodoroRing
                  secondsLeft={state.remainingSeconds}
                  total={totalSeconds}
                  mode={state.mode}
                  size="sm"
                >
                  <div className="text-center">
                    <div className="text-base font-semibold tabular-nums leading-none tracking-tight">
                      {time}
                    </div>
                  </div>
                </PomodoroRing>
              </div>
            ) : (
              <span
                data-testid="pomo-card-digits-fallback"
                style={{ color: accentColor }}
                className="text-2xl font-semibold tabular-nums tracking-tight leading-none"
              >
                {time}
              </span>
            )}
            <div
              data-testid="pomo-controls"
              className="grid min-w-0 flex-1 grid-rows-[auto_auto] gap-2 justify-items-end"
            >
              <ModeSwitch
                mode={state.mode}
                onSwitch={(mode) => dispatch({ type: "switchMode", mode })}
              />
              <ControlButtons
                running={state.running}
                onToggle={() => dispatch({ type: state.running ? "pause" : "start" })}
                onReset={() => dispatch({ type: "reset" })}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}

/**
 * Wraps a ring-using composition with a parent-size guard. Measures the body
 * via `ResizeObserver`; passes `visible=false` to `renderRing` when
 * `min(width, height) − 24 < RING_SIZE_PX[ringSize]`. Hosts that need a flat
 * fallback should branch on `visible`.
 */
function BodyWithRing({
  ringSize,
  renderRing,
}: {
  ringSize: PomodoroRingSize;
  renderRing: (visible: boolean) => React.ReactElement;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    // The host's body must fit the full ring slot (ring + slot padding on
    // every side) — that's the same `ringSize + 24` the ring itself checks,
    // so host and ring agree on the threshold.
    const need = RING_SIZE_PX[ringSize] + RING_SLOT_PADDING_PX * 2;
    const evaluate = (width: number, height: number) => {
      if (width <= 0 && height <= 0) return;
      const available = Math.min(width, height);
      setVisible(available >= need);
    };
    const rect = node.getBoundingClientRect();
    evaluate(rect.width, rect.height);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      const available = Math.min(width, height);
      setVisible(available >= need);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ringSize]);

  return (
    <div ref={ref} className="h-full w-full min-h-0 min-w-0" data-pomo-body>
      {renderRing(visible)}
    </div>
  );
}

/**
 * Resolve a registered variant id from the props. Prefer the new `variant`
 * prop; otherwise translate the legacy WidgetSize. Unknown values default to
 * the registry's default `pomo-card`.
 */
function resolveVariantFromProps(
  variant: WidgetVariant | undefined,
  size: WidgetSize | undefined,
): "pomo-compact" | "pomo-card" | "pomo-wide" {
  if (variant === "pomo-compact" || variant === "pomo-wide" || variant === "pomo-card") {
    return variant;
  }
  if (size === "wide" || size === "hero") return "pomo-wide";
  if (size === "compact") return "pomo-compact";
  return "pomo-card";
}

function CompactBody({
  time,
  secondsLeft,
  total,
  running,
  accentColor,
  onSwitch,
  onToggle,
  onReset,
  mode,
}: {
  time: string;
  secondsLeft: number;
  total: number;
  mode: PomodoroMode;
  running: boolean;
  accentColor: string;
  onSwitch: (next: PomodoroMode) => void;
  onToggle: () => void;
  onReset: () => void;
}) {
  // Progress = elapsed / total (0..100). Fresh state has secondsLeft = total
  // -> 0%, end -> 100%.
  const elapsedPct = total > 0
    ? Math.min(100, Math.max(0, ((total - secondsLeft) / total) * 100))
    : 0;
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <ModeSwitch mode={mode} onSwitch={onSwitch} />
        <span
          data-testid="pomo-digits"
          style={{ color: accentColor }}
          className="text-3xl font-semibold tabular-nums tracking-tight leading-none"
        >
          {time}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Pomodoro progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(elapsedPct)}
        data-testid="pomo-progressbar"
        className="h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--surface-strong)]"
      >
        <div
          className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-150"
          style={{ width: `${elapsedPct}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <ControlButtons running={running} onToggle={onToggle} onReset={onReset} />
      </div>
    </div>
  );
}

function ControlButtons({
  running,
  onToggle,
  onReset,
}: {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={running ? "Pause timer" : "Start timer"}
        onClick={onToggle}
        className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--ink-inverse)] shadow-soft transition hover:brightness-95 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
      >
        {running ? <FiPause /> : <FiPlay />}
      </button>
      <button
        type="button"
        aria-label="Reset timer"
        onClick={onReset}
        className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
      >
        <FiRotateCcw />
      </button>
    </div>
  );
}

function ModeSwitch({ mode, onSwitch }: { mode: PomodoroMode; onSwitch: (next: PomodoroMode) => void }) {
  return (
    <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
      {(["focus", "break"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSwitch(value)}
          className={`rounded-full px-2.5 py-0.5 transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
            mode === value
              ? "bg-[color:var(--ink)] text-[color:var(--ink-inverse)]"
              : "text-[color:var(--muted)]"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
