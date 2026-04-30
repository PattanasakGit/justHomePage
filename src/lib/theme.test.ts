import { describe, expect, it } from "vitest";
import { buildThemeVariables, getReadableTextPair, resolveContrast } from "./theme";

describe("theme utilities", () => {
  it("builds ui CSS variables from color, transparency, and blur controls", () => {
    expect(buildThemeVariables({ accentColor: "#4f8cff", uiOpacity: 72, blur: 18 })).toMatchObject({
      "--accent": "#4f8cff",
      "--panel": "rgba(255, 255, 255, 0.72)",
      "--ui-blur": "18px",
    });
  });

  it("returns readable text pairs for light and dark contrast modes", () => {
    expect(getReadableTextPair("light")).toEqual({ ink: "#f7faf6", muted: "#d8e0dc" });
    expect(getReadableTextPair("dark")).toEqual({ ink: "#17201b", muted: "#66736c" });
  });
});

describe("resolveContrast", () => {
  it("returns explicit choice unchanged", () => {
    expect(resolveContrast("dark", true, "linen", 0.1)).toBe("dark");
    expect(resolveContrast("light", false, "graphite", 0.9)).toBe("light");
  });

  it("auto + no wallpaper: graphite gets light text, others get dark", () => {
    expect(resolveContrast("auto", false, "graphite", null)).toBe("light");
    expect(resolveContrast("auto", false, "linen", null)).toBe("dark");
    expect(resolveContrast("auto", false, "sky", null)).toBe("dark");
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
