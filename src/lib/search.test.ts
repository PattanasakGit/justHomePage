import { describe, expect, it } from "vitest";
import { buildSearchUrl, searchProviders } from "./search";

describe("buildSearchUrl", () => {
  it("builds an encoded provider search URL", () => {
    expect(buildSearchUrl("google", "next app router")).toBe(
      "https://www.google.com/search?q=next%20app%20router",
    );
  });

  it("falls back to google when a provider id is unknown", () => {
    expect(buildSearchUrl("missing", "zustand")).toBe("https://www.google.com/search?q=zustand");
  });

  it("keeps provider definitions stable for the command palette", () => {
    expect(searchProviders.map((provider) => provider.id)).toEqual([
      "google",
      "bing",
      "duckduckgo",
      "brave",
      "youtube",
      "github",
      "chatgpt",
      "claude",
      "gemini",
      "copilot",
      "perplexity",
      "you",
      "phind",
    ]);
  });

  it("supports AI search providers with encoded query URLs", () => {
    expect(buildSearchUrl("chatgpt", "latest ai news")).toBe("https://chatgpt.com/?q=latest%20ai%20news");
    expect(buildSearchUrl("claude", "summarize react docs")).toBe("https://claude.ai/new?q=summarize%20react%20docs");
  });
});
