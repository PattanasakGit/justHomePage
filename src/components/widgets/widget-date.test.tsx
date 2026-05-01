import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { WidgetDate } from "@/components/widgets/widget-date";

describe("WidgetDate mobile body", () => {
  it("renders the mobile-row strip when isMobile is true", () => {
    const { container } = render(<WidgetDate size="compact" isMobile />);
    expect(container.querySelector("[data-testid='mobile-row']")).not.toBeNull();
  });

  it("never renders text-6xl in the mobile strip", () => {
    const { container } = render(<WidgetDate size="compact" isMobile />);
    expect(container.querySelector(".text-6xl")).toBeNull();
  });

  it("desktop body still uses the hero day", () => {
    const { container } = render(<WidgetDate size="compact" />);
    // Desktop default body uses text-6xl day.
    expect(container.querySelector(".text-6xl")).not.toBeNull();
  });
});
