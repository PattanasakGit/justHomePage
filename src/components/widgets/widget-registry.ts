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
import type {
  WidgetConfigByType,
  WidgetSize,
  WidgetType,
  WidgetVariant,
  WidgetVariantSpec,
} from "@/lib/types";

export type WidgetMeta = {
  label: string;
  defaultTitle: string;
  icon: IconType;
  /** First-fit placement uses the default variant's `{w, h}`. */
  defaultVariant: WidgetVariant;
  /** Curated list of {label, w, h, min/max} the user can pick from. */
  variants: WidgetVariantSpec[];
  defaultConfig: Record<string, unknown>;
};

export const widgetRegistry: Record<WidgetType, WidgetMeta> = {
  clock: {
    label: "Clock",
    defaultTitle: "Clock",
    icon: FiClock,
    defaultVariant: "clock-square",
    variants: [
      {
        id: "clock-square",
        label: "Square",
        w: 2,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 3,
        description: "Glanceable time",
      },
      {
        id: "clock-banner",
        label: "Banner",
        w: 4,
        h: 1,
        minW: 3,
        minH: 1,
        maxW: 8,
        maxH: 2,
        description: "Top-of-page strip",
      },
      {
        id: "clock-display",
        label: "Display",
        w: 4,
        h: 3,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 4,
        description: "Full digits + tz + seconds",
      },
    ],
    defaultConfig: {} satisfies WidgetConfigByType["clock"],
  },
  date: {
    label: "Date",
    defaultTitle: "Today",
    icon: FiCalendar,
    defaultVariant: "date-square",
    variants: [
      {
        id: "date-square",
        label: "Square",
        w: 2,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 3,
        maxH: 3,
        description: "Day + date stack",
      },
      {
        id: "date-banner",
        label: "Banner",
        w: 4,
        h: 1,
        minW: 3,
        minH: 1,
        maxW: 6,
        maxH: 2,
        description: "Date strip",
      },
      {
        id: "date-calendar",
        label: "Calendar",
        w: 4,
        h: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 5,
        description: "Mini month grid",
      },
    ],
    defaultConfig: {} satisfies WidgetConfigByType["date"],
  },
  weather: {
    label: "Weather",
    defaultTitle: "Weather",
    icon: FiCloud,
    defaultVariant: "weather-square",
    variants: [
      {
        id: "weather-square",
        label: "Square",
        w: 2,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 3,
        maxH: 3,
        description: "Icon + temp",
      },
      {
        id: "weather-detail",
        label: "Detail",
        w: 4,
        h: 2,
        minW: 3,
        minH: 2,
        maxW: 6,
        maxH: 3,
        description: "Condition + hi/lo",
      },
      {
        id: "weather-forecast",
        label: "Forecast",
        w: 6,
        h: 3,
        minW: 4,
        minH: 2,
        maxW: 8,
        maxH: 4,
        description: "Hourly strip",
      },
    ],
    defaultConfig: {} satisfies WidgetConfigByType["weather"],
  },
  bookmark: {
    label: "Bookmark",
    defaultTitle: "Pinned link",
    icon: FiBookmark,
    defaultVariant: "bookmark-tile",
    variants: [
      {
        id: "bookmark-tile",
        label: "Tile",
        w: 2,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 3,
        maxH: 3,
        description: "Thumb + caption",
      },
      {
        id: "bookmark-card",
        label: "Card",
        w: 3,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 3,
        description: "Bigger thumb + room for desc",
      },
      {
        id: "bookmark-banner",
        label: "Banner",
        w: 6,
        h: 2,
        minW: 4,
        minH: 2,
        maxW: 8,
        maxH: 3,
        description: "Hero pin",
      },
    ],
    defaultConfig: { url: "", caption: "", thumbnail: null } satisfies WidgetConfigByType["bookmark"],
  },
  quickLinks: {
    label: "Quick links",
    defaultTitle: "Focus",
    icon: FiLink,
    defaultVariant: "links-row",
    variants: [
      {
        id: "links-row",
        label: "Row",
        w: 4,
        h: 2,
        minW: 3,
        minH: 2,
        maxW: 8,
        maxH: 2,
        description: "4–6 chips inline",
      },
      {
        id: "links-grid",
        label: "Grid",
        w: 4,
        h: 3,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 4,
        description: "8–12 chips wrap",
      },
      {
        id: "links-strip",
        label: "Strip",
        w: 8,
        h: 1,
        minW: 4,
        minH: 1,
        maxW: 12,
        maxH: 2,
        description: "Top-bar shortcuts",
      },
    ],
    defaultConfig: { links: "Docs,Tasks,Inbox" } satisfies WidgetConfigByType["quickLinks"],
  },
  pomodoro: {
    label: "Pomodoro",
    defaultTitle: "Focus timer",
    icon: FiTarget,
    defaultVariant: "pomo-card",
    variants: [
      {
        id: "pomo-card",
        label: "Card",
        w: 4,
        h: 3,
        minW: 3,
        minH: 3,
        maxW: 5,
        maxH: 4,
        description: "Ring + start",
      },
      {
        id: "pomo-compact",
        label: "Compact",
        w: 3,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 2,
        description: "Digits only",
      },
      {
        id: "pomo-wide",
        label: "Wide",
        w: 6,
        h: 3,
        minW: 5,
        minH: 3,
        maxW: 8,
        maxH: 4,
        description: "Ring + focus/break controls",
      },
    ],
    defaultConfig: { focusMinutes: 25, breakMinutes: 5 } satisfies WidgetConfigByType["pomodoro"],
  },
  todo: {
    label: "Todo",
    defaultTitle: "Today's list",
    icon: FiCheckSquare,
    defaultVariant: "todo-list",
    variants: [
      {
        id: "todo-list",
        label: "List",
        w: 4,
        h: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 5,
        description: "~6 rows + add",
      },
      {
        id: "todo-compact",
        label: "Compact",
        w: 3,
        h: 3,
        minW: 3,
        minH: 2,
        maxW: 4,
        maxH: 4,
        description: "Top-3 today",
      },
      {
        id: "todo-board",
        label: "Board",
        w: 6,
        h: 5,
        minW: 4,
        minH: 4,
        maxW: 8,
        maxH: 6,
        description: "~12 rows + sections",
      },
    ],
    defaultConfig: { items: [] } satisfies WidgetConfigByType["todo"],
  },
  notes: {
    label: "Notes",
    defaultTitle: "Note",
    icon: FiEdit3,
    defaultVariant: "notes-pad",
    variants: [
      {
        id: "notes-pad",
        label: "Pad",
        w: 4,
        h: 4,
        minW: 3,
        minH: 3,
        maxW: 6,
        maxH: 5,
        description: "Quick scratch",
      },
      {
        id: "notes-strip",
        label: "Strip",
        w: 6,
        h: 2,
        minW: 4,
        minH: 2,
        maxW: 8,
        maxH: 3,
        description: "One-liner reminder",
      },
      {
        id: "notes-page",
        label: "Page",
        w: 6,
        h: 6,
        minW: 4,
        minH: 4,
        maxW: 8,
        maxH: 8,
        description: "Long-form",
      },
    ],
    defaultConfig: { body: "" } satisfies WidgetConfigByType["notes"],
  },
};

