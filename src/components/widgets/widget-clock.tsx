"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { formatClock } from "@/lib/date";
import type { UIScale, WidgetSize } from "@/lib/types";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

const heroScale: Record<UIScale, { compact: string; regular: string }> = {
  compact: { compact: "text-4xl", regular: "text-6xl" },
  cozy: { compact: "text-5xl", regular: "text-7xl" },
  large: { compact: "text-6xl", regular: "text-7xl" },
};

function formatTimezoneShort(timezone: string) {
  // e.g. "America/Los_Angeles" → "Los Angeles" → take last 2 letters of last word
  const parts = timezone.split("/");
  const tail = parts[parts.length - 1] || timezone;
  return tail.replace(/_/g, " ");
}

export function WidgetClock({
  scale,
  size = "compact",
  isMobile = false,
}: {
  scale: UIScale;
  size?: WidgetSize;
  isMobile?: boolean;
}) {
  const [now, setNow] = useState<Date | null>(null);
  const accentColor = useAccentTextColor();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now ? formatClock(now) : "--:--";
  const seconds = now ? now.getSeconds() : 0;
  const weekdayShort = now ? now.toLocaleDateString(undefined, { weekday: "short" }) : "";
  const meridiem = now ? (now.getHours() >= 12 ? "PM" : "AM") : "—";
  const tzShort = formatTimezoneShort(timezone);
  const heroClass = heroScale[scale][size === "regular" ? "regular" : "compact"];

  if (isMobile) {
    // Landscape strip: identity glyph + city label + HH:MM right-aligned.
    // Hero shrinks to text-3xl so it fits inside a 60 px row without clipping.
    return (
      <div
        data-testid="mobile-row"
        className="flex h-full min-h-0 items-center gap-3 px-3 py-2"
      >
        <FiClock className="shrink-0 text-[color:var(--accent)]" />
        <span className="min-w-0 flex-1 truncate text-xs text-[color:var(--muted)]">{tzShort}</span>
        <span
          style={{ color: accentColor }}
          className="ml-auto text-3xl font-semibold leading-none tabular-nums"
        >
          {time}
        </span>
      </div>
    );
  }

  if (size === "regular") {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_auto] items-baseline gap-4">
          <div
            style={{ color: accentColor }}
            className={`${heroClass} font-semibold leading-none tracking-tight tabular-nums`}
          >
            {time}
          </div>
          <div
            aria-hidden
            className="self-stretch w-px bg-[color:var(--border)]"
          />
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{meridiem}</span>
            <span className="truncate text-xs text-[color:var(--ink)]">{weekdayShort}</span>
            <span className="truncate text-[11px] text-[color:var(--muted)]">{tzShort}</span>
          </div>
        </div>
        <div
          aria-hidden
          className="mt-3 h-[2px] shrink-0 overflow-hidden rounded-full bg-[color:var(--surface-strong)]"
        >
          <div
            className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-700 ease-out"
            style={{ width: `${(seconds / 60) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // compact — vertical stack; hero, accent seconds bar, short-form secondary line.
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        style={{ color: accentColor }}
        className={`${heroClass} font-semibold leading-none tracking-tight tabular-nums`}
      >
        {time}
      </div>
      <div
        aria-hidden
        className="mt-2 h-[2px] shrink-0 overflow-hidden rounded-full bg-[color:var(--surface-strong)]"
      >
        <div
          className="h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-700 ease-out"
          style={{ width: `${(seconds / 60) * 100}%` }}
        />
      </div>
      <div className="mt-auto flex shrink-0 items-center justify-between gap-2 pt-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <span className="truncate">{weekdayShort || "—"}</span>
        <span className="truncate normal-case tracking-normal">{tzShort}</span>
      </div>
    </div>
  );
}
