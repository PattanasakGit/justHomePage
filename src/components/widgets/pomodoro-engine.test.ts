import { describe, expect, it } from "vitest";
import {
  createInitialPomodoroState,
  formatPomodoroTime,
  pomodoroReducer,
} from "@/components/widgets/pomodoro-engine";

describe("pomodoro engine", () => {
  it("creates an initial state with focus seconds", () => {
    const s = createInitialPomodoroState(25, 5);
    expect(s.mode).toBe("focus");
    expect(s.remainingSeconds).toBe(25 * 60);
    expect(s.running).toBe(false);
  });

  it("start sets running true", () => {
    const s = createInitialPomodoroState(25, 5);
    expect(pomodoroReducer(s, { type: "start" }).running).toBe(true);
  });

  it("pause sets running false", () => {
    const s = { ...createInitialPomodoroState(25, 5), running: true };
    expect(pomodoroReducer(s, { type: "pause" }).running).toBe(false);
  });

  it("tick decrements when running", () => {
    const s = { ...createInitialPomodoroState(25, 5), running: true };
    expect(pomodoroReducer(s, { type: "tick" }).remainingSeconds).toBe(25 * 60 - 1);
  });

  it("tick is a no-op when paused", () => {
    const s = createInitialPomodoroState(25, 5);
    expect(pomodoroReducer(s, { type: "tick" }).remainingSeconds).toBe(25 * 60);
  });

  it("auto switches to break when focus hits zero", () => {
    const s = { ...createInitialPomodoroState(25, 5), running: true, remainingSeconds: 1 };
    const next = pomodoroReducer(s, { type: "tick" });
    expect(next.mode).toBe("break");
    expect(next.remainingSeconds).toBe(5 * 60);
    expect(next.running).toBe(false);
  });

  it("reset returns to current mode's full duration", () => {
    const s = { ...createInitialPomodoroState(25, 5), remainingSeconds: 100, running: true };
    const next = pomodoroReducer(s, { type: "reset" });
    expect(next.running).toBe(false);
    expect(next.remainingSeconds).toBe(25 * 60);
  });

  it("switchMode flips and resets seconds", () => {
    const s = createInitialPomodoroState(25, 5);
    const next = pomodoroReducer(s, { type: "switchMode", mode: "break" });
    expect(next.mode).toBe("break");
    expect(next.remainingSeconds).toBe(5 * 60);
  });

  it("formatPomodoroTime pads minutes and seconds", () => {
    expect(formatPomodoroTime(0)).toBe("00:00");
    expect(formatPomodoroTime(65)).toBe("01:05");
    expect(formatPomodoroTime(25 * 60)).toBe("25:00");
  });
});
