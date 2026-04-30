import { describe, expect, it } from "vitest";
import { buildThemeVariables, getReadableTextPair } from "./theme";

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
