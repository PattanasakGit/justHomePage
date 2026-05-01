import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { WidgetPomodoro } from "@/components/widgets/widget-pomodoro";

// ---------------------------------------------------------------------------
// Per-variant composition (2026-05-01 pomodoro size-fix). Brief lives at
// docs/ux/explorations/2026-05-01-pomodoro-size-fix.md. The widget MUST
// branch on `widget.variant`, not on the legacy WidgetSize.
// ---------------------------------------------------------------------------

type ROCallback = (entries: Array<{ contentRect: { width: number; height: number } }>) => void;

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  cb: ROCallback;
  target: Element | null = null;
  constructor(cb: ROCallback) {
    this.cb = cb;
    MockResizeObserver.instances.push(this);
  }
  observe(target: Element) {
    this.target = target;
  }
  unobserve() {}
  disconnect() {}
  trigger(width: number, height: number) {
    this.cb([{ contentRect: { width, height } }]);
  }
}

function flushObservers(width: number, height: number) {
  act(() => {
    MockResizeObserver.instances.forEach((obs) => obs.trigger(width, height));
  });
}

describe("WidgetPomodoro variants", () => {
  beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pomo-compact: no SVG ring, renders an aria progressbar with seconds-left percent", () => {
    const { container } = render(
      <WidgetPomodoro
        variant="pomo-compact"
        config={{ focusMinutes: 25, breakMinutes: 5 }}
      />,
    );
    flushObservers(220, 130);

    // Compact must NOT render the PomodoroRing's SVG (button icons may still
    // be SVGs from react-icons; we target the ring specifically).
    expect(container.querySelector("[data-testid='pomodoro-ring']")).toBeNull();

    // Flat progress bar with role="progressbar" — fresh state means
    // remainingSeconds = total, so progress is 0%.
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("aria-valuemin")).toBe("0");
    expect(bar?.getAttribute("aria-valuemax")).toBe("100");
    expect(Number(bar?.getAttribute("aria-valuenow"))).toBeCloseTo(0, 0);
  });

  it("pomo-card: renders a small SVG ring left + grid-rows right column for tabs/buttons", () => {
    const { container } = render(
      <WidgetPomodoro
        variant="pomo-card"
        config={{ focusMinutes: 25, breakMinutes: 5 }}
      />,
    );
    flushObservers(320, 240);

    // Ring is present
    expect(container.querySelector("[data-testid='pomodoro-ring']")).not.toBeNull();

    // 88px sm ring
    const wrapper = container.querySelector("[data-testid='pomodoro-ring']")?.parentElement as HTMLElement;
    expect(wrapper?.style.width).toBe("88px");

    // Right column uses an explicit grid-rows-[auto_auto] layout
    const rightCol = container.querySelector("[data-testid='pomo-controls']") as HTMLElement;
    expect(rightCol).not.toBeNull();
    expect(rightCol.className).toMatch(/grid-rows-\[auto_auto\]/);
    expect(rightCol.className).toMatch(/justify-items-end/);
  });

  it("pomo-wide: renders a lg SVG ring + centred digits + tabs above buttons", () => {
    const { container } = render(
      <WidgetPomodoro
        variant="pomo-wide"
        config={{ focusMinutes: 25, breakMinutes: 5 }}
      />,
    );
    flushObservers(560, 260);

    expect(container.querySelector("[data-testid='pomodoro-ring']")).not.toBeNull();
    const wrapper = container.querySelector("[data-testid='pomodoro-ring']")?.parentElement as HTMLElement;
    expect(wrapper?.style.width).toBe("128px");

    // Centred digit column exists with text-4xl
    const digits = container.querySelector("[data-testid='pomo-digits']");
    expect(digits).not.toBeNull();
    expect(digits?.className).toMatch(/text-4xl/);
  });
});
