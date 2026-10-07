import { describe, expect, it } from "vitest";
import { createHomeStore } from "./home-store";

describe("home store", () => {
  it("adds and removes favorites", () => {
    const store = createHomeStore();

    store.getState().addFavorite({ title: "Docs", url: "https://docs.example.com", icon: "sparkles" });
    const favorite = store.getState().favorites.find((item) => item.title === "Docs");

    expect(favorite?.url).toBe("https://docs.example.com");

    store.getState().removeFavorite(favorite!.id);

    expect(store.getState().favorites.some((item) => item.id === favorite!.id)).toBe(false);
  });

  it("updates favorite fields", () => {
    const store = createHomeStore();
    const favorite = store.getState().favorites[0];

    store.getState().updateFavorite(favorite.id, {
      title: "Edited",
      url: "https://edited.example.com",
      icon: "github",
      folderId: favorite.folderId ?? null,
    });

    expect(store.getState().favorites[0]).toMatchObject({
      id: favorite.id,
      title: "Edited",
      url: "https://edited.example.com",
      icon: "github",
    });
  });

  it("reorders widgets with stable ids", () => {
    const store = createHomeStore();
    const widgets = store.getState().widgets;

    store.getState().reorderWidgets(widgets[0].id, widgets[2].id);

    expect(store.getState().widgets[2].id).toBe(widgets[0].id);
  });

  it("resizes an individual widget", () => {
    const store = createHomeStore();
    const widget = store.getState().widgets[0];

    store.getState().resizeWidget(widget.id, "max");

    expect(store.getState().widgets[0].size).toBe("max");
  });

  it("updates search and theme preferences", () => {
    const store = createHomeStore();

    store.getState().setSearchProvider("github");
    store.getState().setTheme("aurora");

    expect(store.getState().preferences.searchProvider).toBe("github");
    expect(store.getState().preferences.theme).toBe("aurora");
    expect(store.getState().preferences.appearance).toBe("light");
  });

  it("stores and clears a custom wallpaper image without changing theme", () => {
    const store = createHomeStore();

    store.getState().setTheme("sky");
    store.getState().setWallpaperImage("data:image/png;base64,abc");

    expect(store.getState().preferences.theme).toBe("sky");
    expect(store.getState().preferences.wallpaperImage).toBe("data:image/png;base64,abc");

    store.getState().setWallpaperImage(null);
    expect(store.getState().preferences.theme).toBe("sky");
    expect(store.getState().preferences.wallpaperImage).toBeNull();
  });

  it("updates icon size and library sidebar preferences", () => {
    const store = createHomeStore();
    store.getState().setIconSize("xl");
    store.getState().setLibrarySidebarOpen(false);
    expect(store.getState().preferences.iconSize).toBe("xl");
    expect(store.getState().preferences.librarySidebarOpen).toBe(false);
  });

  it("updates font preference", () => {
    const store = createHomeStore();

    store.getState().setFont("rounded");

    expect(store.getState().preferences.font).toBe("rounded");
  });

  it("updates visual tuning preferences", () => {
    const store = createHomeStore();

    store.getState().setThemeControls({
      accentColor: "#4f8cff",
      uiOpacity: 72,
      blur: 18,
      contrast: "light",
      favoriteScale: "large",
      widgetScale: "compact",
    });

    expect(store.getState().preferences).toMatchObject({
      accentColor: "#4f8cff",
      uiOpacity: 72,
      blur: 18,
      contrast: "light",
      favoriteScale: "large",
      widgetScale: "compact",
      density: "comfort",
    });
  });

  it("creates renames and removes folders, clearing favorite membership", () => {
    const store = createHomeStore();
    const id = store.getState().addFolder("Side");
    expect(store.getState().folders.some((folder) => folder.id === id && folder.name === "Side")).toBe(true);

    store.getState().renameFolder(id, "Projects");
    expect(store.getState().folders.find((folder) => folder.id === id)?.name).toBe("Projects");

    const favorite = store.getState().favorites[0];
    store.getState().moveFavoriteToFolder(favorite.id, id);
    expect(store.getState().favorites.find((item) => item.id === favorite.id)?.folderId).toBe(id);

    store.getState().setActiveFolder(id);
    store.getState().removeFolder(id);
    expect(store.getState().folders.some((folder) => folder.id === id)).toBe(false);
    expect(store.getState().favorites.find((item) => item.id === favorite.id)?.folderId).toBeNull();
    expect(store.getState().preferences.activeFolderId).toBeNull();
  });

  it("filters active folder preference", () => {
    const store = createHomeStore();
    const folder = store.getState().folders[0];
    store.getState().setActiveFolder(folder.id);
    expect(store.getState().preferences.activeFolderId).toBe(folder.id);
    store.getState().setActiveFolder(null);
    expect(store.getState().preferences.activeFolderId).toBeNull();
  });

  it("imports and exports bookmarks HTML", () => {
    const store = createHomeStore();
    const before = store.getState().favorites.length;
    const result = store.getState().importBookmarks(`<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><A HREF="https://example.com">Example</A>
  <DT><H3>Imported</H3>
  <DL><p>
    <DT><A HREF="https://imported.dev">Imported Dev</A>
  </DL><p>
</DL><p>`);

    expect(result.added).toBe(2);
    expect(result.foldersCreated).toBe(1);
    expect(store.getState().favorites.length).toBe(before + 2);
    expect(store.getState().folders.some((folder) => folder.name === "Imported")).toBe(true);

    const html = store.getState().exportBookmarks();
    expect(html).toContain("NETSCAPE-Bookmark-file-1");
    expect(html).toContain("https://example.com");
    expect(html).toContain("Imported");
  });

  it("updates chrome density and contrast strength", () => {
    const store = createHomeStore();
    store.getState().setChrome("hidden");
    store.getState().setDensity("compact");
    store.getState().setContrastStrength("strong");
    store.getState().setAppearance("dark");

    expect(store.getState().preferences).toMatchObject({
      chrome: "hidden",
      density: "compact",
      favoriteScale: "compact",
      contrastStrength: "strong",
      appearance: "dark",
    });
  });
});
