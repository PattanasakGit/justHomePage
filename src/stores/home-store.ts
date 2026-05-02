"use client";

import { arrayMove } from "@dnd-kit/sortable";
import type { StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultFavorites, defaultPreferences, defaultWidgets } from "@/data/defaults";
import {
  getWidgetMeta,
  legacySizeToVariantSpec,
  resolveVariant,
} from "@/components/widgets/widget-registry";
import type {
  BackgroundId,
  Favorite,
  FavoriteFolder,
  FavoriteFolderInput,
  FavoriteItem,
  FavoriteInput,
  FontId,
  HomeWidget,
  Preferences,
  SearchProviderId,
  WidgetLayout,
  WidgetType,
  ZoneId,
} from "@/lib/types";

const GRID_COLS = 12;

export type HomeState = {
  favorites: FavoriteItem[];
  widgets: HomeWidget[];
  preferences: Preferences;
  addFavorite: (favorite: FavoriteInput) => void;
  addFavoriteToFolder: (parentId: string | null, favorite: FavoriteInput) => void;
  addFavoriteFolder: (parentId: string | null, folder: FavoriteFolderInput) => void;
  updateFavorite: (id: string, favorite: FavoriteInput) => void;
  updateFavoriteFolder: (id: string, folder: FavoriteFolderInput) => void;
  removeFavorite: (id: string) => void;
  moveFavoriteItem: (id: string, targetParentId: string | null) => void;
  reorderFavorites: (activeId: string, overId: string, parentId?: string | null) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  setVariant: (id: string, variant: string) => void;
  setLayout: (id: string, layout: WidgetLayout) => void;
  setLayouts: (next: Array<{ id: string; layout: WidgetLayout }>) => void;
  compactWidgets: () => void;
  updateWidgetConfig: (id: string, config: Record<string, unknown>) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  moveWidgetUp: (id: string) => void;
  moveWidgetDown: (id: string) => void;
  setSearchProvider: (provider: SearchProviderId) => void;
  setTheme: (theme: BackgroundId) => void;
  setWallpaperImage: (wallpaperImage: string | null, wallpaperLuminance?: number | null) => void;
  setFont: (font: FontId) => void;
  setThemeControls: (controls: Partial<Pick<Preferences, "accentColor" | "uiOpacity" | "blur" | "contrast" | "favoriteScale" | "widgetScale">>) => void;
  setEditMode: (editMode: boolean) => void;
  setZoneOrder: (order: ZoneId[]) => void;
  setZoneVisible: (zone: ZoneId, visible: boolean) => void;
  reorderZones: (activeId: string, overId: string) => void;
  resetZones: () => void;
};

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function createFavoriteLink(favorite: FavoriteInput): Favorite {
  return {
    type: "link",
    id: makeId("fav"),
    title: favorite.title,
    url: favorite.url,
    icon: favorite.icon,
    iconUrl: favorite.iconUrl ?? null,
  };
}

