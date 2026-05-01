import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { WidgetQuickLinks } from "@/components/widgets/widget-quick-links";

const TWELVE_LINKS = Array.from({ length: 12 }, (_, i) => `Link ${i + 1}`).join(",");

describe("WidgetQuickLinks scroll containment", () => {
  it("renders all 12 links inside a scrollable region at `wide` size", () => {
    const { container } = render(<WidgetQuickLinks size="wide" value={TWELVE_LINKS} />);
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(12);
    // The scroll region is the element directly hosting the list items.
    const scrollRegion = container.querySelector("[data-testid='quick-links-scroll']");
    expect(scrollRegion).not.toBeNull();
    const cls = scrollRegion!.className;
    expect(cls).toMatch(/overflow-y-auto/);
    expect(cls).toMatch(/min-h-0/);
    expect(cls).toMatch(/flex-1/);
  });

  it("uses a 2-column grid at `wide` size and a 1-column grid at `regular` size", () => {
    const wide = render(<WidgetQuickLinks size="wide" value={TWELVE_LINKS} />);
    const wideGrid = wide.container.querySelector("[data-testid='quick-links-scroll']");
    expect(wideGrid?.className).toMatch(/grid-cols-2/);

    const regular = render(<WidgetQuickLinks size="regular" value={TWELVE_LINKS} />);
    const regGrid = regular.container.querySelector("[data-testid='quick-links-scroll']");
    expect(regGrid?.className).toMatch(/grid-cols-1/);
  });

  it("body root uses the min-h-0 flex chain so the parent's overflow-hidden doesn't clip", () => {
    const { container } = render(<WidgetQuickLinks size="regular" value={TWELVE_LINKS} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/h-full/);
    expect(root.className).toMatch(/min-h-0/);
    expect(root.className).toMatch(/flex/);
    expect(root.className).toMatch(/flex-col/);
  });
});
