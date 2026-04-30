import { describe, expect, it } from "vitest";
import { extractSiteMetadata, getFallbackFaviconUrl } from "./site-metadata";

describe("site metadata", () => {
  it("extracts title and an absolute icon URL from html metadata", () => {
    const html = `
      <html>
        <head>
          <title>Example Docs</title>
          <link rel="apple-touch-icon" href="/apple-touch-icon.png">
          <link rel="icon" href="/favicon.ico">
        </head>
      </html>
    `;

    expect(extractSiteMetadata("https://docs.example.com/path", html)).toEqual({
      title: "Example Docs",
      iconUrl: "https://docs.example.com/apple-touch-icon.png",
    });
  });

  it("builds a favicon fallback from the origin", () => {
    expect(getFallbackFaviconUrl("https://example.com/docs")).toBe("https://example.com/favicon.ico");
  });
});
