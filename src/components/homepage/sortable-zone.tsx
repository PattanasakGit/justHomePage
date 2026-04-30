"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiEye, FiEyeOff, FiMove } from "react-icons/fi";
import type { ReactNode } from "react";
import type { ZoneId } from "@/lib/types";

export type SortableZoneProps = {
  zoneId: ZoneId;
  label: string;
  editMode: boolean;
  visible: boolean;
  onToggleVisible: (next: boolean) => void;
  children: ReactNode;
};

export function SortableZone({
  zoneId,
  label,
  editMode,
  visible,
  onToggleVisible,
  children,
}: SortableZoneProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `zone-${zoneId}`,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!editMode) {
    return <div ref={setNodeRef} style={style}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-[24px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)]/40 p-2 transition ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          aria-label={`Reorder ${label} zone`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-xs font-semibold text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          {...attributes}
          {...listeners}
        >
          <FiMove />
          {label}
        </button>
        <button
          type="button"
          aria-label={visible ? `Hide ${label} zone` : `Show ${label} zone`}
          aria-pressed={!visible}
          onClick={() => onToggleVisible(!visible)}
          className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-sm text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        >
          {visible ? <FiEye /> : <FiEyeOff />}
        </button>
      </div>
      <div className={visible ? "" : "pointer-events-none opacity-40"}>{children}</div>
    </div>
  );
}
