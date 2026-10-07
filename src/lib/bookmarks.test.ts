import { describe, expect, it } from "vitest";
import { exportBookmarksHtml, importBookmarksHtml } from "./bookmarks";

describe("bookmarks import/export", () => {
  it("exports favorites and folders as netscape HTML", () => {
    const html = exportBookmarksHtml({
      folders: [{ id: "folder-work", name: "Work" }],
      favorites: [
        { id: "fav-1", title: "GitHub", url: "https://github.com", icon: "github", folderId: null },
        { id: "fav-2", title: "Linear", url: "https://linear.app", icon: "letter", folderId: "folder-work" },
      ],
    });

    expect(html).toContain("NETSCAPE-Bookmark-file-1");
    expect(html).toContain("GitHub");
    expect(html).toContain("https://github.com");
    expect(html).toContain("<H3>Work</H3>");
    expect(html).toContain("https://linear.app");
  });

  it("imports bookmarks and folder names from netscape HTML", () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="https://github.com">GitHub</A>
    <DT><H3>Work</H3>
    <DL><p>
        <DT><A HREF="https://linear.app">Linear</A>
    </DL><p>
</DL><p>`;

    const parsed = importBookmarksHtml(html);
    expect(parsed).toEqual([
      { title: "GitHub", url: "https://github.com", folderName: null },
      { title: "Linear", url: "https://linear.app", folderName: "Work" },
    ]);
  });

  it("round-trips export then import", () => {
    const html = exportBookmarksHtml({
      folders: [{ id: "folder-learn", name: "Learn" }],
      favorites: [
        { id: "a", title: "Docs", url: "https://docs.example.com", icon: "letter", folderId: "folder-learn" },
      ],
    });
    const parsed = importBookmarksHtml(html);
    expect(parsed).toContainEqual({
      title: "Docs",
      url: "https://docs.example.com",
      folderName: "Learn",
    });
  });
});
