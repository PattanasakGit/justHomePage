import { describe, expect, it } from "vitest";
import { nextSize, previousSize } from "@/components/widgets/size-cycle";
import type { WidgetSize } from "@/lib/types";

describe("nextSize", () => {
  it("advances through the allowed list", () => {
    const allowed: WidgetSize[] = ["compact", "regular", "wide"];
    expect(nextSize("compact", allowed)).toBe("regular");
    expect(nextSize("regular", allowed)).toBe("wide");
  });

  it("wraps from the last allowed size back to the first", () => {
    const allowed: WidgetSize[] = ["compact", "regular", "wide"];
    expect(nextSize("wide", allowed)).toBe("compact");
  });

  it("returns the same size when only one is allowed", () => {
    expect(nextSize("compact", ["compact"])).toBe("compact");
  });

  it("falls back to the first allowed size when current is not in the list", () => {
    expect(nextSize("hero", ["compact", "regular"])).toBe("compact");
  });
});

describe("previousSize", () => {
  it("walks backwards and wraps", () => {
    const allowed: WidgetSize[] = ["compact", "regular", "wide"];
    expect(previousSize("regular", allowed)).toBe("compact");
    expect(previousSize("compact", allowed)).toBe("wide");
  });

  it("returns the same size when only one is allowed", () => {
    expect(previousSize("tall", ["tall"])).toBe("tall");
  });
});
