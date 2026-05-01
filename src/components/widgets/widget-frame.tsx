"use client";

import { FiArrowDown, FiArrowUp, FiBookmark, FiCheck, FiCloud, FiMapPin, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
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
import { useLocalEnvironment } from "@/hooks/use-local-environment";
import { useMediaQuery } from "@/hooks/use-media-query";
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
import { normalizeUrl } from "@/lib/url";

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
  const moveWidgetUp = useHomeStore((state) => state.moveWidgetUp);
  const moveWidgetDown = useHomeStore((state) => state.moveWidgetDown);
  const isMobile = useMediaQuery("(max-width: 639.98px)");
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
      data-mobile-strip={isMobile ? "true" : "false"}
      className={`widget-frame relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] ${
        isMobile ? "p-2" : widgetScalePadding[scale]
      } shadow-sm ui-glass sm:shadow-tile`}
      tabIndex={editMode ? 0 : -1}
    >
      {/* On mobile, view-mode hides the header entirely — the strip body
          already carries an identity glyph + label, so a duplicate "icon +
          title" row would steal the full 60 px cell. Edit mode keeps the
          header so the overflow trigger has somewhere to sit. */}
      <header
        className={`widget-drag-handle ${
          isMobile ? (editMode ? "mb-1" : "hidden") : "mb-3"
        } flex shrink-0 items-center justify-between gap-2 ${
          editMode ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold" aria-live="polite">
          <Icon className="text-[color:var(--accent)]" />
          <span className="truncate">{widget.title}</span>
        </div>
        {editMode ? (
          <div className="widget-no-drag flex shrink-0 items-center gap-1">
            <OverflowMenu
              widget={widget}
              variants={meta.variants}
              activeVariant={widget.variant}
              open={menuOpen}
              onOpenChange={setMenuOpen}
              onPickVariant={(variantId) => setVariant(widget.id, variantId)}
              onRemove={() => removeWidget(widget.id)}
              isMobile={isMobile}
              onMoveUp={() => moveWidgetUp(widget.id)}
              onMoveDown={() => moveWidgetDown(widget.id)}
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
  isMobile,
  onMoveUp,
  onMoveDown,
}: {
  widget: HomeWidget;
  variants: WidgetVariantSpec[];
  activeVariant: string;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onPickVariant: (variantId: string) => void;
  onRemove: () => void;
  isMobile: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
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
        className={`${
          isMobile ? "h-11 w-11" : "h-9 w-9"
        } grid place-items-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
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
          {isMobile ? (
            <>
              <button
                type="button"
                role="menuitem"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenChange(false);
                  onMoveUp();
                }}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                <FiArrowUp />
                Move up
              </button>
              <button
                type="button"
                role="menuitem"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenChange(false);
                  onMoveDown();
                }}
                className="flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              >
                <FiArrowDown />
                Move down
              </button>
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
            className={`flex ${
              isMobile ? "min-h-[44px]" : ""
            } w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-medium text-[color:var(--ink)] transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`}
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
  // Mobile (`<sm`) substitutes a smallest-size body for a few widget types so
  // the auto-stacked phone column reads like Apple's Lock Screen widgets
  // instead of a shrunken desktop card. Desktop branches stay intact so the
  // existing tests (regular/wide/tall/hero compositions) remain green.
  const isMobile = useMediaQuery("(max-width: 639.98px)");

  switch (widget.type) {
    case "clock":
      return <WidgetClock scale={scale} size={density} isMobile={isMobile} />;
    case "date":
      return <WidgetDate size={density} isMobile={isMobile} />;
    case "notes":
      return (
        <div data-mobile-cap={isMobile ? "true" : "false"} className={isMobile ? "h-full max-h-[40svh] min-h-0" : "h-full min-h-0"}>
          <WidgetNotes
            size={density}
            body={typeof widget.config.body === "string" ? widget.config.body : ""}
            onChange={(body) => onConfigChange({ body })}
          />
        </div>
      );
    case "quickLinks":
      return (
        <WidgetQuickLinks
          size={density}
          value={typeof widget.config.links === "string" ? widget.config.links : "Docs,Tasks,Inbox"}
        />
      );
    case "pomodoro":
      return (
        <WidgetPomodoro
          variant={isMobile ? "pomo-compact" : widget.variant}
          size={density}
          config={widget.config as Partial<PomodoroConfig>}
        />
      );
    case "todo": {
      const items = Array.isArray(widget.config.items) ? (widget.config.items as TodoItem[]) : [];
      return (
        <div data-mobile-cap={isMobile ? "true" : "false"} className={isMobile ? "h-full max-h-[40svh] min-h-0" : "h-full min-h-0"}>
          <WidgetTodo size={density} items={items} onChange={(next) => onConfigChange({ items: next })} />
        </div>
      );
    }
    case "weather":
      if (isMobile) return <MobileWeatherBody />;
      return <WidgetWeather size={density} />;
    case "bookmark":
      if (isMobile && !editMode) return <MobileBookmarkRow config={widget.config as Partial<BookmarkConfig>} />;
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

/**
 * Mobile-only single-line weather body. Uses the same env data as the
 * desktop branch but drops the gradient + grid layout so a 4-col stack at
 * 390px still reads at a glance.
 */
function MobileWeatherBody() {
  const env = useLocalEnvironment();
  const tempLabel = env.temperatureC === null ? "--" : `${env.temperatureC}°`;
  return (
    <div
      data-mobile-weather="true"
      className="flex h-full min-h-0 items-center gap-2 text-[color:var(--ink)]"
    >
      <FiCloud className="text-[color:var(--accent)]" />
      <span className="text-2xl font-semibold tabular-nums leading-none">{tempLabel}</span>
      <span className="text-sm text-[color:var(--muted)]">·</span>
      <span className="inline-flex min-w-0 items-center gap-1 truncate text-sm text-[color:var(--muted)]">
        <FiMapPin className="shrink-0" />
        <span className="truncate">{env.locationLabel}</span>
      </span>
    </div>
  );
}

/**
 * Mobile-only bookmark launch-row: icon plate left, caption + host inline
 * right. Replaces the icon/thumbnail-on-top layout used on desktop tiles.
 */
function MobileBookmarkRow({ config }: { config: Partial<BookmarkConfig> }) {
  const url = config.url ?? "";
  const caption = config.caption ?? "";
  const thumbnail = config.thumbnail ?? null;
  const safeUrl = normalizeUrl(url);
  const host = safeUrl ? safeUrl.replace(/^https?:\/\//, "").split("/")[0] : "";

  if (!safeUrl) {
    return (
      <div
        data-mobile-bookmark="true"
        className="grid h-full min-h-0 place-items-center rounded-2xl border border-dashed border-[color:var(--border)] p-3 text-center"
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-[color:var(--muted)] ring-1 ring-[color:var(--border)]">
          <FiBookmark />
        </span>
        <span className="mt-2 text-xs text-[color:var(--muted)]">Add a bookmark — paste a URL in edit mode.</span>
      </div>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-mobile-bookmark="true"
      className="flex h-full min-h-0 items-center gap-3 rounded-2xl p-2 transition hover:bg-[color:var(--surface)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
    >
      {/* Brand icon plate exception: bg-white/95 stays per the documented
          brand-icon affordance rule. */}
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/95 ring-1 ring-[color:var(--border)]">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="h-7 w-7 rounded-md object-contain" />
        ) : (
          <FiBookmark className="text-[color:var(--muted)]" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-[color:var(--ink)]">{caption || host}</span>
        {host ? <span className="truncate text-[11px] text-[color:var(--muted)]">{host}</span> : null}
      </span>
    </a>
  );
}
