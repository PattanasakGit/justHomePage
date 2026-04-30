import { describe, expect, it } from "vitest";
import { inferTitleFromUrl } from "./url";

describe("url helpers", () => {
  it("infers a readable title from a hostname", () => {
    expect(inferTitleFromUrl("https://github.com/openai")).toBe("GitHub");
    expect(inferTitleFromUrl("www.google-drive.example.com")).toBe("Google Drive");
  });
});
