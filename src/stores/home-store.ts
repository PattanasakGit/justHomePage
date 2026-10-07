"use client";

import { arrayMove } from "@dnd-kit/sortable";
import type { StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultFavorites, defaultFolders, defaultPreferences, defaultWidgets } from "@/data/defaults";
import { exportBookmarksHtml, importBookmarksHtml } from "@/lib/bookmarks";
import { DARK_THEME_IDS, getThemeDefinition } from "@/data/themes";

import type {
  Appearance,
  BackgroundId,
  ChromeVisibility,
  ContrastStrength,
  Density,
  Favorite,
  FavoriteInput,
  Folder,
  FontId,
  HomeWidget,
  Preferences,
  SearchProviderId,
  UIScale,
  WidgetSize,
  WidgetType,
} from "@/lib/types";
import { DEFAULT_ACCENT_DARK, DEFAULT_ACCENT_LIGHT } from "@/lib/types";

export type HomeState = {
  favorites: Favorite[];
  folders: Folder[];
  widgets: HomeWidget[];
  preferences: Preferences;
  addFavorite: (favorite: FavoriteInput) => void;
  updateFavorite: (id: string, favorite: FavoriteInput) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (activeId: string, overId: string) => void;
  addFolder: (name: string) => string;
  renameFolder: (id: string, name: string) => void;
  removeFolder: (id: string) => void;
  setActiveFolder: (id: string | null) => void;
  moveFavoriteToFolder: (favoriteId: string, folderId: string | null) => void;
  importBookmarks: (html: string) => { added: number; foldersCreated: number };
  exportBookmarks: () => string;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  updateWidgetConfig: (id: string, config: Record<string, string>) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  setSearchProvider: (provider: SearchProviderId) => void;
  setTheme: (theme: BackgroundId) => void;
  setAppearance: (appearance: Appearance) => void;
  setWallpaperImage: (wallpaperImage: string | null, wallpaperLuminance?: number | null) => void;
  setFont: (font: FontId) => void;
  setThemeControls: (
    controls: Partial<
      Pick<
        Preferences,
        | "accentColor"
        | "uiOpacity"
        | "blur"
        | "contrast"
        | "contrastStrength"
        | "density"
        | "chrome"
        | "favoriteScale"
        | "widgetScale"
      >
    >,
  ) => void;
  setContrastStrength: (contrastStrength: ContrastStrength) => void;
  setDensity: (density: Density) => void;
  setChrome: (chrome: ChromeVisibility) => void;
  setEditMode: (editMode: boolean) => void;
};

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const widgetTitles: Record<WidgetType, string> = {
  clock: "Clock",
  date: "Date",
  notes: "Note",
  quickLinks: "Quick links",
};

function densityFromScale(scale: UIScale | undefined): Density {
  if (scale === "large") return "comfort";
  if (scale === "compact") return "compact";
  return "cozy";
}

function scaleFromDensity(density: Density): UIScale {
  if (density === "comfort") return "large";
  if (density === "compact") return "compact";
  return "cozy";
}

