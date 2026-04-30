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
    });
  });
});
