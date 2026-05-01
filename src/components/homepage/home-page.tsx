"use client";

import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit3, FiGrid, FiMapPin, FiPlus, FiSettings, FiSun, FiX } from "react-icons/fi";
import { SearchBar } from "@/components/search/search-bar";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import { FavoriteEditor } from "@/components/homepage/favorite-editor";
import { SortableZone } from "@/components/homepage/sortable-zone";
import { WidgetFrame } from "@/components/widgets/widget-frame";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useHomeStore } from "@/stores/home-store";
import type { Favorite, FavoriteInput, WidgetType, ZoneId } from "@/lib/types";
import { useLocalEnvironment } from "@/hooks/use-local-environment";
import { buildThemeVariables, getReadableTextPair, resolveContrast } from "@/lib/theme";
import { widgetRegistry } from "@/components/widgets/widget-registry";

const widgetOptions: Array<{ type: WidgetType; label: string }> = (Object.keys(widgetRegistry) as WidgetType[]).map(
  (type) => ({ type, label: widgetRegistry[type].label }),
);

const zoneLabels: Record<ZoneId, string> = {
  search: "Search",
  favorites: "Favorites",
  workspace: "Workspace",
};

export function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [favoriteEditorOpen, setFavoriteEditorOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const favorites = useHomeStore((state) => state.favorites);
  const widgets = useHomeStore((state) => state.widgets);
  const preferences = useHomeStore((state) => state.preferences);
  const addFavorite = useHomeStore((state) => state.addFavorite);
  const updateFavorite = useHomeStore((state) => state.updateFavorite);
  const removeFavorite = useHomeStore((state) => state.removeFavorite);
  const addWidget = useHomeStore((state) => state.addWidget);
  const reorderWidgets = useHomeStore((state) => state.reorderWidgets);
  const reorderFavorites = useHomeStore((state) => state.reorderFavorites);
  const reorderZones = useHomeStore((state) => state.reorderZones);
  const setZoneVisible = useHomeStore((state) => state.setZoneVisible);
  const setEditMode = useHomeStore((state) => state.setEditMode);
  const environment = useLocalEnvironment();
  const favoriteIds = useMemo(() => favorites.map((item) => item.id), [favorites]);
  const widgetIds = useMemo(() => widgets.map((item) => item.id), [widgets]);
  const zoneSortableIds = useMemo(
    () => preferences.zoneOrder.map((zone) => `zone-${zone}`),
    [preferences.zoneOrder],
  );
  const hiddenZones = useMemo(
    () => preferences.zoneOrder.filter((zone) => !preferences.zoneVisibility[zone]),
    [preferences.zoneOrder, preferences.zoneVisibility],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    const hasWallpaper = Boolean(preferences.wallpaperImage);
    const contrast = resolveContrast(preferences.contrast, hasWallpaper, preferences.theme, preferences.wallpaperLuminance);
    const textPair = getReadableTextPair(contrast);
    document.body.className = `theme-${preferences.theme} font-${preferences.font} contrast-${contrast} ${
      hasWallpaper ? "has-wallpaper" : ""
    }`;
    document.body.style.setProperty("--custom-background-image", preferences.wallpaperImage ? `url("${preferences.wallpaperImage}")` : "none");
    document.body.style.setProperty("--ink", textPair.ink);
    document.body.style.setProperty("--muted", textPair.muted);
    document.body.style.setProperty("--ink-inverse", textPair.inkInverse);
    Object.entries(
      buildThemeVariables({
        accentColor: preferences.accentColor,
        uiOpacity: preferences.uiOpacity,
        blur: preferences.blur,
        contrast,
      }),
    ).forEach(([key, value]) => document.body.style.setProperty(key, value));
  }, [preferences]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setDraggingClass = useCallback((active: boolean) => {
    document.body.classList.toggle("dnd-active", active);
  }, []);

  function onDragEnd(event: DragEndEvent) {
    setDraggingClass(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId.startsWith("zone-") && overId.startsWith("zone-")) {
      reorderZones(activeId, overId);
      return;
    }
    if (activeId.startsWith("fav") && overId.startsWith("fav")) {
      reorderFavorites(activeId, overId);
      return;
    }
    if (activeId.startsWith("widget") && overId.startsWith("widget")) {
      reorderWidgets(activeId, overId);
    }
  }

  function openNewFavorite() {
    setEditingFavorite(null);
    setFavoriteEditorOpen(true);
  }

  function openFavoriteEdit(favorite: Favorite) {
    setEditingFavorite(favorite);
    setFavoriteEditorOpen(true);
  }

  function saveFavorite(favorite: FavoriteInput) {
    if (editingFavorite) {
      updateFavorite(editingFavorite.id, favorite);
      return;
    }
    addFavorite(favorite);
  }

  if (!isMounted) {
    return (
      <main className="min-h-screen px-4 py-4 text-[color:var(--ink)] sm:px-6 lg:px-10">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-normal">justHomePage</h1>
        </header>
      </main>
    );
  }

  const zoneContent: Record<ZoneId, React.ReactElement> = {
    search: (
      <section className="mx-auto mt-[9vh] w-full max-w-4xl text-center">
        <div className="mb-7 flex flex-col items-center justify-center gap-2 text-[color:var(--muted)]">
          <div className="flex items-center gap-3 text-2xl font-semibold text-[color:var(--ink)]">
            <FiSun className="text-[#f5a623]" />
            {environment.greeting}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>{environment.dateLabel}</span>
            <span>•</span>
            <span className="font-semibold text-[color:var(--accent-warm)]">
              {environment.temperatureC === null ? "Syncing °C" : `${environment.temperatureC}°C`}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiMapPin />
              {environment.locationLabel}
            </span>
            <span className="hidden sm:inline">{environment.timezone}</span>
          </div>
        </div>
        <SearchBar />
      </section>
    ),
    favorites: (
      <section className="mx-auto mt-9 w-full max-w-[1060px]">
        <div className="mb-3 flex items-center justify-between text-sm text-[color:var(--muted)]">
          <div className="flex items-center gap-2 font-semibold">
            <FiGrid />
            Favorites
          </div>
          <button
            type="button"
            onClick={openNewFavorite}
            className="rounded-full px-3 py-1 font-medium transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            Add
          </button>
        </div>
        <SortableContext items={favoriteIds} strategy={rectSortingStrategy}>
          <div aria-label="Favorite websites" className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {favorites.map((favorite) => (
              <FavoriteTile
                key={favorite.id}
                favorite={favorite}
                editMode={preferences.editMode}
                scale={preferences.favoriteScale}
                onEdit={() => openFavoriteEdit(favorite)}
                onRemove={() => removeFavorite(favorite.id)}
              />
            ))}
            <button
              type="button"
              onClick={openNewFavorite}
              className="flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] p-3 text-center shadow-tile backdrop-blur transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[color:var(--surface-strong)] text-2xl text-[color:var(--muted)]">
                <FiPlus />
              </span>
              <span className="text-[13px] font-semibold">Add</span>
            </button>
          </div>
        </SortableContext>
      </section>
    ),
    workspace: (
      <section className="mx-auto mt-7 w-full max-w-[1060px]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--muted)]">
            <FiGrid />
            Workspace
          </div>
          {preferences.editMode ? (
            <div className="flex flex-wrap justify-end gap-2">
              {widgetOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => addWidget(option.type)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-medium backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  <FiPlus />
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${
            preferences.widgetScale === "compact"
              ? "auto-rows-[132px]"
              : preferences.widgetScale === "large"
                ? "auto-rows-[184px]"
                : "auto-rows-[156px]"
          }`}>
            {widgets.map((widget) => (
              <WidgetFrame key={widget.id} widget={widget} scale={preferences.widgetScale} />
            ))}
          </div>
        </SortableContext>
      </section>
    ),
  };

  return (
    <main className="min-h-screen px-4 py-4 text-[color:var(--ink)] sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-[1480px] flex-col">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-normal">justHomePage</h1>
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label={preferences.editMode ? "Leave edit mode" : "Enter edit mode"}
              onClick={() => setEditMode(!preferences.editMode)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] text-lg shadow-tile backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              {preferences.editMode ? <FiX /> : <FiEdit3 />}
            </button>
            <button
              type="button"
              aria-label="Open settings"
              onClick={() => setSettingsOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] text-lg shadow-tile backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <FiSettings />
            </button>
          </div>
        </header>

        {preferences.editMode && hiddenZones.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs text-[color:var(--muted)]">
            <span className="font-semibold uppercase tracking-[0.12em]">Hidden zones:</span>
            {hiddenZones.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setZoneVisible(zone, true)}
                aria-label={`Show ${zoneLabels[zone]} zone`}
                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface-strong)] px-3 py-1 font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiPlus />
                Show {zoneLabels[zone]}
              </button>
            ))}
          </div>
        ) : null}

        <DndContext
          id="justhomepage-workspace-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={() => setDraggingClass(true)}
          onDragCancel={() => setDraggingClass(false)}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={zoneSortableIds} strategy={verticalListSortingStrategy}>
            {preferences.zoneOrder.map((zone) =>
              !preferences.editMode && !preferences.zoneVisibility[zone] ? null : (
                <SortableZone
                  key={zone}
                  zoneId={zone}
                  label={zoneLabels[zone]}
                  editMode={preferences.editMode}
                  visible={preferences.zoneVisibility[zone]}
                  onToggleVisible={(next) => setZoneVisible(zone, next)}
                >
                  {zoneContent[zone]}
                </SortableZone>
              ),
            )}
          </SortableContext>
        </DndContext>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <FavoriteEditor
        open={favoriteEditorOpen}
        favorite={editingFavorite}
        onClose={() => setFavoriteEditorOpen(false)}
        onSave={saveFavorite}
      />
    </main>
  );
}
