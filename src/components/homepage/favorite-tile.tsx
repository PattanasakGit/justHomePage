"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { LETTER_ICON, getBrandIcon } from "@/components/icons/brand-icon";
import { getLetterAvatar } from "@/lib/letter-avatar";
import type { FavoriteItem, UIScale } from "@/lib/types";

const favoriteSize: Record<UIScale, { card: string; icon: string; iconInner: string; text: string }> = {
  compact: { card: "min-h-[78px]", icon: "h-10 w-10 rounded-[14px] text-[21px]", iconInner: "h-6 w-6", text: "text-[12px]" },
  cozy: { card: "min-h-[94px]", icon: "h-12 w-12 rounded-[16px] text-[25px]", iconInner: "h-7 w-7", text: "text-[13px]" },
  large: { card: "min-h-[116px]", icon: "h-14 w-14 rounded-[18px] text-[29px]", iconInner: "h-8 w-8", text: "text-sm" },
};

export const FavoriteTile = memo(function FavoriteTile({
  favorite,
  editMode,
  scale,
  onEdit,
  onRemove,
  onOpenFolder,
  folderDropIntent = "idle",
}: {
  favorite: FavoriteItem;
  editMode: boolean;
  scale: UIScale;
  onEdit: () => void;
  onRemove: () => void;
  onOpenFolder?: (id: string) => void;
  folderDropIntent?: "idle" | "armed";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id });
  const { isOver: isFolderDropOver, setNodeRef: setFolderDropRef } = useDroppable({
    id: `folder-drop-${favorite.id}`,
    disabled: favorite.type !== "folder",
  });
  const brand = getBrandIcon(favorite.icon);
  const Icon = brand.icon;
  const size = favoriteSize[scale];
  const wasDraggingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      wasDraggingRef.current = false;
    }, 80);
    return () => window.clearTimeout(timer);
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`sortable-card group relative ${size.card} rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] text-center shadow-sm ui-glass transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] sm:shadow-tile ${
        isDragging ? "opacity-50" : ""
      }`}
      onPointerDown={(event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        movedRef.current = false;
      }}
      onPointerMove={(event) => {
        const start = pointerStartRef.current;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) {
          movedRef.current = true;
        }
      }}
      {...attributes}
      {...listeners}
    >
      <button
        ref={favorite.type === "folder" ? setFolderDropRef : undefined}
        type="button"
        onClick={() => {
          if (editMode || wasDraggingRef.current || movedRef.current) return;
          if (favorite.type === "folder") {
            onOpenFolder?.(favorite.id);
            return;
          }
          window.location.href = favorite.url;
        }}
        className={`flex h-full w-full ${size.card} flex-col items-center justify-center gap-2 rounded-[18px] p-3 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]`}
        aria-label={favorite.type === "folder" ? `Open folder ${favorite.title}` : favorite.title}
      >
        {favorite.type === "folder" ? (
          <span
            data-folder-tile="true"
            className={`relative grid ${size.icon} place-items-center rounded-b-[16px] rounded-tl-[10px] rounded-tr-[18px] border bg-[color:var(--accent-soft)] text-[color:var(--accent)] shadow-inner before:absolute before:-top-2 before:left-1 before:h-3 before:w-1/2 before:rounded-t-[10px] before:border before:border-b-0 before:bg-[color:var(--accent-soft)] ${
              folderDropIntent === "armed"
                ? "border-[color:var(--accent)] ring-4 ring-[color:var(--accent-soft)] before:border-[color:var(--accent)]"
                : isFolderDropOver
                  ? "border-[color:var(--accent)] before:border-[color:var(--accent)]"
                  : "border-[color:var(--border)] before:border-[color:var(--border)]"
            }`}
          >
            <Icon aria-hidden style={{ color: brand.color === "currentColor" ? "var(--accent)" : brand.color }} />
          </span>
        ) : favorite.iconUrl ? (
          <span className={`grid ${size.icon} place-items-center bg-white/85 shadow-inner`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={favorite.iconUrl} alt="" className={`${size.iconInner} rounded-lg object-contain`} loading="lazy" />
          </span>
        ) : favorite.icon === LETTER_ICON ? (
          <LetterAvatarBadge title={favorite.title} sizeClass={size.icon} />
        ) : (
          <span className={`grid ${size.icon} place-items-center bg-white/85 shadow-inner`}>
            <Icon aria-hidden style={{ color: brand.color }} />
          </span>
        )}
        <span className={`max-w-full truncate ${size.text} font-semibold`}>{favorite.title}</span>
      </button>

      {editMode ? (
        <div className="absolute inset-x-2 top-2 flex justify-end">
          <div className="flex gap-1">
            <button
              type="button"
              aria-label={`Edit ${favorite.title}`}
              onClick={onEdit}
              className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--surface-strong)] text-[color:var(--ink)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              aria-label={`Remove ${favorite.title}`}
              onClick={onRemove}
              className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--surface-strong)] text-[color:var(--ink)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
});

function LetterAvatarBadge({ title, sizeClass }: { title: string; sizeClass: string }) {
  const { letter, color } = getLetterAvatar(title);
  return (
    <span
      className={`grid ${sizeClass} place-items-center text-lg font-bold uppercase text-white shadow-inner`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