function createFavoriteFolder(folder: FavoriteFolderInput): FavoriteFolder {
  return {
    type: "folder",
    id: makeId("folder"),
    title: folder.title,
    icon: folder.icon,
    iconUrl: folder.iconUrl ?? null,
    children: folder.children ?? [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeFavoriteItem(item: unknown): FavoriteItem | null {
  if (!isRecord(item)) return null;
  const id = typeof item.id === "string" ? item.id : makeId("fav");
  const title = typeof item.title === "string" ? item.title : "Untitled";
  const icon = typeof item.icon === "string" ? item.icon : "fi-bookmark";
  const iconUrl = typeof item.iconUrl === "string" ? item.iconUrl : null;
  if (item.type === "folder") {
    const children = Array.isArray(item.children)
      ? item.children.flatMap((child) => {
          const normalized = normalizeFavoriteItem(child);
          return normalized ? [normalized] : [];
        })
      : [];
    return { type: "folder", id, title, icon, iconUrl, children };
  }

  const url = typeof item.url === "string" ? item.url : "";
  return { type: "link", id, title, url, icon, iconUrl };
}

function normalizeFavorites(items: unknown): FavoriteItem[] {
  if (!Array.isArray(items)) return defaultFavorites;
  return items.flatMap((item) => {
    const normalized = normalizeFavoriteItem(item);
    return normalized ? [normalized] : [];
  });
}

function appendFavorite(items: FavoriteItem[], parentId: string | null, next: FavoriteItem): FavoriteItem[] {
  if (!parentId) return [...items, next];
  return items.map((item) => {
    if (item.type !== "folder") return item;
    if (item.id === parentId) return { ...item, children: [...item.children, next] };
    return { ...item, children: appendFavorite(item.children, parentId, next) };
  });
}

function updateFavoriteLink(items: FavoriteItem[], id: string, favorite: FavoriteInput): FavoriteItem[] {
  return items.map((item) => {
    if (item.type === "folder") return { ...item, children: updateFavoriteLink(item.children, id, favorite) };
    return item.id === id
      ? { ...item, title: favorite.title, url: favorite.url, icon: favorite.icon, iconUrl: favorite.iconUrl ?? null }
      : item;
  });
}

function updateFolder(items: FavoriteItem[], id: string, folder: FavoriteFolderInput): FavoriteItem[] {
  return items.map((item) => {
    if (item.type !== "folder") return item;
    if (item.id === id) {
      return { ...item, title: folder.title, icon: folder.icon, iconUrl: folder.iconUrl ?? null };
    }
    return { ...item, children: updateFolder(item.children, id, folder) };
  });
}

function removeFavoriteItem(items: FavoriteItem[], id: string): FavoriteItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => (item.type === "folder" ? { ...item, children: removeFavoriteItem(item.children, id) } : item));
}

function findFavoriteItemInTree(items: FavoriteItem[], id: string | null): FavoriteItem | null {
  if (!id) return null;
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === "folder") {
      const found = findFavoriteItemInTree(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function folderContainsItem(folder: FavoriteFolder, id: string): boolean {
  return folder.children.some((child) => child.id === id || (child.type === "folder" && folderContainsItem(child, id)));
}

function extractFavoriteItem(items: FavoriteItem[], id: string): { items: FavoriteItem[]; extracted: FavoriteItem | null } {
  let extracted: FavoriteItem | null = null;
  const nextItems = items.flatMap((item): FavoriteItem[] => {
    if (item.id === id) {
      extracted = item;
      return [];
    }
    if (item.type === "folder") {
      const result = extractFavoriteItem(item.children, id);
      if (result.extracted) {
        extracted = result.extracted;
        return [{ ...item, children: result.items }];
      }
    }
    return [item];
  });
  return { items: nextItems, extracted };
}

function moveFavoriteItemInTree(items: FavoriteItem[], id: string, targetParentId: string | null): FavoriteItem[] {
  if (id === targetParentId) return items;
  const moving = findFavoriteItemInTree(items, id);
  if (!moving) return items;
  const target = targetParentId ? findFavoriteItemInTree(items, targetParentId) : null;
  if (targetParentId && target?.type !== "folder") return items;
  if (moving.type === "folder" && targetParentId && folderContainsItem(moving, targetParentId)) return items;

  const extracted = extractFavoriteItem(items, id);
  if (!extracted.extracted) return items;
  return appendFavorite(extracted.items, targetParentId, extracted.extracted);
}

function reorderFavoriteItems(
  items: FavoriteItem[],
  activeId: string,
  overId: string,
  parentId: string | null,
): FavoriteItem[] {
  if (!parentId) {
    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);
    return oldIndex < 0 || newIndex < 0 ? items : arrayMove(items, oldIndex, newIndex);
  }

  return items.map((item) => {
    if (item.type !== "folder") return item;
    if (item.id === parentId) {
      const oldIndex = item.children.findIndex((child) => child.id === activeId);
      const newIndex = item.children.findIndex((child) => child.id === overId);
      return oldIndex < 0 || newIndex < 0 ? item : { ...item, children: arrayMove(item.children, oldIndex, newIndex) };
    }
    return { ...item, children: reorderFavoriteItems(item.children, activeId, overId, parentId) };
  });
}

function rectsOverlap(a: WidgetLayout, b: WidgetLayout): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

/** First-fit top-left placement on the 12-col grid (left→right, top→bottom). */
function firstFitPlacement(occupied: WidgetLayout[], w: number, h: number, cols = GRID_COLS): { x: number; y: number } {
  const width = Math.min(Math.max(1, w), cols);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x + width <= cols; x++) {
      const candidate: WidgetLayout = { x, y, w: width, h };
      if (!occupied.some((o) => rectsOverlap(o, candidate))) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 };
}

/** Vertically compact: keep ordering & x; pack each widget upward. */
function compactLayouts(widgets: HomeWidget[]): HomeWidget[] {
  const placed: WidgetLayout[] = [];
  return widgets.map((widget) => {
    const w = Math.min(widget.layout.w, GRID_COLS);
    const x = Math.min(widget.layout.x, GRID_COLS - w);
    let y = 0;
    while (placed.some((p) => rectsOverlap(p, { x, y, w, h: widget.layout.h }))) y++;
    const next: WidgetLayout = { x, y, w, h: widget.layout.h };
    placed.push(next);
    return { ...widget, layout: next };
  });
}

/**
 * Auto-pack: walk widgets in array order; place each at the lowest free `(x, y)`.
 * Preserves array order which mirrors the user's vertical reading order.
 */
function autoPack(widgets: HomeWidget[]): HomeWidget[] {
  const placed: WidgetLayout[] = [];
  return widgets.map((widget) => {
    const w = Math.min(widget.layout.w, GRID_COLS);
    const h = Math.max(1, widget.layout.h);
    const { x, y } = firstFitPlacement(placed, w, h);
    const next: WidgetLayout = { x, y, w, h };
    placed.push(next);
    return { ...widget, layout: next };
  });
}

const createHomeState: StateCreator<HomeState> = (set) => ({
  favorites: defaultFavorites,
  widgets: defaultWidgets,
  preferences: defaultPreferences,
  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [...state.favorites, createFavoriteLink(favorite)],
    })),
  addFavoriteToFolder: (parentId, favorite) =>
    set((state) => ({
      favorites: appendFavorite(state.favorites, parentId, createFavoriteLink(favorite)),
    })),
  addFavoriteFolder: (parentId, folder) =>
    set((state) => ({
      favorites: appendFavorite(state.favorites, parentId, createFavoriteFolder(folder)),
    })),
  updateFavorite: (id, favorite) =>
    set((state) => ({
      favorites: updateFavoriteLink(state.favorites, id, favorite),
    })),
  updateFavoriteFolder: (id, folder) =>
    set((state) => ({
      favorites: updateFolder(state.favorites, id, folder),
    })),
  removeFavorite: (id) =>
    set((state) => ({
      favorites: removeFavoriteItem(state.favorites, id),
    })),
  moveFavoriteItem: (id, targetParentId) =>
    set((state) => ({
      favorites: moveFavoriteItemInTree(state.favorites, id, targetParentId),
    })),
  reorderFavorites: (activeId, overId, parentId = null) =>
    set((state) => ({ favorites: reorderFavoriteItems(state.favorites, activeId, overId, parentId) })),
  addWidget: (type) =>
    set((state) => {
      const meta = getWidgetMeta(type);
      const variant = meta.variants.find((v) => v.id === meta.defaultVariant) ?? meta.variants[0];
      const occupied = state.widgets.map((w) => w.layout);
      const { x, y } = firstFitPlacement(occupied, variant.w, variant.h);
      return {
        widgets: [
          ...state.widgets,
          {
            id: makeId("widget"),
            type,
            title: meta.defaultTitle,
            variant: variant.id,
            layout: { x, y, w: variant.w, h: variant.h },
            config: { ...meta.defaultConfig },
          },
        ],
      };
    }),
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((widget) => widget.id !== id),
    })),
  setVariant: (id, variantId) =>
    set((state) => ({
      widgets: state.widgets.map((widget) => {
        if (widget.id !== id) return widget;
        const meta = getWidgetMeta(widget.type);
        const found = meta.variants.find((v) => v.id === variantId);
        if (!found) {
          if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.warn(`[home-store] setVariant rejected: ${widget.type} has no variant "${variantId}"`);
          }
          return widget;
        }
        // Clamp x so the new size still fits the grid.
        const x = Math.min(widget.layout.x, GRID_COLS - found.w);
        return {
          ...widget,
          variant: found.id,
          layout: { ...widget.layout, x: Math.max(0, x), w: found.w, h: found.h },
        };
      }),
    })),
  setLayout: (id, layout) =>
    set((state) => ({
      widgets: state.widgets.map((widget) => (widget.id === id ? { ...widget, layout } : widget)),
    })),
  setLayouts: (next) =>
    set((state) => {
      const map = new Map(next.map((entry) => [entry.id, entry.layout] as const));
      return {
        widgets: state.widgets.map((widget) => {
          const layout = map.get(widget.id);
          return layout ? { ...widget, layout } : widget;
        }),
      };
    }),
  compactWidgets: () =>
    set((state) => ({ widgets: compactLayouts(state.widgets) })),
  updateWidgetConfig: (id, config) =>
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === id ? { ...widget, config: { ...widget.config, ...config } } : widget,
      ),
    })),
  reorderWidgets: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.widgets.findIndex((item) => item.id === activeId);
      const newIndex = state.widgets.findIndex((item) => item.id === overId);
      return oldIndex < 0 || newIndex < 0 ? state : { widgets: arrayMove(state.widgets, oldIndex, newIndex) };
    }),
  moveWidgetUp: (id) =>
    set((state) => {
      // sm-stack order: sort widgets by (y, then x).
      const order = [...state.widgets].sort((a, b) =>
        a.layout.y === b.layout.y ? a.layout.x - b.layout.x : a.layout.y - b.layout.y,
      );
      const idx = order.findIndex((w) => w.id === id);
      if (idx <= 0) return state;
      const target = order[idx];
      const prev = order[idx - 1];
      return {
        widgets: state.widgets.map((widget) => {
          if (widget.id === target.id) return { ...widget, layout: { ...widget.layout, y: prev.layout.y } };
          if (widget.id === prev.id) return { ...widget, layout: { ...widget.layout, y: target.layout.y } };
          return widget;
        }),
      };
    }),
  moveWidgetDown: (id) =>
    set((state) => {
      const order = [...state.widgets].sort((a, b) =>
        a.layout.y === b.layout.y ? a.layout.x - b.layout.x : a.layout.y - b.layout.y,
      );
      const idx = order.findIndex((w) => w.id === id);
      if (idx < 0 || idx >= order.length - 1) return state;
      const target = order[idx];
      const next = order[idx + 1];
      return {
        widgets: state.widgets.map((widget) => {
          if (widget.id === target.id) return { ...widget, layout: { ...widget.layout, y: next.layout.y } };
          if (widget.id === next.id) return { ...widget, layout: { ...widget.layout, y: target.layout.y } };
          return widget;
        }),
      };
    }),
  setSearchProvider: (searchProvider) =>
    set((state) => ({ preferences: { ...state.preferences, searchProvider } })),
  setTheme: (theme) => set((state) => ({ preferences: { ...state.preferences, theme } })),
  setWallpaperImage: (wallpaperImage, wallpaperLuminance = null) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        wallpaperImage,
        wallpaperLuminance: wallpaperImage ? wallpaperLuminance : null,
      },
    })),
  setFont: (font) => set((state) => ({ preferences: { ...state.preferences, font } })),
  setThemeControls: (controls) => set((state) => ({ preferences: { ...state.preferences, ...controls } })),
  setEditMode: (editMode) => set((state) => ({ preferences: { ...state.preferences, editMode } })),
  setZoneOrder: (order) =>
    set((state) => ({ preferences: { ...state.preferences, zoneOrder: order } })),
  setZoneVisible: (zone, visible) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        zoneVisibility: { ...state.preferences.zoneVisibility, [zone]: visible },
      },
    })),
  reorderZones: (activeId, overId) =>
    set((state) => {
      const stripPrefix = (id: string) => (id.startsWith("zone-") ? id.slice(5) : id) as ZoneId;
      const active = stripPrefix(activeId);
      const over = stripPrefix(overId);
      const oldIndex = state.preferences.zoneOrder.indexOf(active);
      const newIndex = state.preferences.zoneOrder.indexOf(over);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return state;
      return {
        preferences: {
          ...state.preferences,
          zoneOrder: arrayMove(state.preferences.zoneOrder, oldIndex, newIndex),
        },
      };
    }),
  resetZones: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        zoneOrder: [...defaultPreferences.zoneOrder],
        zoneVisibility: { ...defaultPreferences.zoneVisibility },
      },
    })),
});

