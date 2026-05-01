import { describe, expect, it } from "vitest";
import { createHomeStore, migrateHomeState } from "./home-store";
import { getWidgetMeta } from "@/components/widgets/widget-registry";
import type { HomeWidget } from "@/lib/types";

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

  it("resizes an individual widget within its allowed sizes", () => {
    const store = createHomeStore();
    const clock = store.getState().widgets.find((widget) => widget.type === "clock");
    expect(clock).toBeDefined();

    store.getState().resizeWidget(clock!.id, "regular");

    expect(store.getState().widgets.find((widget) => widget.id === clock!.id)?.size).toBe("regular");
  });

  it("ignores resize requests outside the widget's allowed sizes", () => {
    const store = createHomeStore();
    const clock = store.getState().widgets.find((widget) => widget.type === "clock");
    expect(clock).toBeDefined();
    const before = clock!.size;

    store.getState().resizeWidget(clock!.id, "hero");

    expect(store.getState().widgets.find((widget) => widget.id === clock!.id)?.size).toBe(before);
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

  it("migrates persisted widget sizes from legacy v5 to v6", () => {
    const persisted = {
      widgets: [
        { id: "w-clock", type: "clock", title: "Clock", size: "small", config: {} },
        { id: "w-notes", type: "notes", title: "Note", size: "max", config: { body: "" } },
        { id: "w-todo", type: "todo", title: "Today", size: "middle", config: { items: [] } },
        { id: "w-pomo", type: "pomodoro", title: "Focus", size: "max", config: { focusMinutes: 25, breakMinutes: 5 } },
        { id: "w-bookmark", type: "bookmark", title: "Pinned", size: "max", config: { url: "", caption: "", thumbnail: null } },
      ],
    };

    const next = migrateHomeState(persisted, 5) as { widgets: HomeWidget[] };

    const byId = (id: string) => next.widgets.find((widget) => widget.id === id)!;
    // small -> compact, middle -> regular, max -> wide; clamped per allowedSizes
    expect(byId("w-clock").size).toBe("compact");
    // notes does not allow "wide" (max -> wide -> not allowed) -> falls back to default (tall)
    expect(byId("w-notes").size).toBe(getWidgetMeta("notes").defaultSize);
    // todo allows regular -> middle stays regular
    expect(byId("w-todo").size).toBe("regular");
    // pomodoro allows wide -> max migrates to wide
    expect(byId("w-pomo").size).toBe("wide");
    // bookmark does not allow wide -> falls back to default (compact)
    expect(byId("w-bookmark").size).toBe(getWidgetMeta("bookmark").defaultSize);
  });

  it("falls back to defaultSize when migrated value is unknown", () => {
    const persisted = {
      widgets: [
        { id: "w-clock", type: "clock", title: "Clock", size: "alien", config: {} },
      ],
    };
    const next = migrateHomeState(persisted, 5) as { widgets: HomeWidget[] };
    expect(next.widgets[0].size).toBe(getWidgetMeta("clock").defaultSize);
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
