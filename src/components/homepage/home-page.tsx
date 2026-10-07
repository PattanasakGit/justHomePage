"use client";

import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { CircleHalf, Gear, Plus, SidebarSimple, X } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SearchBar } from "@/components/search/search-bar";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import { FavoriteEditor } from "@/components/homepage/favorite-editor";
import { LibrarySidebar } from "@/components/homepage/library-sidebar";
import { AddLibrarySheet, type AddLibraryMode } from "@/components/homepage/add-library-sheet";
import { CustomizeSheet } from "@/components/settings/customize-sheet";
import { useHomeStore } from "@/stores/home-store";
import type { Favorite, FavoriteInput } from "@/lib/types";
import { iconSizeCssVars } from "@/lib/icon-size";
import { buildThemeVariables, densityCssVars, getReadableTextPair, resolveContrast } from "@/lib/theme";

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddLibraryMode>("bookmark");
  const [favoriteEditorOpen, setFavoriteEditorOpen] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const isDesktop = useIsDesktop();

  const favorites = useHomeStore((state) => state.favorites);
  const folders = useHomeStore((state) => state.folders);
  const preferences = useHomeStore((state) => state.preferences);
  const addFavorite = useHomeStore((state) => state.addFavorite);
  const updateFavorite = useHomeStore((state) => state.updateFavorite);
  const removeFavorite = useHomeStore((state) => state.removeFavorite);
  const reorderFavorites = useHomeStore((state) => state.reorderFavorites);
  const addFolder = useHomeStore((state) => state.addFolder);
  const setActiveFolder = useHomeStore((state) => state.setActiveFolder);
  const importBookmarks = useHomeStore((state) => state.importBookmarks);
  const exportBookmarks = useHomeStore((state) => state.exportBookmarks);
  const setEditMode = useHomeStore((state) => state.setEditMode);
  const setAppearance = useHomeStore((state) => state.setAppearance);
  const setLibrarySidebarOpen = useHomeStore((state) => state.setLibrarySidebarOpen);

  const libraryOpen = preferences.librarySidebarOpen;

  const filteredFavorites = useMemo(() => {
    if (!preferences.activeFolderId) return favorites;
    return favorites.filter((favorite) => favorite.folderId === preferences.activeFolderId);
  }, [favorites, preferences.activeFolderId]);

  const favoriteCounts = useMemo(() => {
    const byFolder: Record<string, number> = {};
    for (const folder of folders) byFolder[folder.id] = 0;
    for (const favorite of favorites) {
      if (favorite.folderId) byFolder[favorite.folderId] = (byFolder[favorite.folderId] ?? 0) + 1;
    }
    return { all: favorites.length, byFolder };
  }, [favorites, folders]);

  const folderSubtitle = useMemo(() => {
    if (!preferences.activeFolderId) return "All favorites";
    const folder = folders.find((item) => item.id === preferences.activeFolderId);
    return folder ? `${folder.name} favorites` : "All favorites";
  }, [folders, preferences.activeFolderId]);

  const favoriteIds = useMemo(() => filteredFavorites.map((item) => item.id), [filteredFavorites]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
    document.body.dataset.icons = preferences.iconSize;
    document.body.dataset.sidebar = libraryOpen ? "open" : "closed";
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
    Object.entries(iconSizeCssVars(preferences.iconSize)).forEach(([key, value]) =>
      document.body.style.setProperty(key, value),
    );
  }, [libraryOpen, preferences]);

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
    if (String(active.id).startsWith("fav") && String(over.id).startsWith("fav")) {
      reorderFavorites(String(active.id), String(over.id));
    }
  }

  function openAdd(mode: AddLibraryMode = "bookmark") {
    setAddMode(mode);
    setAddOpen(true);
    setMobileLibraryOpen(false);
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

  function toggleLibrary() {
    if (isDesktop) {
      setLibrarySidebarOpen(!libraryOpen);
      return;
    }
    setMobileLibraryOpen((open) => !open);
  }

  function toggleAppearance() {
    setAppearance(preferences.appearance === "dark" ? "light" : "dark");
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
  const sidebarExpanded = isDesktop && libraryOpen;

  return (
    <main className="page-shell relative min-h-screen w-full overflow-x-hidden text-[color:var(--ink)]">
      <div className="page-veil" aria-hidden />
      <div className="relative z-[1] flex min-h-screen w-full">
        <aside
          aria-label="Library sidebar"
          className={`library-sidebar hidden min-[860px]:flex shrink-0 flex-col border-r border-[color:var(--separator)] bg-[color:var(--sidebar-bg,rgba(246,246,248,0.72))] px-3 pb-4 pt-5 backdrop-blur-[48px] ${
            sidebarExpanded ? "w-[232px] opacity-100" : "w-0 overflow-hidden border-0 p-0 opacity-0"
          }`}
          style={{ transition: "width 280ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 280ms" }}
        >
          <LibrarySidebar
            variant="desktop"
            folders={folders}
            activeFolderId={preferences.activeFolderId}
            favoriteCounts={favoriteCounts}
            chrome={preferences.chrome}
            onSelectFolder={setActiveFolder}
            onNewBookmark={() => openAdd("bookmark")}
            onNewFolder={() => openAdd("folder")}
            onImport={() => importRef.current?.click()}
            onExport={onExport}
          />
        </aside>

        <div className="main-column flex min-w-0 flex-1 flex-col items-center px-[max(16px,env(safe-area-inset-left))] pb-[max(32px,env(safe-area-inset-bottom))] pr-[max(16px,env(safe-area-inset-right))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6 sm:pt-7 lg:px-10 lg:pb-14">
          <header className="topbar mb-10 flex w-full max-w-[720px] items-center justify-between gap-2">
            <IconChromeButton
              label="Toggle library sidebar"
              aria-expanded={isDesktop ? libraryOpen : mobileLibraryOpen}
              onClick={toggleLibrary}
            >
              <SidebarSimple weight="light" className="h-5 w-5" aria-hidden />
            </IconChromeButton>
            <h1 className="sr-only">justHomePage</h1>
            <div className="flex items-center gap-2">
              <IconChromeButton label="Toggle light or dark appearance" onClick={toggleAppearance}>
                <CircleHalf weight="light" className="h-5 w-5" aria-hidden />
              </IconChromeButton>
              <IconChromeButton label="Customize appearance" onClick={() => setCustomizeOpen(true)}>
                <Gear weight="light" className="h-5 w-5" aria-hidden />
              </IconChromeButton>
            </div>
          </header>

          <div className="shell w-full max-w-[640px]">
            <section className="mb-7 text-center animate-fade-up">
              <p className="greeting m-0 font-display text-[clamp(1.85rem,5.2vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.045em]">
                {getGreeting()}
              </p>
              <p className="mt-1.5 text-[1.05rem] font-normal tracking-tight text-[color:var(--muted)]">
                {folderSubtitle}
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
                    onClick={() => openAdd("bookmark")}
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
                      className="grid w-full grid-cols-3 gap-[var(--grid-gap,14px)] sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
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
                        onClick={() => openAdd("bookmark")}
                        aria-label="Add favorite"
                        className="add-tile flex min-h-[calc(var(--tile-size,96px)+8px)] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-black/20 bg-[color:var(--surface)] p-3 text-center text-[color:var(--muted)] backdrop-blur-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] dark:border-white/25"
                      >
                        <span className="grid h-12 w-12 place-items-center rounded-[22.5%] text-2xl font-light">
                          <Plus weight="light" aria-hidden />
                        </span>
                        <span className="text-[12px] font-medium">Add</span>
                      </button>
                    </div>
                  </SortableContext>
                </DndContext>
              </section>
            )}
          </div>
        </div>
      </div>

      {mobileLibraryOpen && !isDesktop ? (
        <div className="fixed inset-0 z-40 flex bg-black/28 min-[860px]:hidden" role="presentation">
          <div className="nav-panel flex h-full w-full flex-col bg-[color:var(--sidebar-bg,rgba(246,246,248,0.72))] px-4 pb-6 pt-[max(16px,env(safe-area-inset-top))] backdrop-blur-[48px]">
            <div className="mb-5 flex items-center justify-between px-1">
              <h2 className="m-0 text-[1.375rem] font-semibold tracking-tight">Library</h2>
              <button
                type="button"
                aria-label="Close library"
                onClick={() => setMobileLibraryOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-full text-[color:var(--muted)]"
              >
                <X weight="light" className="h-5 w-5" />
              </button>
            </div>
            <LibrarySidebar
              variant="mobile"
              folders={folders}
              activeFolderId={preferences.activeFolderId}
              favoriteCounts={favoriteCounts}
              chrome={preferences.chrome}
              onSelectFolder={(id) => {
                setActiveFolder(id);
                setMobileLibraryOpen(false);
              }}
              onNewBookmark={() => openAdd("bookmark")}
              onNewFolder={() => openAdd("folder")}
              onImport={() => {
                importRef.current?.click();
                setMobileLibraryOpen(false);
              }}
              onExport={() => {
                onExport();
                setMobileLibraryOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}

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

      <CustomizeSheet open={customizeOpen} onOpenChange={setCustomizeOpen} />
      <AddLibrarySheet
        open={addOpen}
        mode={addMode}
        folders={folders}
        defaultFolderId={preferences.activeFolderId}
        onClose={() => setAddOpen(false)}
        onSaveBookmark={(favorite) => {
          addFavorite(favorite);
          showToast(`Added “${favorite.title}”`);
        }}
        onSaveFolder={(name) => {
          const id = addFolder(name);
          setActiveFolder(id);
          showToast(`Folder “${name}” created`);
        }}
      />
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
  "aria-expanded": ariaExpanded,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  "aria-expanded"?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className="ghost-chrome inline-flex h-10 w-10 min-w-10 items-center justify-center rounded-full text-[color:var(--accent-text)] transition active:scale-[0.92] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      {children}
    </button>
  );
}
