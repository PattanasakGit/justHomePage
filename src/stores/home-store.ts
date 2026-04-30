"use client";

import { arrayMove } from "@dnd-kit/sortable";
import type { StateCreator } from "zustand";
import { createStore } from "zustand/vanilla";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultFavorites, defaultPreferences, defaultWidgets } from "@/data/defaults";
import type {
  BackgroundId,
  Favorite,
  FavoriteInput,
  FontId,
  HomeWidget,
  Preferences,
  SearchProviderId,
  WidgetSize,
  WidgetType,
} from "@/lib/types";

export type HomeState = {
  favorites: Favorite[];
  widgets: HomeWidget[];
  preferences: Preferences;
  addFavorite: (favorite: FavoriteInput) => void;
  updateFavorite: (id: string, favorite: FavoriteInput) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (activeId: string, overId: string) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  updateWidgetConfig: (id: string, config: Record<string, string>) => void;
  reorderWidgets: (activeId: string, overId: string) => void;
  setSearchProvider: (provider: SearchProviderId) => void;
  setTheme: (theme: BackgroundId) => void;
  setWallpaperImage: (wallpaperImage: string | null) => void;
  setFont: (font: FontId) => void;
  setThemeControls: (controls: Partial<Pick<Preferences, "accentColor" | "uiOpacity" | "blur" | "contrast" | "favoriteScale" | "widgetScale">>) => void;
  setEditMode: (editMode: boolean) => void;
};

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const widgetTitles: Record<WidgetType, string> = {
  clock: "Clock",
  date: "Date",
  notes: "Note",
  quickLinks: "Quick links",
};

const createHomeState: StateCreator<HomeState> = (set) => ({
  favorites: defaultFavorites,
  widgets: defaultWidgets,
  preferences: defaultPreferences,
  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [...state.favorites, { ...favorite, id: makeId("fav") }],
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
  setTheme: (theme) => set((state) => ({ preferences: { ...state.preferences, theme } })),
  setWallpaperImage: (wallpaperImage) =>
    set((state) => ({ preferences: { ...state.preferences, wallpaperImage } })),
  setFont: (font) => set((state) => ({ preferences: { ...state.preferences, font } })),
  setThemeControls: (controls) => set((state) => ({ preferences: { ...state.preferences, ...controls } })),
  setEditMode: (editMode) => set((state) => ({ preferences: { ...state.preferences, editMode } })),
});

export function createHomeStore() {
  return createStore<HomeState>()(createHomeState);
}

export const useHomeStore = create<HomeState>()(
  persist(createHomeState, {
    name: "justhomepage:v1",
    version: 3,
    migrate: (persisted) => {
      const state = persisted as Partial<HomeState> & {
        preferences?: Partial<Preferences> & {
          background?: BackgroundId;
          backgroundImage?: string | null;
        };
      };
      if (!state.preferences) return persisted as HomeState;

      return {
        ...state,
        preferences: {
          ...defaultPreferences,
          ...state.preferences,
          theme: state.preferences.theme ?? state.preferences.background ?? defaultPreferences.theme,
          wallpaperImage:
            state.preferences.wallpaperImage ?? state.preferences.backgroundImage ?? defaultPreferences.wallpaperImage,
          font: state.preferences.font ?? defaultPreferences.font,
          accentColor: state.preferences.accentColor ?? defaultPreferences.accentColor,
          uiOpacity: state.preferences.uiOpacity ?? defaultPreferences.uiOpacity,
          blur: state.preferences.blur ?? defaultPreferences.blur,
          contrast: state.preferences.contrast ?? defaultPreferences.contrast,
          favoriteScale: state.preferences.favoriteScale ?? defaultPreferences.favoriteScale,
          widgetScale: state.preferences.widgetScale ?? defaultPreferences.widgetScale,
        },
      } as HomeState;
    },
    partialize: (state) => ({
      favorites: state.favorites,
      widgets: state.widgets,
      preferences: state.preferences,
    }),
  }),
);
