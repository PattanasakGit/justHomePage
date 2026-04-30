export type SiteMetadata = {
  title: string | null;
  iconUrl: string | null;
};

const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;
const LINK_RE = /<link\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
const ICON_REL_PRIORITY = ["apple-touch-icon", "icon", "shortcut icon", "mask-icon"];

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function parseAttributes(tag: string) {
  const attrs = new Map<string, string>();
  for (const match of tag.matchAll(ATTR_RE)) {
    attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function toAbsoluteUrl(baseUrl: string, value: string | null) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

export function getFallbackFaviconUrl(siteUrl: string) {
  try {
    return new URL("/favicon.ico", siteUrl).toString();
  } catch {
    return null;
  }
}

export function extractSiteMetadata(siteUrl: string, html: string): SiteMetadata {
  const title = html.match(TITLE_RE)?.[1]?.replace(/\s+/g, " ").trim();
  const iconCandidates: Array<{ href: string; rel: string }> = [];

  for (const match of html.matchAll(LINK_RE)) {
    const attrs = parseAttributes(match[0]);
    const rel = attrs.get("rel")?.toLowerCase();
    const href = attrs.get("href");
    if (!rel || !href || !ICON_REL_PRIORITY.some((item) => rel.includes(item))) continue;
    iconCandidates.push({ rel, href });
  }

  iconCandidates.sort((a, b) => {
    const aIndex = ICON_REL_PRIORITY.findIndex((item) => a.rel.includes(item));
    const bIndex = ICON_REL_PRIORITY.findIndex((item) => b.rel.includes(item));
    return aIndex - bIndex;
  });

  return {
    title: title ? decodeHtml(title) : null,
    iconUrl: toAbsoluteUrl(siteUrl, iconCandidates[0]?.href ?? null) ?? getFallbackFaviconUrl(siteUrl),
  };
}
