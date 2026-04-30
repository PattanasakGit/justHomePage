import { describe, expect, it } from "vitest";
import { getLetterAvatar } from "./letter-avatar";

describe("getLetterAvatar", () => {
  it("returns the first non-whitespace character uppercased", () => {
    expect(getLetterAvatar("hello").letter).toBe("H");
    expect(getLetterAvatar("  github  ").letter).toBe("G");
    expect(getLetterAvatar("notion").letter).toBe("N");
  });

  it("uses a fallback character for empty input", () => {
    expect(getLetterAvatar("").letter).toBe("•");
    expect(getLetterAvatar("   ").letter).toBe("•");
  });

  it("returns a stable color for the same seed", () => {
    expect(getLetterAvatar("github").color).toBe(getLetterAvatar("github").color);
    expect(getLetterAvatar("notion").color).toBe(getLetterAvatar("notion").color);
  });

  it("varies color across different seeds", () => {
    const colors = new Set(["github", "notion", "youtube", "gmail", "drive", "spotify"].map((seed) => getLetterAvatar(seed).color));
    expect(colors.size).toBeGreaterThan(1);
  });

  it("returns a valid hex color", () => {
    const { color } = getLetterAvatar("anything");
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
