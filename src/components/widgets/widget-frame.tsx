"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { IconType } from "react-icons";
import { FiColumns, FiMaximize2, FiMinusSquare, FiTrash2 } from "react-icons/fi";
import { memo } from "react";
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
} from "@/lib/types";
import { useHomeStore } from "@/stores/home-store";

const widgetScalePadding: Record<UIScale, string> = {
  compact: "p-4",
  cozy: "p-5",
  large: "p-6",
};

export const WidgetFrame = memo(function WidgetFrame({ widget, scale }: { widget: HomeWidget; scale: UIScale }) {
  const editMode = useHomeStore((state) => state.preferences.editMode);
  const removeWidget = useHomeStore((state) => state.removeWidget);
  const resizeWidget = useHomeStore((state) => state.resizeWidget);
  const updateWidgetConfig = useHomeStore((state) => state.updateWidgetConfig);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const span = widget.size === "max" ? "sm:col-span-2 lg:col-span-4" : widget.size === "middle" ? "lg:col-span-2" : "";
  const meta = getWidgetMeta(widget.type);
  const Icon = meta.icon;

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`sortable-card ${span} relative overflow-hidden rounded-[18px] border border-[color:var(--border)] bg-[color:var(--tile)] ${widgetScalePadding[scale]} shadow-tile ui-glass transition ${
        isDragging ? "opacity-60" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="text-[color:var(--accent)]" />
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
      <WidgetBody
        widget={widget}
        scale={scale}
        editMode={editMode}
        onConfigChange={(patch) => updateWidgetConfig(widget.id, patch)}
      />
    </article>
  );
});

const widgetSizeOptions: Array<{ size: WidgetSize; label: string; icon: IconType }> = [
  { size: "small", label: "Small", icon: FiMinusSquare },
  { size: "middle", label: "Middle", icon: FiColumns },
  { size: "max", label: "Max", icon: FiMaximize2 },
];

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
      return <WidgetClock scale={scale} />;
    case "date":
      return <WidgetDate />;
    case "notes":
      return (
        <WidgetNotes
          scale={scale}
          body={typeof widget.config.body === "string" ? widget.config.body : ""}
          onChange={(body) => onConfigChange({ body })}
        />
      );
    case "quickLinks":
      return (
        <WidgetQuickLinks
          value={typeof widget.config.links === "string" ? widget.config.links : "Docs,Tasks,Inbox"}
        />
      );
    case "pomodoro":
      return (
        <WidgetPomodoro
          config={widget.config as Partial<PomodoroConfig>}
        />
      );
    case "todo": {
      const items = Array.isArray(widget.config.items) ? (widget.config.items as TodoItem[]) : [];
      return (
        <WidgetTodo items={items} onChange={(next) => onConfigChange({ items: next })} />
      );
    }
    case "weather":
      return <WidgetWeather />;
    case "bookmark":
      return (
        <WidgetBookmark
          config={widget.config as Partial<BookmarkConfig>}
          editing={editMode}
          onChange={(patch) => onConfigChange(patch)}
        />
      );
    default:
      return null;
  }
}
