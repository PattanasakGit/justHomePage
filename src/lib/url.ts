export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function inferTitleFromUrl(value: string) {
  try {
    const hostname = new URL(normalizeUrl(value)).hostname.replace(/^www\./, "");
    const label = hostname.split(".")[0] ?? "";
    const knownTitle = knownHostTitles[label.toLowerCase()];
    if (knownTitle) return knownTitle;
    return label
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

const knownHostTitles: Record<string, string> = {
  github: "GitHub",
  youtube: "YouTube",
  gmail: "Gmail",
  google: "Google",
  notion: "Notion",
  figma: "Figma",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  spotify: "Spotify",
  openai: "OpenAI",
  x: "X",
};
