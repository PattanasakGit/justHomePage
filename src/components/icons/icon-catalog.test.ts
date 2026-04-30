import { describe, expect, it } from "vitest";
import {
  iconCatalog,
  iconCategories,
  searchCatalog,
  getCatalogByCategory,
  type IconCatalogEntry,
} from "@/components/icons/icon-catalog";
import { LETTER_ICON, getBrandIcon } from "@/components/icons/brand-icon";

describe("icon catalog", () => {
  it("exposes the letter avatar as the first entry", () => {
    expect(iconCatalog[0].id).toBe(LETTER_ICON);
  });

  it("has unique ids", () => {
    const ids = iconCatalog.map((entry: IconCatalogEntry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every entry at least one keyword", () => {
    iconCatalog.forEach((entry: IconCatalogEntry) => {
      expect(entry.keywords.length).toBeGreaterThan(0);
    });
  });

  it("getBrandIcon returns a renderer for every catalog entry", () => {
    iconCatalog.forEach((entry: IconCatalogEntry) => {
      const brand = getBrandIcon(entry.id);
      expect(typeof brand.icon).toBe("function");
    });
  });

  it("declares every required category", () => {
    expect(iconCategories).toContain("brand");
    expect(iconCategories).toContain("general");
  });

  it("getCatalogByCategory filters entries", () => {
    const brandEntries = getCatalogByCategory("brand");
    expect(brandEntries.length).toBeGreaterThan(0);
    brandEntries.forEach((entry) => expect(entry.category).toBe("brand"));
  });

  it("searchCatalog matches by label and keyword (case-insensitive)", () => {
    const results = searchCatalog("github");
    expect(results.some((entry) => entry.id === "github")).toBe(true);

    const mailResults = searchCatalog("mail");
    expect(mailResults.length).toBeGreaterThan(0);
  });

  it("searchCatalog with empty string returns the full catalog", () => {
    expect(searchCatalog("")).toHaveLength(iconCatalog.length);
  });

  it("includes neutral icons that are not brand icons", () => {
    const neutrals = iconCatalog.filter((entry) => entry.category !== "brand" && entry.id !== LETTER_ICON);
    expect(neutrals.length).toBeGreaterThan(20);
  });
});
