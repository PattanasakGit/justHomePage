import { describe, expect, it } from "vitest";
import { getWidgetMeta, widgetRegistry, type WidgetMeta } from "@/components/widgets/widget-registry";
import type { WidgetSize, WidgetType } from "@/lib/types";

const allTypes: WidgetType[] = ["clock", "date", "notes", "quickLinks", "pomodoro", "todo", "weather", "bookmark"];
const allowedSizeVocab: WidgetSize[] = ["compact", "regular", "wide", "tall", "hero"];

describe("widget registry", () => {
  it("provides metadata for every widget type", () => {
    allTypes.forEach((type) => {
      const meta: WidgetMeta = getWidgetMeta(type);
      expect(meta).toBeDefined();
      expect(typeof meta.label).toBe("string");
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.icon).toBe("function");
      expect(allowedSizeVocab).toContain(meta.defaultSize);
      expect(meta.defaultConfig).toBeDefined();
    });
  });

  it("registry exposes the same set of types", () => {
    const keys = Object.keys(widgetRegistry).sort();
    expect(keys).toEqual([...allTypes].sort());
  });

  it("every meta provides a stable default title", () => {
    allTypes.forEach((type) => {
      expect(getWidgetMeta(type).defaultTitle).toBeTruthy();
    });
  });

  it("every widget exposes an allowedSizes list with no duplicates and only known sizes", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      expect(Array.isArray(meta.allowedSizes)).toBe(true);
      expect(meta.allowedSizes.length).toBeGreaterThanOrEqual(1);
      const unique = new Set(meta.allowedSizes);
      expect(unique.size).toBe(meta.allowedSizes.length);
      meta.allowedSizes.forEach((size) => {
        expect(allowedSizeVocab).toContain(size);
      });
    });
  });

  it("defaultSize is always one of the widget's allowedSizes", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      expect(meta.allowedSizes).toContain(meta.defaultSize);
    });
  });

  it("multi-size widgets that need cycling expose at least 2 allowed sizes", () => {
    const multiSize: WidgetType[] = ["notes", "pomodoro", "todo", "quickLinks"];
    multiSize.forEach((type) => {
      expect(getWidgetMeta(type).allowedSizes.length).toBeGreaterThanOrEqual(2);
    });
  });
});
