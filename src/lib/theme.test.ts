import { describe, expect, it } from "vitest";
import { accentReadsOnLight, buildThemeVariables, getReadableTextPair, resolveContrast } from "./theme";

describe("theme utilities", () => {
  it("builds ui CSS variables from color, transparency, and blur controls", () => {
    expect(buildThemeVariables({ accentColor: "#4f8cff", uiOpacity: 72, blur: 18 })).toMatchObject({
      "--accent": "#4f8cff",
      "--panel": "rgba(255, 255, 255, 0.72)",
      "--ui-blur": "18px",
    });
  });

  it("returns readable text pairs with ink, muted, and inverse for light and dark contrast modes", () => {
    expect(getReadableTextPair("light")).toEqual({ ink: "#f7faf6", muted: "#d8e0dc", inkInverse: "#17201b" });
    expect(getReadableTextPair("dark")).toEqual({ ink: "#17201b", muted: "#66736c", inkInverse: "#f7faf6" });
  });
});

describe("resolveContrast", () => {
  it("returns explicit choice unchanged", () => {
    expect(resolveContrast("dark", true, "linen", 0.1)).toBe("dark");
    expect(resolveContrast("light", false, "graphite", 0.9)).toBe("light");
  });

  it("auto + no wallpaper: dark themes get light text, light themes get dark text", () => {
    expect(resolveContrast("auto", false, "graphite", null)).toBe("light");
    expect(resolveContrast("auto", false, "ocean", null)).toBe("light");
    expect(resolveContrast("auto", false, "forest", null)).toBe("light");
    expect(resolveContrast("auto", false, "midnight", null)).toBe("light");
    expect(resolveContrast("auto", false, "nebula", null)).toBe("light");
    expect(resolveContrast("auto", false, "plum", null)).toBe("light");
    expect(resolveContrast("auto", false, "linen", null)).toBe("dark");
    expect(resolveContrast("auto", false, "sky", null)).toBe("dark");
    expect(resolveContrast("auto", false, "sunset", null)).toBe("dark");
    expect(resolveContrast("auto", false, "mint", null)).toBe("dark");
  });

  it("auto + dark wallpaper switches to light text", () => {
    expect(resolveContrast("auto", true, "linen", 0.2)).toBe("light");
    expect(resolveContrast("auto", true, "graphite", 0.3)).toBe("light");
  });

  it("auto + bright wallpaper keeps dark text", () => {
    expect(resolveContrast("auto", true, "linen", 0.8)).toBe("dark");
    expect(resolveContrast("auto", true, "graphite", 0.9)).toBe("dark");
  });

  it("auto + wallpaper without luminance falls back to dark text", () => {
    expect(resolveContrast("auto", true, "linen", null)).toBe("dark");
  });
});

describe("accentReadsOnLight", () => {
  it("returns false for pure white (luminance 1, would disappear on paper)", () => {
    expect(accentReadsOnLight("#ffffff")).toBe(false);
  });

  it("returns false for saturated yellow above the 0.85 luminance guard", () => {
    // #ffff00 ~ luminance 0.93 — pure yellow, the worst case for "accent on paper".
    expect(accentReadsOnLight("#ffff00")).toBe(false);
  });

  it("returns true for a mid-luminance accent (teal)", () => {
    expect(accentReadsOnLight("#339b8e")).toBe(true);
  });

  it("returns true for dark accents", () => {
    expect(accentReadsOnLight("#17201b")).toBe(true);
  });

  it("returns true on the boundary just below 0.85", () => {
    // #d4d4d4 ~ luminance 0.68 — comfortably below the threshold.
    expect(accentReadsOnLight("#d4d4d4")).toBe(true);
  });

  it("returns true for malformed input (safe default — keep accent)", () => {
    expect(accentReadsOnLight("not-a-color")).toBe(true);
  });
});