const createHomeState: StateCreator<HomeState> = (set, get) => ({
  favorites: defaultFavorites,
  folders: defaultFolders,
  widgets: defaultWidgets,
  preferences: defaultPreferences,
  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [
        ...state.favorites,
        {
          ...favorite,
          id: makeId("fav"),
          folderId: favorite.folderId ?? state.preferences.activeFolderId,
        },
      ],
    })),
  updateFavorite: (id, favorite) =>
    set((state) => ({
      favorites: state.favorites.map((item) => (item.id === id ? { ...item, ...favorite } : item)),
    })),
  removeFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((favorite) => favorite.id !== id),
    })),
  reorderFavorites: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.favorites.findIndex((item) => item.id === activeId);
      const newIndex = state.favorites.findIndex((item) => item.id === overId);
      return oldIndex < 0 || newIndex < 0 ? state : { favorites: arrayMove(state.favorites, oldIndex, newIndex) };
    }),
  addFolder: (name) => {
    const id = makeId("folder");
    const trimmed = name.trim() || "Folder";
    set((state) => ({
      folders: [...state.folders, { id, name: trimmed }],
    }));
    return id;
  },
  renameFolder: (id, name) =>
    set((state) => ({
      folders: state.folders.map((folder) => (folder.id === id ? { ...folder, name: name.trim() || folder.name } : folder)),
    })),
  removeFolder: (id) =>
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      favorites: state.favorites.map((favorite) =>
        favorite.folderId === id ? { ...favorite, folderId: null } : favorite,
      ),
      preferences:
        state.preferences.activeFolderId === id
          ? { ...state.preferences, activeFolderId: null }
          : state.preferences,
    })),
  setActiveFolder: (activeFolderId) =>
    set((state) => ({ preferences: { ...state.preferences, activeFolderId } })),
  moveFavoriteToFolder: (favoriteId, folderId) =>
    set((state) => ({
      favorites: state.favorites.map((favorite) =>
        favorite.id === favoriteId ? { ...favorite, folderId } : favorite,
      ),
    })),
  importBookmarks: (html) => {
    const parsed = importBookmarksHtml(html);
    let foldersCreated = 0;
    set((state) => {
      const folders = [...state.folders];
      const folderByName = new Map(folders.map((folder) => [folder.name.toLowerCase(), folder.id]));
      const favorites = [...state.favorites];

      for (const item of parsed) {
        let folderId: string | null = null;
        if (item.folderName) {
          const key = item.folderName.toLowerCase();
          const existing = folderByName.get(key);
          if (existing) {
            folderId = existing;
          } else {
            const id = makeId("folder");
            folders.push({ id, name: item.folderName });
            folderByName.set(key, id);
            folderId = id;
            foldersCreated += 1;
          }
        }
        favorites.push({
          id: makeId("fav"),
          title: item.title,
          url: item.url,
          icon: "letter",
          iconUrl: null,
          folderId,
        });
      }

      return { folders, favorites };
    });
    return { added: parsed.length, foldersCreated };
  },
  exportBookmarks: () => {
    const { favorites, folders } = get();
    return exportBookmarksHtml({ favorites, folders });
  },
  addWidget: (type) =>
    set((state) => ({
      widgets: [
        ...state.widgets,
        {
          id: makeId("widget"),
          type,
          title: widgetTitles[type],
          size: type === "notes" ? "max" : "middle",
          config: type === "notes" ? { body: "" } : {},
        },
      ],
    })),
  removeWidget: (id) =>
    set((state) => ({
      widgets: state.widgets.filter((widget) => widget.id !== id),
    })),
  resizeWidget: (id, size) =>
    set((state) => ({
      widgets: state.widgets.map((widget) => (widget.id === id ? { ...widget, size } : widget)),
    })),
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
  setSearchProvider: (searchProvider) =>
    set((state) => ({ preferences: { ...state.preferences, searchProvider } })),
  setTheme: (theme) =>
    set((state) => {
      const def = getThemeDefinition(theme);
      const appearance = def.category;
      const accentStillValid = true;
      return {
        preferences: {
          ...state.preferences,
          theme,
          appearance,
          accentColor: accentStillValid ? state.preferences.accentColor : appearance === "dark" ? DEFAULT_ACCENT_DARK : DEFAULT_ACCENT_LIGHT,
        },
      };
    }),
  setAppearance: (appearance) =>
    set((state) => {
      const current = getThemeDefinition(state.preferences.theme);
      let theme = state.preferences.theme;
      if (current.category !== appearance) {
        theme = appearance === "dark" ? "midnight" : "linen";
      }
      const accent =
        state.preferences.accentColor === DEFAULT_ACCENT_LIGHT || state.preferences.accentColor === DEFAULT_ACCENT_DARK
          ? appearance === "dark"
            ? DEFAULT_ACCENT_DARK
            : DEFAULT_ACCENT_LIGHT
          : state.preferences.accentColor;
      return {
        preferences: {
          ...state.preferences,
          appearance,
          theme,
          accentColor: accent,
        },
      };
    }),
  setWallpaperImage: (wallpaperImage, wallpaperLuminance = null) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        wallpaperImage,
        wallpaperLuminance: wallpaperImage ? wallpaperLuminance : null,
      },
    })),
  setFont: (font) => set((state) => ({ preferences: { ...state.preferences, font } })),
  setThemeControls: (controls) =>
    set((state) => {
      const next = { ...state.preferences, ...controls };
      if (controls.density && !controls.favoriteScale) {
        next.favoriteScale = scaleFromDensity(controls.density);
      }
      if (controls.favoriteScale && !controls.density) {
        next.density = densityFromScale(controls.favoriteScale);
      }
      return { preferences: next };
    }),
  setContrastStrength: (contrastStrength) =>
    set((state) => ({ preferences: { ...state.preferences, contrastStrength } })),
  setDensity: (density) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        density,
        favoriteScale: scaleFromDensity(density),
      },
    })),
  setChrome: (chrome) => set((state) => ({ preferences: { ...state.preferences, chrome } })),
  setEditMode: (editMode) => set((state) => ({ preferences: { ...state.preferences, editMode } })),
});