export function getWidgetMeta(type: WidgetType): WidgetMeta {
  return widgetRegistry[type];
}

/**
 * Resolve a possibly-legacy variant id for a widget type. If unknown, returns
 * the type's default variant.
 */
export function resolveVariant(type: WidgetType, raw: unknown): WidgetVariantSpec {
  const meta = widgetRegistry[type];
  const value = typeof raw === "string" ? raw : "";
  const found = meta.variants.find((v) => v.id === value);
  return found ?? meta.variants.find((v) => v.id === meta.defaultVariant)!;
}

// ---------------------------------------------------------------------------
// Legacy (pre-v7) → v7 migration helpers
// ---------------------------------------------------------------------------

/** Legacy (pre-v6) → v6 size vocabulary map (still used by the v7 migration). */
const legacySizeMap: Record<string, WidgetSize> = {
  small: "compact",
  middle: "regular",
  max: "wide",
};

/** Per-(type, legacy size) → variant id (UX-lead spec §8). */
const legacySizeToVariant: Record<WidgetType, Record<WidgetSize, string>> = {
  clock: {
    compact: "clock-square",
    regular: "clock-square",
    wide: "clock-banner",
    tall: "clock-display",
    hero: "clock-display",
  },
  date: {
    compact: "date-square",
    regular: "date-square",
    wide: "date-banner",
    tall: "date-square",
    hero: "date-calendar",
  },
  weather: {
    compact: "weather-square",
    regular: "weather-detail",
    wide: "weather-detail",
    tall: "weather-square",
    hero: "weather-forecast",
  },
  bookmark: {
    compact: "bookmark-tile",
    regular: "bookmark-card",
    wide: "bookmark-banner",
    tall: "bookmark-tile",
    hero: "bookmark-banner",
  },
  quickLinks: {
    compact: "links-row",
    regular: "links-row",
    wide: "links-grid",
    tall: "links-grid",
    hero: "links-grid",
  },
  pomodoro: {
    compact: "pomo-compact",
    regular: "pomo-card",
    wide: "pomo-wide",
    tall: "pomo-card",
    hero: "pomo-wide",
  },
  todo: {
    compact: "todo-compact",
    regular: "todo-list",
    wide: "todo-list",
    tall: "todo-list",
    hero: "todo-board",
  },
  notes: {
    compact: "notes-pad",
    regular: "notes-pad",
    wide: "notes-strip",
    tall: "notes-pad",
    hero: "notes-page",
  },
};

/** Coerce an unknown legacy size value into the v6 vocabulary, or `null`. */
function normaliseLegacySize(type: WidgetType, raw: unknown): WidgetSize | null {
  if (typeof raw !== "string") return null;
  if (raw in legacySizeToVariant[type]) return raw as WidgetSize;
  const mapped = legacySizeMap[raw];
  if (mapped) return mapped;
  return null;
}

/**
 * Map a legacy `(type, size)` pair to the v7 `{variant, w, h}` triple per the
 * UX-lead spec table. Unknown values fall back to the type's default variant.
 */
export function legacySizeToVariantSpec(
  type: WidgetType,
  size: unknown,
): { variant: string; w: number; h: number } {
  const meta = widgetRegistry[type];
  if (!meta) {
    return { variant: "unknown", w: 2, h: 2 };
  }
  const normalised = normaliseLegacySize(type, size);
  const variantId = normalised
    ? legacySizeToVariant[type][normalised] ?? meta.defaultVariant
    : meta.defaultVariant;
  const variant = meta.variants.find((v) => v.id === variantId) ?? meta.variants[0];
  return { variant: variant.id, w: variant.w, h: variant.h };
}
