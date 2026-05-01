import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { WidgetClock } from "@/components/widgets/widget-clock";

/**
 * Mobile-only landscape strip for the clock. The body should expose the
 * `mobile-row` testid and avoid the `text-6xl` hero (which clips at 60 px
 * tall in a single-row mobile cell).
 */
describe("WidgetClock mobile body", () => {
  it("renders the mobile-row strip when isMobile is true", () => {
    const { container } = render(<WidgetClock scale="cozy" size="compact" isMobile />);
    expect(container.querySelector("[data-testid='mobile-row']")).not.toBeNull();
  });

  it("never renders text-6xl in the mobile strip", () => {
    const { container } = render(<WidgetClock scale="cozy" size="compact" isMobile />);
    expect(container.querySelector(".text-6xl")).toBeNull();
  });

  it("desktop body remains untouched (still uses the hero scale)", () => {
    const { container } = render(<WidgetClock scale="cozy" size="regular" />);
    expect(container.querySelector("[data-testid='mobile-row']")).toBeNull();
  });
});
