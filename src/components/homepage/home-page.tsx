"use client";

import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Responsive as ResponsiveGridLayout, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  FiAlignJustify,
  FiEdit3,
  FiGrid,
  FiMapPin,
  FiPlus,
  FiSettings,
  FiSun,
  FiX,
} from "react-icons/fi";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SearchBar } from "@/components/search/search-bar";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import { FavoriteEditor } from "@/components/homepage/favorite-editor";
import { SortableZone } from "@/components/homepage/sortable-zone";
import { WidgetFrame } from "@/components/widgets/widget-frame";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useHomeStore } from "@/stores/home-store";
import type { Favorite, FavoriteInput, HomeWidget, WidgetType, ZoneId } from "@/lib/types";
import { useLocalEnvironment } from "@/hooks/use-local-environment";
import { buildThemeVariables, getReadableTextPair, resolveContrast } from "@/lib/theme";
import { widgetRegistry, getWidgetMeta } from "@/components/widgets/widget-registry";

const widgetOptions: Array<{ type: WidgetType; label: string }> = (Object.keys(widgetRegistry) as WidgetType[]).map(
  (type) => ({ type, label: widgetRegistry[type].label }),
);

const zoneLabels: Record<ZoneId, string> = {
  search: "Search",
  favorites: "Favorites",
  workspace: "Workspace",
};

const BREAKPOINTS = { lg: 1024, md: 640, sm: 0 };
const COLS = { lg: 12, md: 8, sm: 4 } as const;
const ROW_HEIGHT = { lg: 80, md: 70, sm: 60 } as const;
const MARGIN: Record<"lg" | "md" | "sm", readonly [number, number]> = {
  lg: [12, 12],
  md: [10, 10],
  sm: [8, 8],
};

function widgetToLayoutItem(widget: HomeWidget) {
  const meta = getWidgetMeta(widget.type);
  const variant = meta.variants.find((v) => v.id === widget.variant) ?? meta.variants[0];
  return {
    i: widget.id,
    x: widget.layout.x,
    y: widget.layout.y,
    w: widget.layout.w,
    h: widget.layout.h,
    minW: variant.minW,
    minH: variant.minH,
    maxW: variant.maxW,
    maxH: variant.maxH,
  };
}

