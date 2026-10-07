"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo, useEffect, useRef } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { LETTER_ICON, getBrandIcon } from "@/components/icons/brand-icon";
import { getLetterAvatar } from "@/lib/letter-avatar";
import type { Density, Favorite, UIScale } from "@/lib/types";

const favoriteSize: Record<UIScale, { card: string; icon: string; iconInner: string; text: string }> = {
  compact: { card: "min-h-[80px]", icon: "h-11 w-11 rounded-[22.5%] text-[18px]", iconInner: "h-6 w-6", text: "text-[12px]" },
  cozy: { card: "min-h-[96px]", icon: "h-12 w-12 rounded-[22.5%] text-[20px]", iconInner: "h-7 w-7", text: "text-[12px]" },
  large: { card: "min-h-[108px]", icon: "h-14 w-14 rounded-[22.5%] text-[22px]", iconInner: "h-8 w-8", text: "text-[13px]" },
};

function scaleFromDensity(density: Density): UIScale {
  if (density === "comfort") return "large";
  if (density === "compact") return "compact";
  return "cozy";
}

export const FavoriteTile = memo(function FavoriteTile({
  favorite,
  editMode,
  scale,
  density,
  onEdit,
  onRemove,
}: {
  favorite: Favorite;
  editMode: boolean;
  scale?: UIScale;
  density?: Density;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id });
  const brand = getBrandIcon(favorite.icon);
  const Icon = brand.icon;
  const size = favoriteSize[density ? scaleFromDensity(density) : (scale ?? "cozy")];
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
      className={`sortable-card group relative glass-tile ${size.card} rounded-[22px] border border-white/50 text-center shadow-[var(--shadow-glass)] transition active:scale-[0.96] ${
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
        type="button"
        onClick={() => {
          if (editMode || wasDraggingRef.current || movedRef.current) return;
          window.location.href = favorite.url;
        }}
        className={`flex h-full w-full ${size.card} flex-col items-center justify-center gap-2 rounded-[22px] px-2 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
        aria-label={favorite.title}
      >
        {favorite.iconUrl ? (
          <span className={`grid ${size.icon} place-items-center bg-white shadow-[0_6px_16px_rgba(0,0,0,0.1)]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={favorite.iconUrl} alt="" className={`${size.iconInner} rounded-lg object-contain`} loading="lazy" />
          </span>
        ) : favorite.icon === LETTER_ICON ? (
          <LetterAvatarBadge title={favorite.title} sizeClass={size.icon} />
        ) : (
          <span className={`grid ${size.icon} place-items-center bg-white shadow-[0_6px_16px_rgba(0,0,0,0.1)]`}>
            <Icon aria-hidden style={{ color: brand.color }} />
          </span>
        )}
        <span className={`max-w-full truncate ${size.text} font-medium tracking-tight text-[color:var(--ink)]`}>
          {favorite.title}
        </span>
      </button>

      <button
        type="button"
        aria-label={`Edit ${favorite.title}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onEdit();
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          onRemove();
        }}
        className="absolute right-0.5 top-0.5 grid h-9 w-9 place-items-center rounded-full text-[color:var(--muted)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <FiMoreHorizontal />
      </button>
    </div>
  );
});

function LetterAvatarBadge({ title, sizeClass }: { title: string; sizeClass: string }) {
  const { letter, color } = getLetterAvatar(title);
  return (
    <span
      className={`grid ${sizeClass} place-items-center text-lg font-bold uppercase text-white shadow-[0_6px_16px_rgba(0,0,0,0.1)]`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
