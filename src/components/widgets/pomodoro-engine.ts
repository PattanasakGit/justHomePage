export type PomodoroMode = "focus" | "break";

export type PomodoroState = {
  mode: PomodoroMode;
  remainingSeconds: number;
  running: boolean;
  focusMinutes: number;
  breakMinutes: number;
};

export type PomodoroAction =
  | { type: "tick" }
  | { type: "start" }
  | { type: "pause" }
  | { type: "reset" }
  | { type: "switchMode"; mode: PomodoroMode };

export function createInitialPomodoroState(focusMinutes: number, breakMinutes: number): PomodoroState {
  return {
    mode: "focus",
    remainingSeconds: focusMinutes * 60,
    running: false,
    focusMinutes,
    breakMinutes,
  };
}

export function pomodoroReducer(state: PomodoroState, action: PomodoroAction): PomodoroState {
  switch (action.type) {
    case "start":
      return { ...state, running: true };
    case "pause":
      return { ...state, running: false };
    case "reset":
      return {
        ...state,
        running: false,
        remainingSeconds: (state.mode === "focus" ? state.focusMinutes : state.breakMinutes) * 60,
      };
    case "switchMode": {
      const minutes = action.mode === "focus" ? state.focusMinutes : state.breakMinutes;
      return {
        ...state,
        mode: action.mode,
        remainingSeconds: minutes * 60,
        running: false,
      };
    }
    case "tick": {
      if (!state.running) return state;
      if (state.remainingSeconds <= 1) {
        // Auto switch when timer hits zero.
        const nextMode: PomodoroMode = state.mode === "focus" ? "break" : "focus";
        const minutes = nextMode === "focus" ? state.focusMinutes : state.breakMinutes;
        return {
          ...state,
          mode: nextMode,
          remainingSeconds: minutes * 60,
          running: false,
        };
      }
      return { ...state, remainingSeconds: state.remainingSeconds - 1 };
    }
  }
}

export function formatPomodoroTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