export function createHomeStore() {
  return createStore<HomeState>()(createHomeState);
}

export const useHomeStore = create<HomeState>()(
  persist(createHomeState, {
    name: "justhomepage:v1",
    version: 5,
    migrate: (persisted) => {
      const state = persisted as Partial<HomeState> & {
        preferences?: Partial<Preferences> & {
          background?: BackgroundId;
          backgroundImage?: string | null;
          wallpaperLuminance?: number | null;
        };
        folders?: Folder[];
        favorites?: Favorite[];
      };
      if (!state.preferences) {
        return {
          favorites: state.favorites ?? defaultFavorites,
          folders: state.folders ?? defaultFolders,
          widgets: state.widgets ?? defaultWidgets,
          preferences: defaultPreferences,
        } as HomeState;
      }

      const theme = state.preferences.theme ?? state.preferences.background ?? defaultPreferences.theme;
      const appearance: Appearance =
        state.preferences.appearance ??
        (DARK_THEME_IDS.has(theme) ? "dark" : "light");
      const density =
        state.preferences.density ?? densityFromScale(state.preferences.favoriteScale) ?? defaultPreferences.density;

      return {
        ...state,
        favorites: (state.favorites ?? defaultFavorites).map((favorite) => ({
          ...favorite,
          folderId: favorite.folderId ?? null,
        })),
        folders: state.folders ?? defaultFolders,
        widgets: state.widgets ?? defaultWidgets,
        preferences: {
          ...defaultPreferences,
          ...state.preferences,
          theme,
          appearance,
          wallpaperImage:
            state.preferences.wallpaperImage ?? state.preferences.backgroundImage ?? defaultPreferences.wallpaperImage,
          wallpaperLuminance: state.preferences.wallpaperLuminance ?? defaultPreferences.wallpaperLuminance,
          font: state.preferences.font ?? defaultPreferences.font,
          accentColor: state.preferences.accentColor ?? (appearance === "dark" ? DEFAULT_ACCENT_DARK : DEFAULT_ACCENT_LIGHT),
          uiOpacity: state.preferences.uiOpacity ?? defaultPreferences.uiOpacity,
          blur: state.preferences.blur ?? defaultPreferences.blur,
          contrast: state.preferences.contrast ?? defaultPreferences.contrast,
          contrastStrength: state.preferences.contrastStrength ?? defaultPreferences.contrastStrength,
          density,
          chrome: state.preferences.chrome ?? defaultPreferences.chrome,
          favoriteScale: state.preferences.favoriteScale ?? scaleFromDensity(density),
          widgetScale: state.preferences.widgetScale ?? defaultPreferences.widgetScale,
          activeFolderId: state.preferences.activeFolderId ?? null,
        },
      } as HomeState;
    },
    partialize: (state) => ({
      favorites: state.favorites,
      folders: state.folders,
      widgets: state.widgets,
      preferences: state.preferences,
    }),
  }),
);
