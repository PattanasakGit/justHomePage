import { beforeEach, describe, expect, it } from "vitest";
import { createHomeStore } from "@/stores/home-store";
import { defaultPreferences } from "@/data/defaults";

describe("home-store zone preferences", () => {
  let store: ReturnType<typeof createHomeStore>;

  beforeEach(() => {
    store = createHomeStore();
  });

  it("defaults zoneOrder to search, favorites, workspace", () => {
    expect(store.getState().preferences.zoneOrder).toEqual(["search", "favorites", "workspace"]);
  });

  it("defaults zoneVisibility to all true", () => {
    expect(store.getState().preferences.zoneVisibility).toEqual({
      search: true,
      favorites: true,
      workspace: true,
    });
  });

  it("setZoneOrder reorders zones", () => {
    store.getState().setZoneOrder(["workspace", "search", "favorites"]);
    expect(store.getState().preferences.zoneOrder).toEqual([
      "workspace",
      "search",
      "favorites",
    ]);
  });

  it("setZoneVisible toggles a zone's visibility", () => {
    store.getState().setZoneVisible("search", false);
    expect(store.getState().preferences.zoneVisibility.search).toBe(false);
    expect(store.getState().preferences.zoneVisibility.favorites).toBe(true);
  });

  it("reorderZones moves an active id over an over id", () => {
    store.getState().reorderZones("zone-workspace", "zone-search");
    expect(store.getState().preferences.zoneOrder).toEqual([
      "workspace",
      "search",
      "favorites",
    ]);
  });

  it("resetZones restores default order and visibility", () => {
    store.getState().setZoneOrder(["workspace", "search", "favorites"]);
    store.getState().setZoneVisible("search", false);
    store.getState().resetZones();
    expect(store.getState().preferences.zoneOrder).toEqual(
      defaultPreferences.zoneOrder,
    );
    expect(store.getState().preferences.zoneVisibility).toEqual(
      defaultPreferences.zoneVisibility,
    );
  });
});