export function createHomeStore() {
  return createStore<HomeState>()(createHomeState);
}

type LegacyWidget = {
  id: string;
  type: WidgetType;
  title: string;
  size?: unknown;
  variant?: unknown;
  layout?: Partial<WidgetLayout>;
  config?: Record<string, unknown>;
};

/**
 * Pure migration used by the persist middleware.
 *
 *  - <= v6: legacy `size` (small/middle/max/compact/regular/wide/tall/hero) →
 *    v7 `{variant, w, h}` per the UX-lead spec §8 table.
 *  - >= v7: validates `variant`, backfills `layout` from the registry.
 *  - All widgets are auto-packed at the end so legacy collisions resolve to a
 *    valid free-placement layout.
 */
export function migrateHomeState(persisted: unknown, _version: number): HomeState {
  const state = persisted as Partial<HomeState> & {
    preferences?: Partial<Preferences> & {
      background?: BackgroundId;
      backgroundImage?: string | null;
      wallpaperLuminance?: number | null;
    };
    widgets?: LegacyWidget[];
    favorites?: unknown;
  };

  const rawWidgets: LegacyWidget[] = Array.isArray(state.widgets)
    ? state.widgets
    : (defaultWidgets.map((w) => ({ ...w, size: undefined })) as LegacyWidget[]);

  const upgraded: HomeWidget[] = rawWidgets.map((widget) => {
    const meta = getWidgetMeta(widget.type);
    const candidateVariantId =
      typeof widget.variant === "string" ? widget.variant : null;
    const variantSpec = candidateVariantId
      ? resolveVariant(widget.type, candidateVariantId)
      : null;

    let variantId: string;
    let w: number;
    let h: number;
    if (variantSpec) {
      variantId = variantSpec.id;
      w = variantSpec.w;
      h = variantSpec.h;
    } else {
      const mapped = legacySizeToVariantSpec(widget.type, widget.size);
      variantId = mapped.variant;
      w = mapped.w;
      h = mapped.h;
    }

    const persistedLayout = widget.layout ?? {};
    const layout: WidgetLayout = {
      x: typeof persistedLayout.x === "number" ? persistedLayout.x : 0,
      y: typeof persistedLayout.y === "number" ? persistedLayout.y : 0,
      w: typeof persistedLayout.w === "number" ? persistedLayout.w : w,
      h: typeof persistedLayout.h === "number" ? persistedLayout.h : h,
    };
    // Width must always match the variant's expected w/h after migration.
    layout.w = w;
    layout.h = h;

    return {
      id: widget.id,
      type: widget.type,
      title: widget.title ?? meta.defaultTitle,
      variant: variantId,
      layout,
      config: widget.config ?? { ...meta.defaultConfig },
    };
  });

  // Auto-pack to guarantee no overlaps post-migration.
  const widgets = autoPack(upgraded);

  const preferences: Preferences = state.preferences
    ? {
        ...defaultPreferences,
        ...state.preferences,
        theme: state.preferences.theme ?? state.preferences.background ?? defaultPreferences.theme,
        wallpaperImage:
          state.preferences.wallpaperImage ?? state.preferences.backgroundImage ?? defaultPreferences.wallpaperImage,
        wallpaperLuminance: state.preferences.wallpaperLuminance ?? defaultPreferences.wallpaperLuminance,
        font: state.preferences.font ?? defaultPreferences.font,
        accentColor: state.preferences.accentColor ?? defaultPreferences.accentColor,
        uiOpacity: state.preferences.uiOpacity ?? defaultPreferences.uiOpacity,
        blur: state.preferences.blur ?? defaultPreferences.blur,
        contrast: state.preferences.contrast ?? defaultPreferences.contrast,
        favoriteScale: state.preferences.favoriteScale ?? defaultPreferences.favoriteScale,
        widgetScale: state.preferences.widgetScale ?? defaultPreferences.widgetScale,
        zoneOrder: state.preferences.zoneOrder ?? [...defaultPreferences.zoneOrder],
        zoneVisibility: state.preferences.zoneVisibility ?? { ...defaultPreferences.zoneVisibility },
      }
    : defaultPreferences;

  return {
    ...(state as HomeState),
    favorites: normalizeFavorites(state.favorites),
    widgets,
    preferences,
  } as HomeState;
}

export const useHomeStore = create<HomeState>()(
  persist(createHomeState, {
    name: "justhomepage:v1",
    version: 8,
    migrate: (persisted, version) => migrateHomeState(persisted, version),
    partialize: (state) => ({
      favorites: state.favorites,
      widgets: state.widgets,
      preferences: state.preferences,
    }),
  }),
);
