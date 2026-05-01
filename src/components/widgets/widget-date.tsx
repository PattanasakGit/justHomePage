"use client";

import type { WidgetSize } from "@/lib/types";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

export function WidgetDate({ size = "compact" }: { size?: WidgetSize }) {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const weekdayLong = today.toLocaleDateString(undefined, { weekday: "long" });
  const weekdayShort = today.toLocaleDateString(undefined, { weekday: "short" });
  const monthLong = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const monthShort = today.toLocaleDateString(undefined, { month: "short" });
  const accentColor = useAccentTextColor();

  if (size === "regular") {
    return (
      <div className="flex h-full min-h-0 items-stretch">
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
    <div className="flex h-full min-h-0 flex-col">
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
