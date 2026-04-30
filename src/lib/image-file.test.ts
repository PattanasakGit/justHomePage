import { describe, expect, it } from "vitest";
import { computeAverageLuminance } from "./image-file";

function makePixels(rgba: Array<[number, number, number, number]>) {
  const buffer = new Uint8ClampedArray(rgba.length * 4);
  rgba.forEach(([r, g, b, a], index) => {
    const offset = index * 4;
    buffer[offset] = r;
    buffer[offset + 1] = g;
    buffer[offset + 2] = b;
    buffer[offset + 3] = a;
  });
  return buffer;
}

describe("computeAverageLuminance", () => {
  it("returns ~1 for fully white pixels", () => {
    const pixels = makePixels([
      [255, 255, 255, 255],
      [255, 255, 255, 255],
    ]);
    expect(computeAverageLuminance(pixels)).toBeCloseTo(1, 2);
  });

  it("returns ~0 for fully black pixels", () => {
    const pixels = makePixels([
      [0, 0, 0, 255],
      [0, 0, 0, 255],
    ]);
    expect(computeAverageLuminance(pixels)).toBeCloseTo(0, 2);
  });

  it("falls between 0 and 1 for mid-tone pixels", () => {
    const pixels = makePixels([
      [128, 128, 128, 255],
      [128, 128, 128, 255],
    ]);
    const value = computeAverageLuminance(pixels);
    expect(value).toBeGreaterThan(0.3);
    expect(value).toBeLessThan(0.7);
  });

  it("returns null for empty pixel buffers", () => {
    expect(computeAverageLuminance(new Uint8ClampedArray(0))).toBeNull();
  });
});
