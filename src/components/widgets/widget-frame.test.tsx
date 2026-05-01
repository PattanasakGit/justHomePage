import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { WidgetFrame } from "@/components/widgets/widget-frame";
import type { HomeWidget, WidgetSize, WidgetType } from "@/lib/types";

function makeWidget(type: WidgetType, size: WidgetSize): HomeWidget {
  return {
    id: `${type}-${size}`,
    type,
    title: `${type} ${size}`,
    size,
    config: {},
  } as HomeWidget;
}

function renderFrame(type: WidgetType, size: WidgetSize) {
  const { container } = render(<WidgetFrame widget={makeWidget(type, size)} scale="cozy" />);
  const article = container.querySelector("article");
  if (!article) throw new Error("article not found");
  return article;
}

describe("WidgetFrame per-(type, size) row-span exceptions", () => {
  // Failing cases per QA: clock/regular, weather/compact, weather/regular,
  // pomodoro/wide all clip because the row only allocates ~156px.
  const expectRowSpan2: Array<[WidgetType, WidgetSize]> = [
    ["clock", "regular"],
    ["weather", "compact"],
    ["weather", "regular"],
    ["pomodoro", "wide"],
  ];

  for (const [type, size] of expectRowSpan2) {
    it(`assigns row-span-2 to ${type} at ${size}`, () => {
      const article = renderFrame(type, size);
      expect(article.className).toMatch(/row-span-2/);
    });
  }

  // Cases that must NOT gain row-span-2 (sibling rows must stay 1).
  const expectNoExtraRowSpan: Array<[WidgetType, WidgetSize]> = [
    ["clock", "compact"],
    ["pomodoro", "regular"],
    ["date", "compact"],
    ["date", "regular"],
    ["weather", "wide"],
  ];

  for (const [type, size] of expectNoExtraRowSpan) {
    it(`does NOT add row-span-2 to ${type} at ${size}`, () => {
      const article = renderFrame(type, size);
      expect(article.className).not.toMatch(/row-span-2/);
    });
  }

  // Tall widgets keep their existing implicit row-span-2.
  const tallTypes: WidgetType[] = ["notes", "todo"];
  for (const type of tallTypes) {
    it(`keeps row-span-2 on ${type} at tall`, () => {
      const article = renderFrame(type, "tall");
      expect(article.className).toMatch(/row-span-2/);
    });
  }
});
