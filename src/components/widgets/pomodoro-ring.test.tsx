import { describe, expect, it } from "vitest";
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
