"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IconType } from "react-icons";
import { FiClock, FiColumns, FiLink, FiMaximize2, FiMinusSquare, FiTrash2 } from "react-icons/fi";
import { memo, useEffect, useState } from "react";
import { formatClock, formatLongDate } from "@/lib/date";
import type { HomeWidget, UIScale, WidgetSize } from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

const widgetScaleClass: Record<UIScale, { padding: string; clock: string; textarea: string }> = {
  compact: { padding: "p-4", clock: "text-4xl", textarea: "h-[74px]" },
  cozy: { padding: "p-5", clock: "text-5xl", textarea: "h-[92px]" },
  large: { padding: "p-6", clock: "text-6xl", textarea: "h-[116px]" },
};

export const WidgetFrame = memo(function WidgetFrame({ widget, scale }: { widget: HomeWidget; scale: UIScale }) {
  const editMode = useHomeStore((state) => state.preferences.editMode);
  const removeWidget = useHomeStore((state) => state.removeWidget);
  const resizeWidget = useHomeStore((state) => state.resizeWidget);
  const updateWidgetConfig = useHomeStore((state) => state.updateWidgetConfig);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const span = widget.size === "max" ? "sm:col-span-2 lg:col-span-4" : widget.size === "middle" ? "lg:col-span-2" : "";
  const scaleClass = widgetScaleClass[scale];

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`sortable-card ${span} relative overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] ${scaleClass.padding} shadow-tile ui-glass transition ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <WidgetIcon type={widget.type} />
          {widget.title}
        </div>
        {editMode ? (
          <div className="flex gap-1">
            {widgetSizeOptions.map((option) => (
              <button
                key={option.size}
                type="button"
                aria-label={`${option.label} ${widget.title}`}
                onClick={() => resizeWidget(widget.id, option.size)}
                className={`grid h-8 w-8 place-items-center rounded-full transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
                  widget.size === option.size ? "bg-[color:var(--ink)] text-[color:var(--ink-inverse)]" : "text-[color:var(--muted)]"
                }`}
              >
                <option.icon />
              </button>
            ))}
            <button
              type="button"
              aria-label={`Remove ${widget.title}`}
              onClick={() => removeWidget(widget.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--muted)] hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <FiTrash2 />
            </button>
          </div>
        ) : null}
      </header>
      {widget.type === "clock" ? <ClockWidget clockClassName={scaleClass.clock} /> : null}
      {widget.type === "date" ? <DateWidget /> : null}
      {widget.type === "notes" ? (
        <textarea
          aria-label="Note"
          value={widget.config.body ?? ""}
          onChange={(event) => updateWidgetConfig(widget.id, { body: event.target.value })}
          className={`${scaleClass.textarea} w-full resize-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm leading-6 text-[color:var(--ink)] outline-none focus:ring-2 focus:ring-[color:var(--accent)]`}
        />
      ) : null}
      {widget.type === "quickLinks" ? <QuickLinksWidget value={widget.config.links ?? "Docs,Tasks,Inbox"} /> : null}
    </article>
  );
});

const widgetSizeOptions: Array<{ size: WidgetSize; label: string; icon: IconType }> = [
  { size: "small", label: "Small", icon: FiMinusSquare },
  { size: "middle", label: "Middle", icon: FiColumns },
  { size: "max", label: "Max", icon: FiMaximize2 },
];

function WidgetIcon({ type }: { type: HomeWidget["type"] }) {
  if (type === "quickLinks") return <FiLink className="text-[color:var(--accent)]" />;
  return <FiClock className="text-[color:var(--accent)]" />;
}

function ClockWidget({ clockClassName }: { clockClassName: string }) {
  const [now, setNow] = useState(() => new Date());
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <div className={`${clockClassName} font-semibold leading-none`}>{formatClock(now)}</div>
      <div className="mt-3 text-sm text-[color:var(--muted)]">{timezone}</div>
    </div>
  );
}

function DateWidget() {
  const today = new Date();
  return (
    <div>
      <div className="text-2xl font-semibold">{formatLongDate(today)}</div>
      <div className="mt-3 text-sm text-[color:var(--muted)]">Make the day small enough to finish.</div>
    </div>
  );
}

function QuickLinksWidget({ value }: { value: string }) {
  const links = value.split(",").map((item) => item.trim()).filter(Boolean);
  return (
    <div className="grid grid-cols-2 gap-2">
      {links.map((link) => (
        <button
          key={link}
          type="button"
          className="min-h-11 rounded-2xl bg-[color:var(--surface)] px-3 text-left text-sm font-medium text-[color:var(--ink)] hover:bg-[color:var(--surface-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
        >
          {link}
        </button>
      ))}
    </div>
  );
}
