import { describe, expect, it } from "vitest";
import { getWidgetMeta, widgetRegistry, type WidgetMeta } from "@/components/widgets/widget-registry";
import type { WidgetType } from "@/lib/types";

const allTypes: WidgetType[] = ["clock", "date", "notes", "quickLinks", "pomodoro", "todo", "weather", "bookmark"];

describe("widget registry", () => {
  it("provides metadata for every widget type", () => {
    allTypes.forEach((type) => {
      const meta: WidgetMeta = getWidgetMeta(type);
      expect(meta).toBeDefined();
      expect(typeof meta.label).toBe("string");
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.icon).toBe("function");
      expect(["small", "middle", "max"]).toContain(meta.defaultSize);
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
});
