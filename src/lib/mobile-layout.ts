import type { WidgetType } from "@/lib/types";

/**
 * Per-(type, variant) row count for the `<sm` workspace strip. Mobile flattens
 * every widget into a full-width card and discards the desktop `widget.layout.h`.
 *
 * Heights map to react-grid-layout cells at the `sm` breakpoint
 * (`ROW_HEIGHT.sm = 60`, `MARGIN.sm = [_, 8]`):
 *   - 1 cell ≈ 60 px content (single-line strip)
 *   - 2 cells ≈ 128 px (two-line tools — pomodoro / quickLinks)
 *   - 4 cells ≈ 248 px (scrollable bodies — todo / notes)
 *
 * Desktop layouts are untouched; this helper is only consulted from the
 * `smallLayout` builder.
 */
export function mobileH(type: WidgetType, _variant: string): 1 | 2 | 4 {
  switch (type) {
    // Single-line strips: identity glyph + label + hero datum.
    case "clock":
    case "date":
    case "weather":
    case "bookmark":
      return 1;
    // Two-row tools.
    case "pomodoro":
    case "quickLinks":
      return 2;
    // Scrollable bodies.
    case "todo":
    case "notes":
      return 4;
    default:
      return 2;
  }
}
