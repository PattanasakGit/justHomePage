"use client";

import { FiCheck, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WidgetClock } from "@/components/widgets/widget-clock";
import { WidgetDate } from "@/components/widgets/widget-date";
import { WidgetNotes } from "@/components/widgets/widget-notes";
import { WidgetQuickLinks } from "@/components/widgets/widget-quick-links";
import { WidgetPomodoro } from "@/components/widgets/widget-pomodoro";
import { WidgetTodo } from "@/components/widgets/widget-todo";
import { WidgetWeather } from "@/components/widgets/widget-weather";
import { WidgetBookmark } from "@/components/widgets/widget-bookmark";
import { getWidgetMeta } from "@/components/widgets/widget-registry";
import type {
  BookmarkConfig,
  HomeWidget,
  PomodoroConfig,
  TodoItem,
  UIScale,
  WidgetSize,
  WidgetVariantSpec,
} from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

const widgetScalePadding: Record<UIScale, string> = {
  compact: "p-4",
  cozy: "p-5",
  large: "p-6",
};

/**
 * Derive a coarse legacy `WidgetSize` from the active variant. Widget bodies
 * still branch on this for layout decisions (clock-regular, weather-detail,
 * etc.); the variant system fronts the user but the bodies retain their
 * Quiet OS per-size compositions.
 */
function deriveDensity(w: number, h: number): WidgetSize {
  if (w >= 6 && h >= 5) return "hero";
  if (w >= 6) return "wide";
  if (h >= 4) return "tall";
  if (w >= 3) return "regular";
  return "compact";
}

