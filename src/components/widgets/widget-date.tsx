"use client";

import { formatLongDate } from "@/lib/date";

export function WidgetDate() {
  const today = new Date();
  return (
    <div>
      <div className="text-2xl font-semibold tracking-tight">{formatLongDate(today)}</div>
      <div className="mt-3 text-sm text-[color:var(--muted)]">Make the day small enough to finish.</div>
    </div>
  );
}
