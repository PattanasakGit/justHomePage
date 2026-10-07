import type { Favorite, Folder } from "./types";

export type BookmarkExportPayload = {
  favorites: Favorite[];
  folders: Folder[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function unescapeHtml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

/** Netscape-bookmark HTML export (common browser format). */
export function exportBookmarksHtml({ favorites, folders }: BookmarkExportPayload): string {
  const folderMap = new Map(folders.map((folder) => [folder.id, folder.name]));
  const ungrouped = favorites.filter((favorite) => !favorite.folderId);
  const byFolder = folders.map((folder) => ({
    folder,
    items: favorites.filter((favorite) => favorite.folderId === folder.id),
  }));

  const lines: string[] = [
    "<!DOCTYPE NETSCAPE-Bookmark-file-1>",
    "<!-- This is an automatically generated file.",
    "     It will be read and overwritten.",
    "     DO NOT EDIT! -->",
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    "<TITLE>Bookmarks</TITLE>",
    "<H1>Bookmarks</H1>",
    "<DL><p>",
  ];

  for (const favorite of ungrouped) {
    lines.push(
      `    <DT><A HREF="${escapeHtml(favorite.url)}" ADD_DATE="0">${escapeHtml(favorite.title)}</A>`,
    );
  }

  for (const { folder, items } of byFolder) {
    lines.push(`    <DT><H3>${escapeHtml(folder.name)}</H3>`);
    lines.push("    <DL><p>");
    for (const favorite of items) {
      lines.push(
        `        <DT><A HREF="${escapeHtml(favorite.url)}" ADD_DATE="0">${escapeHtml(favorite.title)}</A>`,
      );
    }
    lines.push("    </DL><p>");
    void folderMap;
  }

  lines.push("</DL><p>");
  return lines.join("\n");
}

type ParsedBookmark = {
  title: string;
  url: string;
  folderName: string | null;
};

/** Basic Netscape HTML bookmarks import. */
export function importBookmarksHtml(html: string): ParsedBookmark[] {
  const results: ParsedBookmark[] = [];
  let currentFolder: string | null = null;
  let folderDepth = 0;

  const h3Re = /<H3[^>]*>([\s\S]*?)<\/H3>/gi;
  const aRe = /<A\s+[^>]*HREF\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/A>/gi;
  const dlOpenRe = /<DL\b[^>]*>/gi;
  const dlCloseRe = /<\/DL>/gi;

  // Tokenize roughly by walking tags in order
  const tokenRe = /<(H3)[^>]*>([\s\S]*?)<\/H3>|<(A)\s+[^>]*HREF\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/A>|<(DL)\b[^>]*>|<\/(DL)>/gi;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(html)) !== null) {
    if (match[1] === "H3") {
      currentFolder = unescapeHtml(match[2].replace(/<[^>]+>/g, "").trim()) || null;
    } else if (match[3] === "A") {
      const url = unescapeHtml(match[4].trim());
      const title = unescapeHtml(match[5].replace(/<[^>]+>/g, "").trim()) || url;
      if (url) {
        results.push({ title, url, folderName: currentFolder });
      }
    } else if (match[6] === "DL") {
      folderDepth += 1;
    } else if (match[7] === "DL") {
      folderDepth = Math.max(0, folderDepth - 1);
      if (folderDepth <= 1) currentFolder = null;
    }
  }

  // Fallback for simple lists if tokenizer found nothing
  if (results.length === 0) {
    void h3Re;
    void aRe;
    void dlOpenRe;
    void dlCloseRe;
    const simpleA = /<A\s+[^>]*HREF\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/A>/gi;
    let simple: RegExpExecArray | null;
    while ((simple = simpleA.exec(html)) !== null) {
      results.push({
        title: unescapeHtml(simple[2].replace(/<[^>]+>/g, "").trim()) || simple[1],
        url: unescapeHtml(simple[1].trim()),
        folderName: null,
      });
    }
  }

  return results;
}
