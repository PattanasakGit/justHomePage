import { describe, expect, it } from "vitest";
import { iconSizeCssVars } from "./icon-size";

describe("iconSizeCssVars", () => {
  it("maps preset sizes to CSS variables", () => {
    expect(iconSizeCssVars("sm")).toMatchObject({ "--icon-size": "36px" });
    expect(iconSizeCssVars("md")).toMatchObject({ "--icon-size": "48px" });
    expect(iconSizeCssVars("lg")).toMatchObject({ "--icon-size": "58px" });
    expect(iconSizeCssVars("xl")).toMatchObject({ "--icon-size": "68px" });
  });
});
