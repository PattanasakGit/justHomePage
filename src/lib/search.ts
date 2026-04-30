import type { SearchProviderId } from "./types";

export type SearchProvider = {
  id: SearchProviderId;
  label: string;
  shortcut: string;
  url: string;
  group: "Web" | "AI" | "Media";
};

export const searchProviders: SearchProvider[] = [
  { id: "google", label: "Google", shortcut: "g", url: "https://www.google.com/search?q={query}", group: "Web" },
  { id: "bing", label: "Bing", shortcut: "b", url: "https://www.bing.com/search?q={query}", group: "Web" },
  { id: "duckduckgo", label: "DuckDuckGo", shortcut: "d", url: "https://duckduckgo.com/?q={query}", group: "Web" },
  { id: "brave", label: "Brave", shortcut: "br", url: "https://search.brave.com/search?q={query}", group: "Web" },
  { id: "youtube", label: "YouTube", shortcut: "yt", url: "https://www.youtube.com/results?search_query={query}", group: "Media" },
  { id: "github", label: "GitHub", shortcut: "gh", url: "https://github.com/search?q={query}", group: "Web" },
  { id: "chatgpt", label: "ChatGPT", shortcut: "ai", url: "https://chatgpt.com/?q={query}", group: "AI" },
  { id: "claude", label: "Claude", shortcut: "cl", url: "https://claude.ai/new?q={query}", group: "AI" },
  { id: "gemini", label: "Gemini", shortcut: "gm", url: "https://gemini.google.com/app?q={query}", group: "AI" },
  { id: "copilot", label: "Copilot", shortcut: "cp", url: "https://copilot.microsoft.com/?q={query}", group: "AI" },
  { id: "perplexity", label: "Perplexity", shortcut: "p", url: "https://www.perplexity.ai/search?q={query}", group: "AI" },
  { id: "you", label: "You.com", shortcut: "you", url: "https://you.com/search?q={query}", group: "AI" },
  { id: "phind", label: "Phind", shortcut: "ph", url: "https://www.phind.com/search?q={query}", group: "AI" },
];

export function resolveSearchInput(providerId: string, rawQuery: string) {
  const trimmed = rawQuery.trim();
  const [possibleShortcut, ...rest] = trimmed.split(/\s+/);
  const shortcutProvider = searchProviders.find((provider) => provider.shortcut === possibleShortcut);

  if (shortcutProvider && rest.length > 0) {
    return {
      providerId: shortcutProvider.id,
      query: rest.join(" "),
    };
  }

  return {
    providerId,
    query: trimmed,
  };
}

export function buildSearchUrl(providerId: string, rawQuery: string) {
  const provider = searchProviders.find((item) => item.id === providerId) ?? searchProviders[0];
  return provider.url.replace("{query}", encodeURIComponent(rawQuery.trim()));
}
