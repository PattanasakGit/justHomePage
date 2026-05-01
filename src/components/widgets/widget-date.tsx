"use client";

import { FiCalendar } from "react-icons/fi";
import type { WidgetSize } from "@/lib/types";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

export function WidgetDate({
  size = "compact",
  isMobile = false,
}: {
  size?: WidgetSize;
  isMobile?: boolean;
}) {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const weekdayLong = today.toLocaleDateString(undefined, { weekday: "long" });
  const weekdayShort = today.toLocaleDateString(undefined, { weekday: "short" });
  const monthLong = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthShort = today.toLocaleDateString(undefined, { month: "short" });
  const accentColor = useAccentTextColor();

  if (isMobile) {
    // Landscape strip — keep the day digits at text-3xl so they fit a
    // single-row cell at 60 px height.
    const weekdayMonth = `${weekdayShort}, ${monthShort}`;
    return (
      <div
        data-testid="mobile-row"
        className="flex h-full min-h-0 items-center gap-3 px-3 py-2"
      >
        <FiCalendar className="shrink-0 text-[color:var(--accent)]" />
        <span className="min-w-0 flex-1 truncate text-xs text-[color:var(--muted)]">
          {weekdayMonth}
        </span>
        <span
          style={{ color: accentColor }}
          className="ml-auto text-3xl font-bold leading-none tabular-nums"
        >
          {day}
        </span>
      </div>
    );
  }

  if (size === "regular") {
    return (
      <div className="flex h-full min-h-0 flex-col items-stretch overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-[auto_1fr] items-center gap-4">
          <div
            style={{ color: accentColor }}
            className="text-7xl font-bold leading-none tabular-nums tracking-tight"
          >
            {day}
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-l border-[color:var(--border)] pl-4">
            <span className="truncate text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {weekdayLong}
            </span>
            <span className="truncate text-sm text-[color:var(--ink)]">{monthLong}</span>
          </div>
        </div>
      </div>
    );
  }

  // compact — oversized day, short weekday, short month.
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <span
        style={{ color: accentColor }}
        className="text-6xl font-bold leading-none tabular-nums tracking-tight"
      >
        {day}
      </span>
      <span className="mt-2 truncate text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {weekdayShort}
      </span>
      <span className="mt-1 truncate text-xs text-[color:var(--muted)]">{monthShort}</span>
    </div>
  );
}
