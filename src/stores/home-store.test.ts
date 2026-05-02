import { describe, expect, it } from "vitest";
import { createHomeStore, migrateHomeState } from "./home-store";
import { getWidgetMeta } from "@/components/widgets/widget-registry";
import type { FavoriteFolder, HomeWidget, WidgetType } from "@/lib/types";

function rectOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

describe("home store", () => {
  it("adds and removes favorites", () => {
    const store = createHomeStore();
    store.getState().addFavorite({ title: "Docs", url: "https://docs.example.com", icon: "sparkles" });
    const favorite = store.getState().favorites.find((item) => item.title === "Docs");
    expect(favorite?.type).toBe("link");
    expect(favorite?.type === "link" ? favorite.url : null).toBe("https://docs.example.com");
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
      type: "link",
      id: favorite.id,
      title: "Edited",
      url: "https://edited.example.com",
      icon: "github",
    });
  });

  it("migrates flat favorites into root link items with stable ids", () => {
    const next = migrateHomeState(
      {
        favorites: [{ id: "fav-docs", title: "Docs", url: "https://docs.example.com", icon: "fi-bookmark" }],
      },
      7,
    );
    expect(next.favorites[0]).toMatchObject({
      type: "link",
      id: "fav-docs",
      title: "Docs",
      url: "https://docs.example.com",
    });
  });

  it("adds folders and nested links by parent folder id", () => {
    const store = createHomeStore();
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work");
    expect(folder).toMatchObject({ type: "folder", children: [] });

    store.getState().addFavoriteToFolder(folder!.id, {
      title: "Docs",
      url: "https://docs.example.com",
      icon: "fi-bookmark",
    });

    const updated = store.getState().favorites.find((item) => item.id === folder!.id);
    expect(updated).toMatchObject({
      type: "folder",
      children: [expect.objectContaining({ type: "link", title: "Docs" })],
    });
  });

  it("removes folders with nested children", () => {
    const store = createHomeStore();
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work")!;
    store.getState().addFavoriteToFolder(folder.id, {
      title: "Docs",
      url: "https://docs.example.com",
      icon: "fi-bookmark",
    });
    store.getState().removeFavorite(folder.id);
    expect(store.getState().favorites.some((item) => item.id === folder.id)).toBe(false);
  });

  it("reorders favorites only within the same parent", () => {
    const store = createHomeStore();
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work")!;
    store.getState().addFavoriteToFolder(folder.id, { title: "A", url: "https://a.example.com", icon: "fi-bookmark" });
    store.getState().addFavoriteToFolder(folder.id, { title: "B", url: "https://b.example.com", icon: "fi-bookmark" });
    const nested = (store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder).children;
    store.getState().reorderFavorites(nested[1].id, nested[0].id, folder.id);
    const after = (store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder).children;
    expect(after.map((item) => item.title)).toEqual(["B", "A"]);
  });

  it("moves an existing root favorite into a folder", () => {
    const store = createHomeStore();
    store.getState().addFavorite({ title: "Docs", url: "https://docs.example.com", icon: "fi-bookmark" });
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const docs = store.getState().favorites.find((item) => item.title === "Docs")!;
    const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work") as FavoriteFolder;

    store.getState().moveFavoriteItem(docs.id, folder.id);

    const rootTitles = store.getState().favorites.map((item) => item.title);
    const updatedFolder = store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder;
    expect(rootTitles).not.toContain("Docs");
    expect(updatedFolder.children.map((item) => item.title)).toContain("Docs");
  });

  it("moves an existing nested favorite back to the root", () => {
    const store = createHomeStore();
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const folder = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work") as FavoriteFolder;
    store.getState().addFavoriteToFolder(folder.id, { title: "Docs", url: "https://docs.example.com", icon: "fi-bookmark" });
    const nested = (store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder).children[0];

    store.getState().moveFavoriteItem(nested.id, null);

    const updatedFolder = store.getState().favorites.find((item) => item.id === folder.id) as FavoriteFolder;
    expect(updatedFolder.children).toHaveLength(0);
    expect(store.getState().favorites.map((item) => item.title)).toContain("Docs");
  });

  it("does not move a folder into one of its own descendants", () => {
    const store = createHomeStore();
    store.getState().addFavoriteFolder(null, { title: "Work", icon: "fi-folder" });
    const work = store.getState().favorites.find((item) => item.type === "folder" && item.title === "Work") as FavoriteFolder;
    store.getState().addFavoriteFolder(work.id, { title: "AI", icon: "fi-folder" });
    const ai = (store.getState().favorites.find((item) => item.id === work.id) as FavoriteFolder).children[0] as FavoriteFolder;

    store.getState().moveFavoriteItem(work.id, ai.id);

    const after = store.getState().favorites.find((item) => item.id === work.id) as FavoriteFolder;
    expect(after).toBeDefined();
    expect(after.children[0].id).toBe(ai.id);
  });

  it("setVariant switches the widget's variant and layout dimensions", () => {
    const store = createHomeStore();
    const clock = store.getState().widgets.find((w) => w.type === "clock")!;
    store.getState().setVariant(clock.id, "clock-banner");
    const updated = store.getState().widgets.find((w) => w.id === clock.id)!;
    expect(updated.variant).toBe("clock-banner");
    expect(updated.layout.w).toBe(4);
    expect(updated.layout.h).toBe(1);
  });

  it("setVariant rejects unknown ids", () => {
    const store = createHomeStore();
    const clock = store.getState().widgets.find((w) => w.type === "clock")!;
    const before = clock.variant;
    store.getState().setVariant(clock.id, "not-a-variant");
    expect(store.getState().widgets.find((w) => w.id === clock.id)!.variant).toBe(before);
  });

  it("setLayout writes free-placement coords", () => {
    const store = createHomeStore();
    const clock = store.getState().widgets.find((w) => w.type === "clock")!;
    store.getState().setLayout(clock.id, { x: 5, y: 3, w: 3, h: 2 });
    expect(store.getState().widgets.find((w) => w.id === clock.id)!.layout).toEqual({
      x: 5,
      y: 3,
      w: 3,
      h: 2,
    });
  });

  it("compactWidgets removes vertical gaps but preserves x", () => {
    const store = createHomeStore();
    // Seed widgets at non-trivial positions
    const ids = store.getState().widgets.map((w) => w.id);
    store.getState().setLayout(ids[0], { x: 0, y: 5, w: 2, h: 2 });
    store.getState().setLayout(ids[1], { x: 2, y: 9, w: 2, h: 2 });
    store.getState().compactWidgets();
    const widgets = store.getState().widgets;
    // First widget should rest at y=0
    expect(widgets[0].layout.y).toBe(0);
    // Second widget x preserved
    expect(widgets[1].layout.x).toBe(2);
    expect(widgets[1].layout.y).toBe(0);
  });

  it("addWidget first-fits a placement that does not overlap existing", () => {
    const store = createHomeStore();
    store.getState().addWidget("pomodoro");
    const widgets = store.getState().widgets;
    for (let i = 0; i < widgets.length; i++) {
      for (let j = i + 1; j < widgets.length; j++) {
        expect(rectOverlap(widgets[i].layout, widgets[j].layout)).toBe(false);
      }
    }
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

  it("migrates v6 legacy sizes to v7 variants per the spec table", () => {
    const persisted = {
      widgets: [
        { id: "w-clock", type: "clock", title: "Clock", size: "compact", config: {} },
        { id: "w-notes", type: "notes", title: "Note", size: "wide", config: { body: "" } },
        { id: "w-todo", type: "todo", title: "Today", size: "regular", config: { items: [] } },
        { id: "w-pomo", type: "pomodoro", title: "Focus", size: "wide", config: { focusMinutes: 25, breakMinutes: 5 } },
        { id: "w-bookmark", type: "bookmark", title: "Pinned", size: "hero", config: { url: "", caption: "", thumbnail: null } },
      ],
    };
    const next = migrateHomeState(persisted, 6) as { widgets: HomeWidget[] };
    const byId = (id: string) => next.widgets.find((w) => w.id === id)!;
    expect(byId("w-clock").variant).toBe("clock-square");
    expect(byId("w-clock").layout).toMatchObject({ w: 2, h: 2 });
    expect(byId("w-notes").variant).toBe("notes-strip");
    expect(byId("w-notes").layout).toMatchObject({ w: 6, h: 2 });
    expect(byId("w-todo").variant).toBe("todo-list");
    expect(byId("w-pomo").variant).toBe("pomo-wide");
    expect(byId("w-pomo").layout).toMatchObject({ w: 6, h: 3 });
    expect(byId("w-bookmark").variant).toBe("bookmark-banner");
  });

  it("migration auto-packs to remove overlaps", () => {
    const persisted = {
      widgets: [
        { id: "w1", type: "notes", title: "N", size: "wide", config: { body: "" } },
        { id: "w2", type: "notes", title: "M", size: "wide", config: { body: "" } },
      ],
    };
    const next = migrateHomeState(persisted, 6) as { widgets: HomeWidget[] };
    const [a, b] = next.widgets;
    expect(rectOverlap(a.layout, b.layout)).toBe(false);
  });

  it("migration backfills missing layout for v7+ widgets", () => {
    const persisted = {
      widgets: [
        {
          id: "w1",
          type: "clock" as WidgetType,
          title: "Clock",
          variant: "clock-square",
          config: {},
        },
      ],
    };
    const next = migrateHomeState(persisted, 7) as { widgets: HomeWidget[] };
    expect(next.widgets[0].layout).toBeDefined();
    expect(next.widgets[0].layout.w).toBe(2);
  });

  it("migration falls back to defaults for unknown legacy size", () => {
    const persisted = {
      widgets: [{ id: "w1", type: "clock", title: "Clock", size: "alien", config: {} }],
    };
    const next = migrateHomeState(persisted, 5) as { widgets: HomeWidget[] };
    const meta = getWidgetMeta("clock");
    expect(next.widgets[0].variant).toBe(meta.defaultVariant);
  });

  it("moveWidgetUp swaps a widget with the previous in sm-stack order (sorted by y, then x)", () => {
    const store = createHomeStore();
    // Re-seed every default widget into a clean vertical stack so y-order is
    // unambiguous, then move the middle one up.
    const widgets = store.getState().widgets;
    widgets.forEach((widget, i) => {
      store.getState().setLayout(widget.id, { x: 0, y: i * 2, w: 2, h: 2 });
    });
    const ids = widgets.map((w) => w.id);
    store.getState().moveWidgetUp(ids[2]);
    const after = store.getState().widgets;
    const second = after.find((w) => w.id === ids[1])!;
    const third = after.find((w) => w.id === ids[2])!;
    expect(third.layout.y).toBe(2);
    expect(second.layout.y).toBe(4);
  });

  it("moveWidgetUp on the topmost widget is a no-op", () => {
    const store = createHomeStore();
    const widgets = store.getState().widgets;
    widgets.forEach((widget, i) => {
      store.getState().setLayout(widget.id, { x: 0, y: i * 2, w: 2, h: 2 });
    });
    const topId = widgets[0].id;
    store.getState().moveWidgetUp(topId);
    expect(store.getState().widgets.find((w) => w.id === topId)!.layout.y).toBe(0);
  });

  it("moveWidgetDown swaps a widget with the next in sm-stack order", () => {
    const store = createHomeStore();
    const widgets = store.getState().widgets;
    widgets.forEach((widget, i) => {
      store.getState().setLayout(widget.id, { x: 0, y: i * 2, w: 2, h: 2 });
    });
    const ids = widgets.map((w) => w.id);
    store.getState().moveWidgetDown(ids[1]);
    const after = store.getState().widgets;
    const second = after.find((w) => w.id === ids[1])!;
    const third = after.find((w) => w.id === ids[2])!;
    expect(second.layout.y).toBe(4);
    expect(third.layout.y).toBe(2);
  });

  it("moveWidgetDown on the bottom widget is a no-op", () => {
    const store = createHomeStore();
    const widgets = store.getState().widgets;
    widgets.forEach((widget, i) => {
      store.getState().setLayout(widget.id, { x: 0, y: i * 2, w: 2, h: 2 });
    });
    const lastId = widgets[widgets.length - 1].id;
    const lastY = (widgets.length - 1) * 2;
    store.getState().moveWidgetDown(lastId);
    expect(store.getState().widgets.find((w) => w.id === lastId)!.layout.y).toBe(lastY);
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
