"use client";

import { DndContext, PointerSensor, closestCenter, type DragEndEvent, type DragOverEvent, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronRight, FiFolder, FiPlus, FiX } from "react-icons/fi";
import { FavoriteTile } from "@/components/homepage/favorite-tile";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { FavoriteFolder, FavoriteItem, UIScale } from "@/lib/types";

const FOLDER_DROP_ARM_MS = 520;

type FavoriteFolderModalProps = {
  open: boolean;
  rootItems: FavoriteItem[];
  folderId: string | null;
  editMode: boolean;
  scale: UIScale;
  onClose: () => void;
  onOpenFolder: (id: string) => void;
  onEditItem: (item: FavoriteItem) => void;
  onRemoveItem: (id: string) => void;
  onAddLink: (parentId: string) => void;
  onAddFolder: (parentId: string) => void;
  onReorder?: (activeId: string, overId: string, parentId: string) => void;
  onMoveItem?: (id: string, targetParentId: string | null) => void;
};

function findFolderPath(items: FavoriteItem[], folderId: string | null, path: FavoriteFolder[] = []): FavoriteFolder[] {
  if (!folderId) return [];
  for (const item of items) {
    if (item.type !== "folder") continue;
    const nextPath = [...path, item];
    if (item.id === folderId) return nextPath;
    const childPath = findFolderPath(item.children, folderId, nextPath);
    if (childPath.length) return childPath;
  }
  return [];
}

