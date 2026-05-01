import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PomodoroRing, RING_GEOMETRY, computeRingDashOffset } from "@/components/widgets/pomodoro-ring";

describe("computeRingDashOffset", () => {
  it("returns 0 when nothing has elapsed (full circle remaining)", () => {
    expect(computeRingDashOffset(60, 60)).toBeCloseTo(0, 5);
  });

  it("returns the full circumference when time is up", () => {
    expect(computeRingDashOffset(0, 60)).toBeCloseTo(RING_GEOMETRY.circumference, 5);
  });

  it("returns half circumference at half progress", () => {
    expect(computeRingDashOffset(30, 60)).toBeCloseTo(RING_GEOMETRY.circumference / 2, 5);
  });

  it("clamps when total is 0", () => {
    expect(computeRingDashOffset(0, 0)).toBe(0);
  });
});

describe("PomodoroRing", () => {
  it("renders a solid stroke when mode is focus", () => {
    const { getByTestId } = render(<PomodoroRing secondsLeft={1500} total={1500} mode="focus" />);
    const progress = getByTestId("pomodoro-ring-progress");
    expect(progress.getAttribute("stroke-dasharray")).toBe(`${RING_GEOMETRY.circumference}`);
    expect(Number(progress.getAttribute("stroke-dashoffset"))).toBeCloseTo(0, 5);
  });

  it("renders a dashed stroke when mode is break", () => {
    const { getByTestId } = render(<PomodoroRing secondsLeft={300} total={300} mode="break" />);
    const progress = getByTestId("pomodoro-ring-progress");
    expect(progress.getAttribute("stroke-dasharray")).toBe("4 6");
  });

  it("dashoffset reflects progress", () => {
    const { getByTestId } = render(<PomodoroRing secondsLeft={750} total={1500} mode="focus" />);
    const progress = getByTestId("pomodoro-ring-progress");
    expect(Number(progress.getAttribute("stroke-dashoffset"))).toBeCloseTo(
      RING_GEOMETRY.circumference / 2,
      5,
    );
  });

  it("renders at 88px when size is `sm`", () => {
    const { container } = render(
      <PomodoroRing secondsLeft={60} total={60} mode="focus" size="sm" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("88px");
    expect(wrapper.style.height).toBe("88px");
  });

  it("renders at 112px when size is `md`", () => {
    const { container } = render(
      <PomodoroRing secondsLeft={60} total={60} mode="focus" size="md" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("112px");
    expect(wrapper.style.height).toBe("112px");
  });

  it("renders at 128px when size is `lg`", () => {
    const { container } = render(
      <PomodoroRing secondsLeft={60} total={60} mode="focus" size="lg" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("128px");
    expect(wrapper.style.height).toBe("128px");
  });
});

// ---------------------------------------------------------------------------
// Universal ring guard (2026-05-01 pomodoro size-fix):
// PomodoroRing must measure its parent via ResizeObserver and render NOTHING
// when min(parentW, parentH) - 24 < RING_SIZE_PX[size].
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

describe("PomodoroRing parent-size guard", () => {
  beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderInParent(size: "sm" | "md" | "lg") {
    const utils = render(
      <div data-testid="parent" style={{ width: 200, height: 200 }}>
        <PomodoroRing secondsLeft={60} total={60} mode="focus" size={size} />
      </div>,
    );
    return utils;
  }

  it("renders nothing when min(parentW, parentH) - 24 < 88 (size sm)", () => {
    const { container } = renderInParent("sm");
    // Drive the observer with an under-sized parent: 100x100 -> 100-24=76 < 88
    act(() => {
      MockResizeObserver.instances.forEach((obs) => obs.trigger(100, 100));
    });
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector("[data-testid='pomodoro-ring']")).toBeNull();
  });

  it("renders the SVG when min(parentW, parentH) - 24 >= 88 (size sm)", () => {
    const { container } = renderInParent("sm");
    // 200x200 -> 200-24=176 >= 88
    act(() => {
      MockResizeObserver.instances.forEach((obs) => obs.trigger(200, 200));
    });
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("guards `lg` against parents narrower than 128 + 24px", () => {
    const { container } = renderInParent("lg");
    act(() => {
      // 140x300 -> min=140, 140-24=116 < 128 -> hide
      MockResizeObserver.instances.forEach((obs) => obs.trigger(140, 300));
    });
    expect(container.querySelector("svg")).toBeNull();
  });
});
