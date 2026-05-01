import type { IconType } from "react-icons";
import {
  FiBookmark,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiCloud,
  FiEdit3,
  FiLink,
  FiTarget,
} from "react-icons/fi";
import type { WidgetConfigByType, WidgetSize, WidgetType } from "@/lib/types";

export type WidgetMeta = {
  label: string;
  defaultTitle: string;
  icon: IconType;
  /** Default size for newly added widgets; must be in `allowedSizes`. */
  defaultSize: WidgetSize;
  /** Curated list of sizes this widget supports — used by the cycle resize control. */
  allowedSizes: WidgetSize[];
  defaultConfig: Record<string, unknown>;
};

export const widgetRegistry: Record<WidgetType, WidgetMeta> = {
  clock: {
    label: "Clock",
    defaultTitle: "Clock",
    icon: FiClock,
    defaultSize: "compact",
    allowedSizes: ["compact", "regular"],
    defaultConfig: {} satisfies WidgetConfigByType["clock"],
  },
  date: {
    label: "Date",
    defaultTitle: "Today",
    icon: FiCalendar,
    defaultSize: "compact",
    allowedSizes: ["compact", "regular"],
    defaultConfig: {} satisfies WidgetConfigByType["date"],
  },
  notes: {
    label: "Notes",
    defaultTitle: "Note",
    icon: FiEdit3,
    defaultSize: "tall",
    allowedSizes: ["regular", "tall", "hero"],
    defaultConfig: { body: "" } satisfies WidgetConfigByType["notes"],
  },
  quickLinks: {
    label: "Quick links",
    defaultTitle: "Focus",
    icon: FiLink,
    defaultSize: "regular",
    allowedSizes: ["regular", "wide"],
    defaultConfig: { links: "Docs,Tasks,Inbox" } satisfies WidgetConfigByType["quickLinks"],
  },
  pomodoro: {
    label: "Pomodoro",
    defaultTitle: "Focus timer",
    icon: FiTarget,
    defaultSize: "regular",
    allowedSizes: ["regular", "wide"],
    defaultConfig: { focusMinutes: 25, breakMinutes: 5 } satisfies WidgetConfigByType["pomodoro"],
  },
  todo: {
    label: "Todo",
    defaultTitle: "Today's list",
    icon: FiCheckSquare,
    defaultSize: "regular",
    allowedSizes: ["regular", "tall"],
    defaultConfig: { items: [] } satisfies WidgetConfigByType["todo"],
  },
  weather: {
    label: "Weather",
    defaultTitle: "Weather",
    icon: FiCloud,
    defaultSize: "compact",
    allowedSizes: ["compact", "regular"],
    defaultConfig: {} satisfies WidgetConfigByType["weather"],
  },
  bookmark: {
    label: "Bookmark",
    defaultTitle: "Pinned link",
    icon: FiBookmark,
    defaultSize: "compact",
    allowedSizes: ["compact", "regular"],
    defaultConfig: { url: "", caption: "", thumbnail: null } satisfies WidgetConfigByType["bookmark"],
  },
};

export function getWidgetMeta(type: WidgetType): WidgetMeta {
  return widgetRegistry[type];
}

/** Legacy (pre-v6) → v6 vocabulary map. */
export const legacySizeMap: Record<string, WidgetSize> = {
  small: "compact",
  middle: "regular",
  max: "wide",
};

/**
 * Resolve a possibly-legacy or possibly-invalid size for a widget type.
 *  1. Pass-through if the size is already valid for the type's allowedSizes.
 *  2. Otherwise map via `legacySizeMap`.
 *  3. If still not allowed, fall back to the type's defaultSize.
 */
export function resolveWidgetSize(type: WidgetType, raw: unknown): WidgetSize {
  const meta = widgetRegistry[type];
  if (!meta) return "regular";
  const value = typeof raw === "string" ? raw : "";
  if ((meta.allowedSizes as string[]).includes(value)) {
    return value as WidgetSize;
  }
  const mapped = legacySizeMap[value];
  if (mapped && meta.allowedSizes.includes(mapped)) {
    return mapped;
  }
  return meta.defaultSize;
}
