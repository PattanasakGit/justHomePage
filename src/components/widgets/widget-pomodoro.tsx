"use client";

import { useEffect, useReducer } from "react";
import { FiPause, FiPlay, FiRotateCcw } from "react-icons/fi";
import {
  createInitialPomodoroState,
  formatPomodoroTime,
  pomodoroReducer,
  type PomodoroMode,
} from "@/components/widgets/pomodoro-engine";
import type { PomodoroConfig } from "@/lib/types";

const DEFAULTS: PomodoroConfig = { focusMinutes: 25, breakMinutes: 5 };

export function WidgetPomodoro({ config }: { config: Partial<PomodoroConfig> }) {
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
  const progress = totalSeconds === 0 ? 0 : 1 - state.remainingSeconds / totalSeconds;

  return (
    <div className="flex h-full flex-col">
      <ModeSwitch mode={state.mode} onSwitch={(mode) => dispatch({ type: "switchMode", mode })} />
      <div className="mt-3 grid flex-1 place-items-center">
        <div className="text-center">
          <div className="text-5xl font-semibold tabular-nums tracking-tight">
            {formatPomodoroTime(state.remainingSeconds)}
          </div>
          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-[color:var(--surface-strong)]" aria-hidden>
            <div
              className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={state.running ? "Pause timer" : "Start timer"}
          onClick={() => dispatch({ type: state.running ? "pause" : "start" })}
          className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--accent)] text-[color:var(--ink-inverse)] shadow-soft transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
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