export const WidgetFrame = memo(function WidgetFrame({ widget, scale }: { widget: HomeWidget; scale: UIScale }) {
  const editMode = useHomeStore((state) => state.preferences.editMode);
  const removeWidget = useHomeStore((state) => state.removeWidget);
  const setVariant = useHomeStore((state) => state.setVariant);
  const updateWidgetConfig = useHomeStore((state) => state.updateWidgetConfig);
  const meta = getWidgetMeta(widget.type);
  const Icon = meta.icon;
  const density = deriveDensity(widget.layout.w, widget.layout.h);
  const articleRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // `r` opens the variant submenu (was: cycle).
  useEffect(() => {
    if (!editMode || meta.variants.length < 2) return;
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
      setMenuOpen(true);
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [editMode, meta.variants.length]);

  return (
    <article
      ref={articleRef}
      className={`widget-frame relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] ${widgetScalePadding[scale]} shadow-tile ui-glass`}
      tabIndex={editMode ? 0 : -1}
    >
      <header
        className={`widget-drag-handle mb-3 flex shrink-0 items-center justify-between gap-2 ${
          editMode ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold" aria-live="polite">
          <Icon className="text-[color:var(--accent)]" />
          <span className="truncate">{widget.title}</span>
        </div>
        {editMode ? (
          <div className="flex shrink-0 items-center gap-1">
            <OverflowMenu
              widget={widget}
              variants={meta.variants}
              activeVariant={widget.variant}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              onPickVariant={(variantId) => setVariant(widget.id, variantId)}
              onRemove={() => removeWidget(widget.id)}
            />
          </div>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <WidgetBody
          widget={widget}
          density={density}
          scale={scale}
          editMode={editMode}
          onConfigChange={(patch) => updateWidgetConfig(widget.id, patch)}
        />
      </div>
    </article>
  );
});

function OverflowMenu({
  widget,
  variants,
  activeVariant,
  open,
  onOpenChange,
  onPickVariant,
  onRemove,
}: {
  widget: HomeWidget;
  variants: WidgetVariantSpec[];
  activeVariant: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onPickVariant: (variantId: string) => void;
  onRemove: () => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onOpenChange(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4 + window.scrollY, left: rect.right - 240 + window.scrollX });
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More actions for ${widget.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-keyshortcuts="r"
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        className="grid h-9 w-9 place-items-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      >
        <FiMoreHorizontal />
      </button>
      {open && menuPos && typeof document !== "undefined"
        ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label="Widget options"
          style={{ top: menuPos.top, left: Math.max(8, menuPos.left) }}
          className="absolute z-50 w-[240px] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--popup)] p-1 text-sm shadow-tile"
        >
          {variants.length > 1 ? (
            <>
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                Size
              </div>
              <ul
                className="max-h-[240px] overflow-y-auto py-1 [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)]"
                role="none"
              >
                {variants.map((variant) => {
                  const active = variant.id === activeVariant;
                  return (
                    <li key={variant.id} role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onPointerDown={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenChange(false);
                          onPickVariant(variant.id);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${
                          active
                            ? "bg-[color:var(--accent-soft)] border-l-[3px] border-[color:var(--accent)] pl-1.5 font-semibold text-[color:var(--ink)]"
                            : "hover:bg-[color:var(--surface-strong)]"
                        }`}
                      >
                        <VariantPreview w={variant.w} h={variant.h} active={active} />
                        <span className="flex-1 truncate text-sm font-medium text-[color:var(--ink)]">
                          {variant.label}
                        </span>
                        <span className="rounded-md bg-[color:var(--surface)] px-1.5 py-0.5 text-[11px] tabular-nums text-[color:var(--muted)]">
                          {variant.w}×{variant.h}
                        </span>
                        {active ? <FiCheck className="text-[color:var(--accent)]" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="my-1 h-px w-full bg-[color:var(--border)]" />
            </>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onOpenChange(false);
              onRemove();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            <FiTrash2 />
            Remove
          </button>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function VariantPreview({ w, h, active }: { w: number; h: number; active: boolean }) {
  // Mini preview proportional to w/h within a 28×20 box.
  const maxW = 28;
  const maxH = 20;
  const scale = Math.min(maxW / w, maxH / h);
  const previewW = Math.max(6, Math.round(w * scale));
  const previewH = Math.max(4, Math.round(h * scale));
  return (
    <span
      aria-hidden
      className="grid h-5 w-7 shrink-0 place-items-center"
    >
      <span
        className={`block rounded-[3px] border ${
          active ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--border)] bg-[color:var(--surface-strong)]"
        }`}
        style={{ width: `${previewW}px`, height: `${previewH}px` }}
      />
    </span>
  );
}

function WidgetBody({
  widget,
  density,
  scale,
  editMode,
  onConfigChange,
}: {
  widget: HomeWidget;
  density: WidgetSize;
  scale: UIScale;
  editMode: boolean;
  onConfigChange: (patch: Record<string, unknown>) => void;
}) {
  switch (widget.type) {
    case "clock":
      return <WidgetClock scale={scale} size={density} />;
    case "date":
      return <WidgetDate size={density} />;
    case "notes":
      return (
        <WidgetNotes
          size={density}
          body={typeof widget.config.body === "string" ? widget.config.body : ""}
          onChange={(body) => onConfigChange({ body })}
        />
      );
    case "quickLinks":
      return (
        <WidgetQuickLinks
          size={density}
          value={typeof widget.config.links === "string" ? widget.config.links : "Docs,Tasks,Inbox"}
        />
      );
    case "pomodoro":
      return <WidgetPomodoro size={density} config={widget.config as Partial<PomodoroConfig>} />;
    case "todo": {
      const items = Array.isArray(widget.config.items) ? (widget.config.items as TodoItem[]) : [];
      return <WidgetTodo size={density} items={items} onChange={(next) => onConfigChange({ items: next })} />;
    }
    case "weather":
      return <WidgetWeather size={density} />;
    case "bookmark":
      return (
        <WidgetBookmark
          size={density}
          config={widget.config as Partial<BookmarkConfig>}
          editing={editMode}
          onChange={(patch) => onConfigChange(patch)}
        />
      );
    default:
      return null;
  }
}
