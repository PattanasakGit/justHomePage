"use client";

import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FiDownload, FiPlus, FiSettings, FiUpload } from "react-icons/fi";
import { SearchBar } from "@/components/search/search-bar";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import { FavoriteEditor } from "@/components/homepage/favorite-editor";
import { FolderManager } from "@/components/homepage/folder-manager";
import { CustomizeSheet } from "@/components/settings/customize-sheet";
import { useHomeStore } from "@/stores/home-store";
import type { Favorite, FavoriteInput } from "@/lib/types";
import { buildThemeVariables, densityCssVars, getReadableTextPair, resolveContrast } from "@/lib/theme";

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [favoriteEditorOpen, setFavoriteEditorOpen] = useState(false);
  const [folderManagerOpen, setFolderManagerOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const favorites = useHomeStore((state) => state.favorites);
  const folders = useHomeStore((state) => state.folders);
  const preferences = useHomeStore((state) => state.preferences);
  const addFavorite = useHomeStore((state) => state.addFavorite);
  const updateFavorite = useHomeStore((state) => state.updateFavorite);
  const removeFavorite = useHomeStore((state) => state.removeFavorite);
  const reorderFavorites = useHomeStore((state) => state.reorderFavorites);
  const addFolder = useHomeStore((state) => state.addFolder);
  const renameFolder = useHomeStore((state) => state.renameFolder);
  const removeFolder = useHomeStore((state) => state.removeFolder);
  const setActiveFolder = useHomeStore((state) => state.setActiveFolder);
  const importBookmarks = useHomeStore((state) => state.importBookmarks);
  const exportBookmarks = useHomeStore((state) => state.exportBookmarks);
  const setEditMode = useHomeStore((state) => state.setEditMode);

  const filteredFavorites = useMemo(() => {
    if (!preferences.activeFolderId) return favorites;
    return favorites.filter((favorite) => favorite.folderId === preferences.activeFolderId);
  }, [favorites, preferences.activeFolderId]);

  const favoriteIds = useMemo(() => filteredFavorites.map((item) => item.id), [filteredFavorites]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  useEffect(() => {
    const hasWallpaper = Boolean(preferences.wallpaperImage);
    const contrast = resolveContrast(
      preferences.contrast,
      hasWallpaper,
      preferences.theme,
      preferences.wallpaperLuminance,
      preferences.appearance,
    );
    const textPair = getReadableTextPair(contrast, preferences.contrastStrength);
    document.body.className = [
      `theme-${preferences.theme}`,
      `font-${preferences.font}`,
      `contrast-${contrast}`,
      `appearance-${preferences.appearance}`,
      hasWallpaper ? "has-wallpaper" : "",
      preferences.chrome === "hidden" ? "chrome-hidden" : "",
    ]
      .filter(Boolean)
      .join(" ");
    document.body.dataset.theme = preferences.appearance;
    document.body.dataset.font = preferences.font;
    document.body.dataset.density = preferences.density;
    document.body.dataset.contrast = preferences.contrastStrength;
    document.body.dataset.chrome = preferences.chrome;
    document.body.style.setProperty(
      "--custom-background-image",
      preferences.wallpaperImage ? `url("${preferences.wallpaperImage}")` : "none",
    );
    document.body.style.setProperty("--ink", textPair.ink);
    document.body.style.setProperty("--muted", textPair.muted);
    document.body.style.setProperty("--ink-inverse", textPair.inkInverse);
    Object.entries(
      buildThemeVariables({
        accentColor: preferences.accentColor,
        uiOpacity: preferences.uiOpacity,
        blur: preferences.blur,
        contrast,
        appearance: preferences.appearance,
        contrastStrength: preferences.contrastStrength,
      }),
    ).forEach(([key, value]) => document.body.style.setProperty(key, value));
    Object.entries(densityCssVars(preferences.density)).forEach(([key, value]) =>
      document.body.style.setProperty(key, value),
    );
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
    setEditMode(true);
  }

  function saveFavorite(favorite: FavoriteInput) {
    if (editingFavorite) {
      updateFavorite(editingFavorite.id, favorite);
      return;
    }
    addFavorite(favorite);
  }

  function onExport() {
    const html = exportBookmarks();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "justhomepage-bookmarks.html";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Bookmarks exported");
  }

  async function onImportFile(file: File) {
    const text = await file.text();
    const result = importBookmarks(text);
    showToast(`Imported ${result.added} bookmark${result.added === 1 ? "" : "s"}`);
  }

  function openFolderManager() {
    setFolderManagerOpen(true);
  }

  if (!isMounted) {
    return (
      <main className="page-shell min-h-screen px-4 py-4 text-[color:var(--ink)]">
        <header className="mx-auto flex w-full max-w-[680px] justify-end">
          <h1 className="sr-only">justHomePage</h1>
        </header>
      </main>
    );
  }

  const isEmpty = favorites.length === 0;

  return (
    <main className="page-shell relative min-h-screen w-full overflow-x-hidden text-[color:var(--ink)]">
      <div className="page-veil" aria-hidden />
      <div className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[680px] flex-col px-[max(16px,env(safe-area-inset-left))] pb-[max(32px,env(safe-area-inset-bottom))] pr-[max(16px,env(safe-area-inset-right))] pt-[max(16px,env(safe-area-inset-top))] sm:max-w-[760px] sm:px-6 sm:pt-7">
        <header className="mb-10 flex items-center justify-end gap-2.5">
          <h1 className="sr-only">justHomePage</h1>
          {preferences.chrome === "shown" ? (
            <>
              <IconChromeButton
                label="Import bookmarks"
                onClick={() => importRef.current?.click()}
              >
                <FiUpload />
              </IconChromeButton>
              <IconChromeButton label="Export bookmarks" onClick={onExport}>
                <FiDownload />
              </IconChromeButton>
            </>
          ) : null}
          <IconChromeButton label="Customize appearance" onClick={() => setCustomizeOpen(true)}>
            <FiSettings />
          </IconChromeButton>
          <input
            ref={importRef}
            type="file"
            accept=".html,text/html"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onImportFile(file);
              event.target.value = "";
            }}
          />
        </header>

        <section className="mb-7 text-center animate-fade-up">
          <p className="greeting m-0 font-display text-[clamp(1.85rem,5.2vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.045em]">
            {getGreeting()}
          </p>
          <p className="mt-1.5 text-[1.05rem] font-normal tracking-tight text-[color:var(--muted)]">
            Search or open a favorite
          </p>
        </section>

        <section className="mb-9 animate-fade-up [animation-delay:40ms]">
          <SearchBar />
        </section>

        {isEmpty ? (
          <section
            aria-label="Empty state"
            className="glass-heavy flex w-full flex-col items-center gap-2.5 rounded-[28px] px-7 py-11 text-center animate-fade-up"
          >
            <div
              className="mb-1.5 grid h-16 w-16 place-items-center rounded-[22.5%] border border-white/55 bg-white/55 text-2xl shadow-[var(--shadow-glass)]"
              aria-hidden
            >
              ✦
            </div>
            <h2 className="m-0 font-display text-[1.375rem] font-bold tracking-tight">Your quiet start</h2>
            <p className="m-0 max-w-[26ch] text-[15px] leading-snug text-[color:var(--muted)]">
              Add favorites or import bookmarks. Nothing else until you need it.
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={openNewFavorite}
                className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--accent)] px-3.5 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                Add Favorite
              </button>
              <button
                type="button"
                onClick={() => importRef.current?.click()}
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--separator)] bg-transparent px-3.5 text-[15px] font-medium text-[color:var(--accent-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                Import
              </button>
            </div>
          </section>
        ) : (
          <section aria-label="Favorites" className="animate-fade-up [animation-delay:80ms]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              {preferences.chrome === "shown" ? (
                <h2 className="m-0 text-[13px] font-semibold tracking-tight text-[color:var(--muted)]">Favorites</h2>
              ) : (
                <span />
              )}
              <div className="flex flex-wrap gap-2">
                {preferences.chrome === "shown" ? (
                  <button
                    type="button"
                    onClick={openFolderManager}
                    className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--surface)] px-3.5 text-[15px] font-medium text-[color:var(--accent-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                    aria-label="Manage folders"
                  >
                    Folders
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={openNewFavorite}
                  className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--accent)] px-3.5 text-[15px] font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                >
                  Add
                </button>
              </div>
            </div>

            <div
              className="mb-3.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Folders"
            >
              <FolderTab
                selected={!preferences.activeFolderId}
                onClick={() => setActiveFolder(null)}
                label="All"
              />
              {folders.map((folder) => (
                <FolderTab
                  key={folder.id}
                  selected={preferences.activeFolderId === folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  label={folder.name}
                />
              ))}
            </div>

            <DndContext
              id="justhomepage-favorites-dnd"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setDraggingClass(true)}
              onDragCancel={() => setDraggingClass(false)}
              onDragEnd={onDragEnd}
            >
              <SortableContext items={favoriteIds} strategy={rectSortingStrategy}>
                <div
                  aria-label="Favorite websites"
                  className="grid w-full grid-cols-3 gap-[var(--grid-gap,12px)] sm:grid-cols-4 md:grid-cols-6"
                >
                  {filteredFavorites.map((favorite) => (
                    <FavoriteTile
                      key={favorite.id}
                      favorite={favorite}
                      editMode={preferences.editMode}
                      density={preferences.density}
                      onEdit={() => openFavoriteEdit(favorite)}
                      onRemove={() => {
                        removeFavorite(favorite.id);
                        showToast(`Removed ${favorite.title}`);
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={openNewFavorite}
                    aria-label="Add favorite"
                    className="add-tile flex min-h-[calc(var(--tile-size,96px)+8px)] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-black/20 bg-[color:var(--surface)] p-3 text-center text-[color:var(--muted)] backdrop-blur-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] dark:border-white/25"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-[22.5%] text-2xl font-light">
                      <FiPlus />
                    </span>
                    <span className="text-[12px] font-medium">Add</span>
                  </button>
                </div>
              </SortableContext>
            </DndContext>
          </section>
        )}
      </div>

      <CustomizeSheet open={customizeOpen} onOpenChange={setCustomizeOpen} />
      <FavoriteEditor
        open={favoriteEditorOpen}
        favorite={editingFavorite}
        folders={folders}
        onClose={() => {
          setFavoriteEditorOpen(false);
          setEditMode(false);
        }}
        onSave={saveFavorite}
        onDelete={
          editingFavorite
            ? () => {
                removeFavorite(editingFavorite.id);
                showToast(`Removed ${editingFavorite.title}`);
              }
            : undefined
        }
      />
      <FolderManager
        open={folderManagerOpen}
        folders={folders}
        onClose={() => setFolderManagerOpen(false)}
        onCreate={(name) => {
          const id = addFolder(name);
          setActiveFolder(id);
          showToast(`Folder “${name}” created`);
        }}
        onRename={(id, name) => {
          renameFolder(id, name);
          showToast(`Folder renamed to “${name}”`);
        }}
        onDelete={(id) => {
          const folder = folders.find((item) => item.id === id);
          removeFolder(id);
          showToast(folder ? `Deleted “${folder.name}”` : "Folder deleted");
        }}
      />

      {toast ? (
        <div className="glass-heavy fixed bottom-14 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-2xl px-4.5 py-3 text-[15px] font-medium shadow-[var(--shadow-float)]">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function IconChromeButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="glass-heavy inline-flex h-11 w-11 min-w-11 items-center justify-center rounded-full text-[17px] font-medium text-[color:var(--accent-text)] transition active:scale-[0.92] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      {children}
    </button>
  );
}

function FolderTab({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-3.5 text-[15px] font-medium tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
        selected
          ? "bg-black/80 text-white dark:bg-white/90 dark:text-black"
          : "bg-[color:var(--surface)] text-[color:var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}
