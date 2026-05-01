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

  useEffect(() => {
    if (!state.running) return;
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(timer);
  }, [state.running]);

  const totalSeconds = (state.mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const layout = size === "wide" ? "flex-row items-center gap-6" : "flex-col items-center";

  return (
    <div className={`flex h-full ${layout}`}>
      <PomodoroRing
        secondsLeft={state.remainingSeconds}
        total={totalSeconds}
        mode={state.mode}
        scale={size === "wide" ? "full" : "compact"}
      >
        <div className="text-center">
          <div className={`${size === "wide" ? "text-3xl" : "text-xl"} font-semibold tabular-nums leading-none tracking-tight`}>
            {formatPomodoroTime(state.remainingSeconds)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
            {state.mode}
          </div>
        </div>
      </PomodoroRing>
      <div className={`flex flex-col items-center gap-2 ${size === "wide" ? "" : "mt-2"}`}>
        <ModeSwitch mode={state.mode} onSwitch={(mode) => dispatch({ type: "switchMode", mode })} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={state.running ? "Pause timer" : "Start timer"}
            onClick={() => dispatch({ type: state.running ? "pause" : "start" })}
            className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--ink-inverse)] shadow-soft transition hover:brightness-95 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            {state.running ? <FiPause /> : <FiPlay />}
          </button>
          <button
            type="button"
            aria-label="Reset timer"
            onClick={() => dispatch({ type: "reset" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            <FiRotateCcw />
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeSwitch({ mode, onSwitch }: { mode: PomodoroMode; onSwitch: (next: PomodoroMode) => void }) {
  return (
    <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
      {(["focus", "break"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSwitch(value)}
          className={`rounded-full px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
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
