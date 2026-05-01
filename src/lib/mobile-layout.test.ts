import { describe, expect, it } from "vitest";
import { mobileH } from "@/lib/mobile-layout";
import type { WidgetType } from "@/lib/types";

/**
 * Mobile workspace strips compress every widget into a full-width card with a
 * type-aware row count. The helper is the single source of truth for the
 * `<sm` `smallLayout` builder in `home-page.tsx`; lock the contract here so a
 * future variant addition cannot silently regress phone heights.
 */
describe("mobileH", () => {
  const cases: Array<{ type: WidgetType; variant: string; expected: 1 | 2 | 4 }> = [
    // 1-cell strips
    { type: "clock", variant: "clock-square", expected: 1 },
    { type: "clock", variant: "clock-banner", expected: 1 },
    { type: "clock", variant: "clock-display", expected: 1 },
    { type: "date", variant: "date-square", expected: 1 },
    { type: "date", variant: "date-banner", expected: 1 },
    { type: "date", variant: "date-calendar", expected: 1 },
    { type: "weather", variant: "weather-square", expected: 1 },
    { type: "weather", variant: "weather-detail", expected: 1 },
    { type: "weather", variant: "weather-forecast", expected: 1 },
    { type: "bookmark", variant: "bookmark-tile", expected: 1 },
    { type: "bookmark", variant: "bookmark-card", expected: 1 },
    { type: "bookmark", variant: "bookmark-banner", expected: 1 },
    // 2-cell strips
    { type: "pomodoro", variant: "pomo-card", expected: 2 },
    { type: "pomodoro", variant: "pomo-compact", expected: 2 },
    { type: "pomodoro", variant: "pomo-wide", expected: 2 },
    { type: "quickLinks", variant: "links-row", expected: 2 },
    { type: "quickLinks", variant: "links-grid", expected: 2 },
    { type: "quickLinks", variant: "links-strip", expected: 2 },
    // 4-cell strips
    { type: "todo", variant: "todo-list", expected: 4 },
    { type: "todo", variant: "todo-compact", expected: 4 },
    { type: "todo", variant: "todo-board", expected: 4 },
    { type: "notes", variant: "notes-pad", expected: 4 },
    { type: "notes", variant: "notes-strip", expected: 4 },
    { type: "notes", variant: "notes-page", expected: 4 },
  ];

  for (const c of cases) {
    it(`returns ${c.expected} for ${c.type}/${c.variant}`, () => {
      expect(mobileH(c.type, c.variant)).toBe(c.expected);
    });
  }

  it("falls back to 2 for unknown variant id", () => {
    // Defensive default — never zero, never huge.
    expect(mobileH("clock", "not-a-variant")).toBeGreaterThanOrEqual(1);
  });
});
