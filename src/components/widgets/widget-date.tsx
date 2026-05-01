"use client";

import type { WidgetSize } from "@/lib/types";

export function WidgetDate({ size = "compact" }: { size?: WidgetSize }) {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const weekday = today.toLocaleDateString(undefined, { weekday: "long" });
  const monthYear = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  if (size === "regular") {
    return (
      <div className="flex h-full items-center gap-4">
        <div className="text-6xl font-bold leading-none tabular-nums tracking-tight text-[color:var(--accent)]">
          {day}
        </div>
        <div className="h-12 w-px bg-[color:var(--border)]" aria-hidden />
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{weekday}</span>
          <span className="mt-1 text-sm text-[color:var(--ink)]">{monthYear}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <span className="text-5xl font-bold leading-none tabular-nums tracking-tight text-[color:var(--accent)]">
        {day}
      </span>
      <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
        {weekday}
      </span>
      <span className="mt-1 text-xs text-[color:var(--muted)]">{monthYear}</span>
    </div>
  );
}