function clampLayoutToCols(item: { x: number; w: number }, cols: number) {
  const w = Math.min(item.w, cols);
  const x = Math.min(item.x, Math.max(0, cols - w));
  return { x, w };
}

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
  const setLayouts = useHomeStore((state) => state.setLayouts);
  const compactWidgets = useHomeStore((state) => state.compactWidgets);
  const reorderFavorites = useHomeStore((state) => state.reorderFavorites);
  const reorderZones = useHomeStore((state) => state.reorderZones);
  const setZoneVisible = useHomeStore((state) => state.setZoneVisible);
  const setEditMode = useHomeStore((state) => state.setEditMode);
  const environment = useLocalEnvironment();
  const isMobile = useMediaQuery("(max-width: 639.98px)");
  const [addWidgetSheetOpen, setAddWidgetSheetOpen] = useState(false);
  const favoriteIds = useMemo(() => favorites.map((item) => item.id), [favorites]);
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

  // Track active grid breakpoint for mobile-disabled drag/resize.
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const lastLayoutSigRef = useRef<string>("");
  const [workspaceWidth, setWorkspaceWidth] = useState<number | null>(null);
  const breakpoint: "lg" | "md" | "sm" = (() => {
    const w = workspaceWidth ?? 1040;
    if (w >= BREAKPOINTS.lg) return "lg";
    if (w >= BREAKPOINTS.md) return "md";
    return "sm";
  })();

  useEffect(() => {
    if (!isMounted) return;
    const node = workspaceRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0) {
        setWorkspaceWidth(entry.contentRect.width);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [isMounted]);

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

  // Toggle the edit-mode body class so the grid-paper background can react.
  useEffect(() => {
    document.body.classList.toggle("workspace-edit", preferences.editMode);
    return () => {
      document.body.classList.remove("workspace-edit");
    };
  }, [preferences.editMode]);

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
      <main className="min-h-screen px-3 py-3 text-[color:var(--ink)] sm:px-6 sm:py-4 lg:px-10">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <h1 className="text-lg font-semibold tracking-normal">justHomePage</h1>
        </header>
      </main>
    );
  }

  // Build per-breakpoint layouts. For sm (mobile) we auto-stack by (y, x).
  const desktopLayout: Layout = widgets.map(widgetToLayoutItem);
  const mediumLayout: Layout = widgets.map((widget) => {
    const item = widgetToLayoutItem(widget);
    const clamped = clampLayoutToCols(item, COLS.md);
    return { ...item, x: clamped.x, w: clamped.w };
  });
  const sortedForMobile = [...widgets].sort((a, b) =>
    a.layout.y === b.layout.y ? a.layout.x - b.layout.x : a.layout.y - b.layout.y,
  );
  let cursorY = 0;
  const smallLayout: Layout = sortedForMobile.map((widget) => {
    const meta = getWidgetMeta(widget.type);
    const variant = meta.variants.find((v) => v.id === widget.variant) ?? meta.variants[0];
    const w = Math.min(COLS.sm, widget.layout.w);
    const item = {
      i: widget.id,
      x: 0,
      y: cursorY,
      w,
      h: widget.layout.h,
      minW: variant.minW,
      minH: variant.minH,
      maxW: variant.maxW,
      maxH: variant.maxH,
    };
    cursorY += widget.layout.h;
    return item;
  });

  const editEnabled = preferences.editMode && breakpoint !== "sm";

  function handleLayoutChange(currentLayout: Layout) {
    if (!editEnabled) return;
    // Persist only on lg/md (editEnabled is false on sm).
    const next = currentLayout.map((item) => ({
      id: item.i,
      layout: { x: item.x, y: item.y, w: item.w, h: item.h },
    }));
    const sig = JSON.stringify(next);
    if (sig === lastLayoutSigRef.current) return;
    lastLayoutSigRef.current = sig;
    setLayouts(next);
  }

  const zoneContent: Record<ZoneId, React.ReactElement> = {
    search: (
      <section className="mx-auto mt-6 w-full max-w-4xl text-center sm:mt-[9vh]">
        <div className="mb-5 flex flex-col items-center justify-center gap-2 text-[color:var(--muted)] sm:mb-7">
          <div className="flex items-center gap-3 text-2xl font-semibold text-[color:var(--ink)] sm:text-3xl lg:text-4xl">
            <FiSun className="text-[#f5a623]" />
            {environment.greeting}
          </div>
          {/* Stack vertically on mobile (date row, then temp + location row);
              keep single inline row at ≥sm. */}
          <div className="flex flex-col items-center gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
            <span>{environment.dateLabel}</span>
            <div className="flex items-center gap-3 sm:gap-4">
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
        </div>
        <SearchBar />
      </section>
    ),
    favorites: (
      <section className="mx-auto mt-9 w-full max-w-[1280px]">
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
          <div aria-label="Favorite websites" className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
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
              className="flex min-h-[94px] flex-col items-center justify-center gap-2 rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] p-3 text-center shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] sm:shadow-tile"
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
      <section className="mx-auto mt-7 w-full max-w-[1280px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--muted)]">
            <FiGrid />
            Workspace
          </div>
          {preferences.editMode ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => compactWidgets()}
                title="Compact layout — pack widgets to the top"
                aria-label="Compact widget layout"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-medium backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiAlignJustify />
                Compact
              </button>
              {isMobile ? (
                <button
                  type="button"
                  onClick={() => setAddWidgetSheetOpen(true)}
                  aria-label="Add widget"
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-medium backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  <FiPlus />
                  Add widget
                </button>
              ) : (
                widgetOptions.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => addWidget(option.type)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-medium backdrop-blur transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  >
                    <FiPlus />
                    {option.label}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        {preferences.editMode && breakpoint === "sm" ? (
          <p className="mb-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-center text-xs text-[color:var(--muted)]">
            Open on a larger screen to rearrange widgets.
          </p>
        ) : null}
        <div
          ref={workspaceRef}
          data-edit-mode={preferences.editMode ? "true" : "false"}
          className={`workspace-grid relative rounded-[18px] ${
            preferences.editMode ? "workspace-grid--edit" : ""
          }`}
        >
          {widgets.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center p-6">
              {preferences.editMode ? (
                <div className="flex h-[180px] w-[320px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[color:var(--border)] bg-transparent text-center">
                  <FiPlus className="text-[28px] text-[color:var(--muted)]" />
                  <p className="text-base font-medium text-[color:var(--ink)]">
                    Add a widget to get started
                  </p>
                  <p className="text-sm text-[color:var(--muted)]">
                    Pick from the tray above — or press <kbd className="px-1">A</kbd>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--muted)]">
                  Turn on Edit to place widgets.
                </p>
              )}
            </div>
          ) : (
            <ResponsiveGridLayout
              className="workspace-rgl"
              breakpoints={BREAKPOINTS}
              cols={COLS}
              rowHeight={ROW_HEIGHT[breakpoint]}
              margin={MARGIN[breakpoint]}
              width={workspaceWidth && workspaceWidth > 0 ? workspaceWidth : 1040}
              compactor={undefined /* default = vertical */}
              dragConfig={{
                enabled: editEnabled,
                bounded: false,
                handle: ".widget-drag-handle",
                cancel: ".widget-no-drag, button, [role='menu']",
                threshold: 6,
              }}
              resizeConfig={{
                enabled: editEnabled,
                handles: ["se"],
              }}
              layouts={{ lg: desktopLayout, md: mediumLayout, sm: smallLayout }}
              onLayoutChange={handleLayoutChange}
              onDragStart={() => setDraggingClass(true)}
              onDragStop={() => setDraggingClass(false)}
              onResizeStart={() => setDraggingClass(true)}
              onResizeStop={() => setDraggingClass(false)}
            >
              {widgets.map((widget) => (
                <div key={widget.id} data-widget-id={widget.id}>
                  <WidgetFrame widget={widget} scale={preferences.widgetScale} />
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>
        {preferences.editMode && breakpoint === "sm" ? (
          <p className="mt-2 text-center text-xs italic text-[color:var(--muted)]">
            Workspace layout (drag/resize) is set on a larger screen.
          </p>
        ) : null}
      </section>
    ),
  };

  return (
    <main className="min-h-screen px-3 py-3 text-[color:var(--ink)] sm:px-6 sm:py-4 lg:px-10">
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
      {addWidgetSheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add widget"
          className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm"
          onClick={() => setAddWidgetSheetOpen(false)}
        >
          <div
            className="w-full max-h-[88svh] overflow-y-auto rounded-t-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] p-5 pb-[max(env(safe-area-inset-bottom),16px)] shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-center pb-3 pt-1">
              <span aria-hidden className="block h-1 w-9 rounded-full bg-[color:var(--muted)] opacity-50" />
            </div>
            <h2 className="mb-3 text-lg font-semibold">Add widget</h2>
            <div className="grid grid-cols-2 gap-2">
              {widgetOptions.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => {
                    addWidget(option.type);
                    setAddWidgetSheetOpen(false);
                  }}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  <FiPlus />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
