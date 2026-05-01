"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiColumns,
  FiMaximize2,
  FiMinus,
  FiMoreHorizontal,
  FiSquare,
  FiTrash2,
} from "react-icons/fi";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { WidgetClock } from "@/components/widgets/widget-clock";
import { WidgetDate } from "@/components/widgets/widget-date";
import { WidgetNotes } from "@/components/widgets/widget-notes";
import { WidgetQuickLinks } from "@/components/widgets/widget-quick-links";
import { WidgetPomodoro } from "@/components/widgets/widget-pomodoro";
import { WidgetTodo } from "@/components/widgets/widget-todo";
import { WidgetWeather } from "@/components/widgets/widget-weather";
import { WidgetBookmark } from "@/components/widgets/widget-bookmark";
import { getWidgetMeta } from "@/components/widgets/widget-registry";
import { nextSize } from "@/components/widgets/size-cycle";
import type {
  BookmarkConfig,
  HomeWidget,
  PomodoroConfig,
  TodoItem,
  UIScale,
  WidgetSize,
} from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

const widgetScalePadding: Record<UIScale, string> = {
  compact: "p-4",
  cozy: "p-5",
  large: "p-6",
};

const sizeSpanClass: Record<WidgetSize, string> = {
  compact: "",
  regular: "lg:col-span-2",
  wide: "sm:col-span-2 lg:col-span-4",
  tall: "lg:col-span-2 row-span-2",
  hero: "sm:col-span-2 lg:col-span-4 row-span-2",
};

const sizeLabel: Record<WidgetSize, string> = {
  compact: "Compact",
  regular: "Regular",
  wide: "Wide",
  tall: "Tall",
  hero: "Hero",
};

const sizeIcon: Record<WidgetSize, IconType> = {
  compact: FiSquare,
  regular: FiColumns,
  wide: FiMinus,
  tall: FiBookOpen,
  hero: FiMaximize2,
};

export const WidgetFrame = memo(function WidgetFrame({ widget, scale }: { widget: HomeWidget; scale: UIScale }) {
  const editMode = useHomeStore((state) => state.preferences.editMode);
  const removeWidget = useHomeStore((state) => state.removeWidget);
  const resizeWidget = useHomeStore((state) => state.resizeWidget);
  const updateWidgetConfig = useHomeStore((state) => state.updateWidgetConfig);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const meta = getWidgetMeta(widget.type);
  const Icon = meta.icon;
  const span = sizeSpanClass[widget.size] ?? "";
  const canCycle = meta.allowedSizes.length > 1;

  const articleRef = useRef<HTMLElement | null>(null);
  function setArticleRef(el: HTMLElement | null) {
    articleRef.current = el;
    setNodeRef(el);
  }

  // Keyboard shortcut: `r` cycles size, `shift+r` cycles back. Active only
  // when the article (or a descendant) holds focus and the user is not in
  // an editable element (textarea / input / contenteditable).
  useEffect(() => {
    if (!editMode || !canCycle) return;
    const node = articleRef.current;
    if (!node) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "r") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      if (!node.contains(target)) return;
      event.preventDefault();
      const next = nextSize(widget.size, meta.allowedSizes);
      resizeWidget(widget.id, next);
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [editMode, canCycle, widget.id, widget.size, meta.allowedSizes, resizeWidget]);

  const CurrentSizeIcon = sizeIcon[widget.size];

  return (
    <article
      ref={setArticleRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`sortable-card ${span} relative overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] ${widgetScalePadding[scale]} shadow-tile ui-glass transition ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
      {...listeners}
      tabIndex={editMode ? 0 : -1}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div
          className="flex min-w-0 items-center gap-2 text-sm font-semibold"
          aria-live="polite"
        >
          <Icon className="text-[color:var(--accent)]" />
          <span className="truncate">{widget.title}</span>
        </div>
        {editMode ? (
          <div className="flex shrink-0 items-center gap-1">
            {canCycle ? (
              <button
                type="button"
                aria-label={`Resize ${widget.title}, currently ${sizeLabel[widget.size]}`}
                aria-keyshortcuts="r"
                title={`Resize (currently ${sizeLabel[widget.size]})`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  resizeWidget(widget.id, nextSize(widget.size, meta.allowedSizes));
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                <CurrentSizeIcon />
              </button>
            ) : null}
            <OverflowMenu
              widgetTitle={widget.title}
              onRemove={() => removeWidget(widget.id)}
            />
          </div>
        ) : null}
      </header>
      <WidgetBody
        widget={widget}
        scale={scale}
        editMode={editMode}
        onConfigChange={(patch) => updateWidgetConfig(widget.id, patch)}
      />
    </article>
  );
});

function OverflowMenu({
  widgetTitle,
  onRemove,
}: {
  widgetTitle: string;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More actions for ${widgetTitle}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <FiMoreHorizontal />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--popup)] p-1 text-sm shadow-tile"
        >
          <button
            type="button"
            role="menuitem"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
              onRemove();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            <FiTrash2 />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

function WidgetBody({
  widget,
  scale,
  editMode,
  onConfigChange,
}: {
  widget: HomeWidget;
  scale: UIScale;
  editMode: boolean;
  onConfigChange: (patch: Record<string, unknown>) => void;
}) {
  switch (widget.type) {
    case "clock":
      return <WidgetClock scale={scale} size={widget.size} />;
    case "date":
      return <WidgetDate size={widget.size} />;
    case "notes":
      return (
        <WidgetNotes
          size={widget.size}
          body={typeof widget.config.body === "string" ? widget.config.body : ""}
          onChange={(body) => onConfigChange({ body })}
        />
      );
    case "quickLinks":
      return (
        <WidgetQuickLinks
          size={widget.size}
          value={typeof widget.config.links === "string" ? widget.config.links : "Docs,Tasks,Inbox"}
        />
      );
    case "pomodoro":
      return <WidgetPomodoro size={widget.size} config={widget.config as Partial<PomodoroConfig>} />;
    case "todo": {
      const items = Array.isArray(widget.config.items) ? (widget.config.items as TodoItem[]) : [];
      return <WidgetTodo size={widget.size} items={items} onChange={(next) => onConfigChange({ items: next })} />;
    }
    case "weather":
      return <WidgetWeather size={widget.size} />;
    case "bookmark":
      return (
        <WidgetBookmark
          size={widget.size}
          config={widget.config as Partial<BookmarkConfig>}
          editing={editMode}
          onChange={(patch) => onConfigChange(patch)}
        />
      );
    default:
      return null;
  }
}

export type { CSSProperties };
