import { describe, expect, it } from "vitest";
import {
  getWidgetMeta,
  legacySizeToVariantSpec,
  resolveVariant,
  widgetRegistry,
  type WidgetMeta,
} from "@/components/widgets/widget-registry";
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

describe("widget registry", () => {
  it("provides metadata for every widget type", () => {
    allTypes.forEach((type) => {
      const meta: WidgetMeta = getWidgetMeta(type);
      expect(meta).toBeDefined();
      expect(typeof meta.label).toBe("string");
      expect(meta.label.length).toBeGreaterThan(0);
      expect(typeof meta.icon).toBe("function");
      expect(typeof meta.defaultVariant).toBe("string");
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

  it("every widget has a non-empty variants list", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      expect(Array.isArray(meta.variants)).toBe(true);
      expect(meta.variants.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("defaultVariant is always one of the widget's variants", () => {
    allTypes.forEach((type) => {
      const meta = getWidgetMeta(type);
      expect(meta.variants.some((v) => v.id === meta.defaultVariant)).toBe(true);
    });
  });

  it("resolveVariant returns the default for unknown ids", () => {
    const meta = getWidgetMeta("clock");
    const resolved = resolveVariant("clock", "not-a-thing");
    expect(resolved.id).toBe(meta.defaultVariant);
  });

  it("legacySizeToVariantSpec maps the spec table for clock", () => {
    expect(legacySizeToVariantSpec("clock", "compact")).toMatchObject({
      variant: "clock-square",
      w: 2,
      h: 2,
    });
    expect(legacySizeToVariantSpec("clock", "wide")).toMatchObject({
      variant: "clock-banner",
      w: 4,
      h: 1,
    });
    expect(legacySizeToVariantSpec("clock", "hero")).toMatchObject({
      variant: "clock-display",
      w: 4,
      h: 3,
    });
  });

  it("legacySizeToVariantSpec maps the spec table for notes/todo/pomodoro", () => {
    expect(legacySizeToVariantSpec("notes", "wide")).toMatchObject({
      variant: "notes-strip",
      w: 6,
      h: 2,
    });
    expect(legacySizeToVariantSpec("todo", "hero")).toMatchObject({
      variant: "todo-board",
      w: 6,
      h: 5,
    });
    expect(legacySizeToVariantSpec("pomodoro", "wide")).toMatchObject({
      variant: "pomo-wide",
      w: 6,
      h: 3,
    });
  });

  it("legacySizeToVariantSpec falls back to default for unknown values", () => {
    const fallback = legacySizeToVariantSpec("bookmark", "alien");
    const meta = getWidgetMeta("bookmark");
    expect(fallback.variant).toBe(meta.defaultVariant);
  });

  // -----------------------------------------------------------------------
  // Pomodoro size-fix (2026-05-01): per-variant clamps must guarantee that
  // the body composition for each variant has the room it was designed for.
  // See docs/ux/explorations/2026-05-01-pomodoro-size-fix.md.
  // -----------------------------------------------------------------------
  it("pomo-compact clamps allow 3..5 wide and exactly 2 tall", () => {
    const variant = getWidgetMeta("pomodoro").variants.find((v) => v.id === "pomo-compact");
    expect(variant).toBeDefined();
    expect(variant).toMatchObject({ minW: 3, minH: 2, maxW: 5, maxH: 2 });
    // default falls within clamps
    expect(variant!.w).toBeGreaterThanOrEqual(variant!.minW);
    expect(variant!.w).toBeLessThanOrEqual(variant!.maxW);
    expect(variant!.h).toBeGreaterThanOrEqual(variant!.minH);
    expect(variant!.h).toBeLessThanOrEqual(variant!.maxH);
  });

  it("pomo-card clamps allow 4..6 wide and 3..4 tall", () => {
    const variant = getWidgetMeta("pomodoro").variants.find((v) => v.id === "pomo-card");
    expect(variant).toBeDefined();
    expect(variant).toMatchObject({ minW: 4, minH: 3, maxW: 6, maxH: 4 });
    expect(variant!.w).toBeGreaterThanOrEqual(variant!.minW);
    expect(variant!.w).toBeLessThanOrEqual(variant!.maxW);
    expect(variant!.h).toBeGreaterThanOrEqual(variant!.minH);
    expect(variant!.h).toBeLessThanOrEqual(variant!.maxH);
  });

  it("pomo-wide clamps allow 6..10 wide and 3..4 tall", () => {
    const variant = getWidgetMeta("pomodoro").variants.find((v) => v.id === "pomo-wide");
    expect(variant).toBeDefined();
    expect(variant).toMatchObject({ minW: 6, minH: 3, maxW: 10, maxH: 4 });
    expect(variant!.w).toBeGreaterThanOrEqual(variant!.minW);
    expect(variant!.w).toBeLessThanOrEqual(variant!.maxW);
    expect(variant!.h).toBeGreaterThanOrEqual(variant!.minH);
    expect(variant!.h).toBeLessThanOrEqual(variant!.maxH);
  });
});
