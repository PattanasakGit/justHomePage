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
  defaultSize: WidgetSize;
  defaultConfig: Record<string, unknown>;
};

export const widgetRegistry: Record<WidgetType, WidgetMeta> = {
  clock: {
    label: "Clock",
    defaultTitle: "Clock",
    icon: FiClock,
    defaultSize: "middle",
    defaultConfig: {} satisfies WidgetConfigByType["clock"],
  },
  date: {
    label: "Date",
    defaultTitle: "Today",
    icon: FiCalendar,
    defaultSize: "small",
    defaultConfig: {} satisfies WidgetConfigByType["date"],
  },
  notes: {
    label: "Notes",
    defaultTitle: "Note",
    icon: FiEdit3,
    defaultSize: "max",
    defaultConfig: { body: "" } satisfies WidgetConfigByType["notes"],
  },
  quickLinks: {
    label: "Quick links",
    defaultTitle: "Focus",
    icon: FiLink,
    defaultSize: "middle",
    defaultConfig: { links: "Docs,Tasks,Inbox" } satisfies WidgetConfigByType["quickLinks"],
  },
  pomodoro: {
    label: "Pomodoro",
    defaultTitle: "Focus timer",
    icon: FiTarget,
    defaultSize: "middle",
    defaultConfig: { focusMinutes: 25, breakMinutes: 5 } satisfies WidgetConfigByType["pomodoro"],
  },
  todo: {
    label: "Todo",
    defaultTitle: "Today's list",
    icon: FiCheckSquare,
    defaultSize: "middle",
    defaultConfig: { items: [] } satisfies WidgetConfigByType["todo"],
  },
  weather: {
    label: "Weather",
    defaultTitle: "Weather",
    icon: FiCloud,
    defaultSize: "small",
    defaultConfig: {} satisfies WidgetConfigByType["weather"],
  },
  bookmark: {
    label: "Bookmark",
    defaultTitle: "Pinned link",
    icon: FiBookmark,
    defaultSize: "small",
    defaultConfig: { url: "", caption: "", thumbnail: null } satisfies WidgetConfigByType["bookmark"],
  },
};

export function getWidgetMeta(type: WidgetType): WidgetMeta {
  return widgetRegistry[type];
}
