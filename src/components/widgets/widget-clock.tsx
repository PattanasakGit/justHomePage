"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/lib/date";
import type { UIScale, WidgetSize } from "@/lib/types";

const clockScaleClass: Record<UIScale, string> = {
  compact: "text-4xl",
  cozy: "text-5xl",
  large: "text-6xl",
};

export function WidgetClock({ scale, size = "compact" }: { scale: UIScale; size?: WidgetSize }) {
  const [now, setNow] = useState<Date | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now ? formatClock(now) : "--:--";
  const seconds = now ? now.getSeconds() : 0;
  const showSeconds = size !== "compact";

  return (
    <div className="flex h-full flex-col">
      <div className={`${clockScaleClass[scale]} font-semibold leading-none tracking-tight tabular-nums`}>
        {time}
      </div>
      <div
        aria-hidden
        className="mt-2 h-[2px] overflow-hidden rounded-full bg-[color:var(--surface-strong)]"
      >
        <div
          className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-700 ease-out"
          style={{ width: `${(seconds / 60) * 100}%` }}
        />
      </div>
      {showSeconds ? (
        <div className="mt-3 text-sm text-[color:var(--muted)]">
          {timezone}
          <span className="ml-2 tabular-nums">{String(seconds).padStart(2, "0")}s</span>
        </div>
      ) : (
        <div className="mt-3 text-xs text-[color:var(--muted)]">{timezone}</div>
      )}
    </div>
  );
}