export function FavoriteFolderModal({
  open,
  rootItems,
  folderId,
  editMode,
  scale,
  onClose,
  onOpenFolder,
  onEditItem,
  onRemoveItem,
  onAddLink,
  onAddFolder,
  onReorder,
  onMoveItem,
}: FavoriteFolderModalProps) {
  const [currentId, setCurrentId] = useState<string | null>(folderId);
  const [armedFolderDropId, setArmedFolderDropId] = useState<string | null>(null);
  const folderDropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingFolderDropIdRef = useRef<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 639.98px)");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (open) setCurrentId(folderId);
  }, [folderId, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const path = useMemo(() => findFolderPath(rootItems, currentId), [currentId, rootItems]);
  const currentFolder = path[path.length - 1] ?? null;
  const items = currentFolder?.children ?? [];
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const clearFolderDropIntent = useCallback(() => {
    if (folderDropTimerRef.current) {
      clearTimeout(folderDropTimerRef.current);
      folderDropTimerRef.current = null;
    }
    pendingFolderDropIdRef.current = null;
    setArmedFolderDropId(null);
  }, []);

  const scheduleFolderDropIntent = useCallback((overId: string | null) => {
    let folderId = overId?.startsWith("folder-drop-") ? overId.slice("folder-drop-".length) : null;
    if (!folderId) {
      const item = items.find((entry) => entry.id === overId);
      folderId = item?.type === "folder" ? item.id : null;
    }
    if (folderId === pendingFolderDropIdRef.current) return;
    if (folderDropTimerRef.current) clearTimeout(folderDropTimerRef.current);
    pendingFolderDropIdRef.current = folderId;
    setArmedFolderDropId(null);
    if (!folderId) return;
    folderDropTimerRef.current = setTimeout(() => {
      if (pendingFolderDropIdRef.current === folderId) setArmedFolderDropId(folderId);
    }, FOLDER_DROP_ARM_MS);
  }, [items]);

  if (!open || !currentFolder) return null;

  function openFolder(id: string) {
    setCurrentId(id);
    onOpenFolder(id);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentFolder) {
      clearFolderDropIntent();
      return;
    }
    const activeId = String(active.id);
    const overId = String(over.id);
    if (overId === "folder-drop-root") {
      onMoveItem?.(activeId, null);
      clearFolderDropIntent();
      return;
    }
    if (overId.startsWith("folder-drop-")) {
      const folderId = overId.slice("folder-drop-".length);
      if (armedFolderDropId === folderId) {
        onMoveItem?.(activeId, folderId);
      } else {
        onReorder?.(activeId, folderId, currentFolder.id);
      }
      clearFolderDropIntent();
      return;
    }
    const overItem = items.find((item) => item.id === overId);
    if (overItem?.type === "folder" && armedFolderDropId === overItem.id) {
      onMoveItem?.(activeId, overItem.id);
      clearFolderDropIntent();
      return;
    }
    onReorder?.(String(active.id), String(over.id), currentFolder.id);
    clearFolderDropIntent();
  }

  function onDragOver(event: DragOverEvent) {
    const overId = event.over ? String(event.over.id) : null;
    scheduleFolderDropIntent(overId);
  }

  const shellClass = isMobile
    ? "fixed inset-0 z-[55] bg-[color:var(--popup)]"
    : "fixed inset-0 z-[55] grid place-items-center bg-black/25 p-4 backdrop-blur-sm";
  const panelClass = isMobile
    ? "flex h-[100svh] w-full flex-col bg-[color:var(--popup)]"
    : "flex max-h-[86vh] w-full max-w-4xl flex-col rounded-[28px] border border-[color:var(--border)] bg-[color:var(--popup)] shadow-panel";

  return (
    <div className={shellClass} role="dialog" aria-modal="true" aria-label="Favorite folder">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragCancel={clearFolderDropIntent}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <section className={panelClass}>
          <header className="border-b border-[color:var(--border)] px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2 text-lg font-semibold">
                  <FiFolder className="shrink-0 text-[color:var(--accent)]" />
                  <span className="truncate">{currentFolder.title}</span>
                </div>
                <nav aria-label="Folder path" className="mt-2 flex items-center gap-1 overflow-x-auto text-xs text-[color:var(--muted)]">
                  <BreadcrumbDropButton id="folder-drop-root" onClick={onClose} label="Favorites">
                    Favorites
                  </BreadcrumbDropButton>
                  {path.map((folder) => (
                    <span key={folder.id} className="inline-flex min-w-0 shrink-0 items-center gap-1">
                      <FiChevronRight aria-hidden />
                      <BreadcrumbDropButton
                        id={`folder-drop-${folder.id}`}
                        onClick={() => setCurrentId(folder.id)}
                        label={folder.title}
                        current
                      >
                        {folder.title}
                      </BreadcrumbDropButton>
                    </span>
                  ))}
                </nav>
              </div>
              <button
                type="button"
                aria-label="Close favorite folder"
                onClick={onClose}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiX />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAddLink(currentFolder.id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiPlus />
                Add website
              </button>
              <button
                type="button"
                onClick={() => onAddFolder(currentFolder.id)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
              >
                <FiFolder />
                Add folder
              </button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {items.length === 0 ? (
              <div className="grid min-h-[220px] place-items-center rounded-[18px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center">
                <div>
                  <FiFolder className="mx-auto mb-3 text-3xl text-[color:var(--muted)]" />
                  <p className="text-base font-semibold">This folder is empty</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Add a website or create a subfolder here.</p>
                </div>
              </div>
            ) : (
              <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                <div aria-label={`${currentFolder.title} favorites`} className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                  {items.map((item) => (
                    <FavoriteTile
                      key={item.id}
                      favorite={item}
                      editMode={editMode}
                      scale={scale}
                      onEdit={() => onEditItem(item)}
                      onRemove={() => onRemoveItem(item.id)}
                      onOpenFolder={openFolder}
                      folderDropIntent={armedFolderDropId === item.id ? "armed" : "idle"}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        </section>
      </DndContext>
    </div>
  );
}

function BreadcrumbDropButton({
  id,
  label,
  current = false,
  onClick,
  children,
}: {
  id: string;
  label: string;
  current?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`Move here: ${label}`}
      onClick={onClick}
      className={`max-w-[140px] shrink-0 truncate rounded-full px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        current ? "text-[color:var(--ink)]" : ""
      } ${isOver ? "bg-[color:var(--accent-soft)] text-[color:var(--ink)]" : "hover:bg-[color:var(--surface-strong)]"}`}
    >
      {children}
    </button>
  );
}
