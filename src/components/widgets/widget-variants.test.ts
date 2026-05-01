import { describe, expect, it } from "vitest";
import { widgetRegistry, getWidgetMeta } from "@/components/widgets/widget-registry";
import type { WidgetType } from "@/lib/types";

const allTypes: WidgetType[] = [
  "clock",
  "date",
  "notes",
  "quickLinks",
  "pomodoro",
  "todo",
  "weather",
  "bookmark",
];

describe("widget variants", () => {
  it("every widget exposes at least 3 variants", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      expect(meta.variants.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("variant ids are unique within each widget", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      const ids = meta.variants.map((v) => v.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  it("defaultVariant exists in variants", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      const found = meta.variants.find((v) => v.id === meta.defaultVariant);
      expect(found, `${type} default ${meta.defaultVariant}`).toBeDefined();
    });
  });

  it("each variant has positive integer w/h", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      meta.variants.forEach((v) => {
        expect(Number.isInteger(v.w)).toBe(true);
        expect(Number.isInteger(v.h)).toBe(true);
        expect(v.w).toBeGreaterThan(0);
        expect(v.h).toBeGreaterThan(0);
      });
    });
  });

  it("min ≤ default w/h ≤ max for each variant", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      meta.variants.forEach((v) => {
        expect(v.minW).toBeLessThanOrEqual(v.w);
        expect(v.w).toBeLessThanOrEqual(v.maxW);
        expect(v.minH).toBeLessThanOrEqual(v.h);
        expect(v.h).toBeLessThanOrEqual(v.maxH);
      });
    });
  });

  it("defaults match the spec for the four seed widgets", () => {
    const seed: Array<[WidgetType, string, number, number]> = [
      ["clock", "clock-square", 2, 2],
      ["date", "date-square", 2, 2],
      ["weather", "weather-square", 2, 2],
      ["bookmark", "bookmark-tile", 2, 2],
      ["quickLinks", "links-row", 4, 2],
      ["pomodoro", "pomo-card", 4, 3],
      ["todo", "todo-list", 4, 4],
      ["notes", "notes-pad", 4, 4],
    ];
    seed.forEach(([type, id, w, h]) => {
      const meta = widgetRegistry[type];
      expect(meta.defaultVariant).toBe(id);
      const variant = meta.variants.find((v) => v.id === id)!;
      expect(variant.w).toBe(w);
      expect(variant.h).toBe(h);
    });
  });
});
