"use client";

import { useEffect, useReducer } from "react";
import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import {
  createInitialPomodoroState,
  formatPomodoroTime,
  pomodoroReducer,
  type PomodoroMode,
} from "@/components/widgets/pomodoro-engine";
import { PomodoroRing } from "@/components/widgets/pomodoro-ring";
import type { PomodoroConfig, WidgetSize } from "@/lib/types";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

const DEFAULTS: PomodoroConfig = { focusMinutes: 25, breakMinutes: 5 };

export function WidgetPomodoro({
  config,
  size = "regular",
}: {
  config: Partial<PomodoroConfig>;
  size?: WidgetSize;
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
  const ringSize = size === "wide" ? "lg" : "sm";
  const time = formatPomodoroTime(state.remainingSeconds);

  if (size === "wide") {
    return (
      <div className="grid h-full min-h-0 grid-cols-[auto_1fr_auto] items-center gap-6">
        <PomodoroRing
          secondsLeft={state.remainingSeconds}
          total={totalSeconds}
          mode={state.mode}
          size={ringSize}
        />
        <div className="flex min-w-0 flex-col items-start gap-1">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {state.mode}
          </span>
          <span
            style={{ color: accentColor }}
            className="text-4xl font-semibold tabular-nums leading-none tracking-tight"
          >
            {time}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ModeSwitch mode={state.mode} onSwitch={(mode) => dispatch({ type: "switchMode", mode })} />
          <ControlButtons
            running={state.running}
            onToggle={() => dispatch({ type: state.running ? "pause" : "start" })}
            onReset={() => dispatch({ type: "reset" })}
          />
        </div>
      </div>
    );
  }

  // regular — horizontal flex: ring left (88px), controls right.
  return (
    <div className="flex h-full min-h-0 items-center gap-4">
      <PomodoroRing
        secondsLeft={state.remainingSeconds}
        total={totalSeconds}
        mode={state.mode}
        size={ringSize}
      >
        <div className="text-center">
          <div className="text-base font-semibold tabular-nums leading-none tracking-tight">
            {time}
          </div>
        </div>
      </PomodoroRing>
      <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
        <ModeSwitch mode={state.mode} onSwitch={(mode) => dispatch({ type: "switchMode", mode })} />
        <ControlButtons
          running={state.running}
          onToggle={() => dispatch({ type: state.running ? "pause" : "start" })}
          onReset={() => dispatch({ type: "reset" })}
        />
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
