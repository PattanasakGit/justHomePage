"use client";

import { FiCloud, FiMapPin } from "react-icons/fi";
import type { WidgetSize } from "@/lib/types";
import { useLocalEnvironment } from "@/hooks/use-local-environment";
import { useAccentTextColor } from "@/hooks/use-accent-text-color";

const ERROR_TEXT = "Couldn’t reach the sky right now.";
const BLOCKED_TEXT = "Allow location to see weather";

export function WidgetWeather({ size = "compact" }: { size?: WidgetSize }) {
  const env = useLocalEnvironment();
  const accentColor = useAccentTextColor();
  const isLoading = env.status === "idle" || env.status === "locating";
  const isBlocked = env.status === "blocked";
  const isError = env.status === "error";
  const tempLabel = env.temperatureC === null ? "--" : `${env.temperatureC}°`;

  // Footer slot is REPLACED in place when blocked/error so the card height
  // never grows past the parent's clipping bounds. Exactly one footer node
  // renders at any time.
  const footer = isBlocked ? (
    <div
      data-testid="weather-footer"
      role="status"
      className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]"
    >
      <FiMapPin />
      <span className="truncate">{BLOCKED_TEXT}</span>
    </div>
  ) : isError ? (
    <div
      data-testid="weather-footer"
      role="status"
      className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]"
    >
      <FiMapPin />
      <span className="truncate">{ERROR_TEXT}</span>
    </div>
  ) : (
    <div
      data-testid="weather-footer"
      className="flex items-center gap-1.5 text-xs text-[color:var(--muted)]"
    >
      <FiMapPin />
      <span className="truncate">{env.locationLabel}</span>
    </div>
  );

  if (size === "regular") {
    return (
      <div className="relative flex h-full min-h-0 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[12px] bg-gradient-to-b from-[color:var(--accent-soft)] to-transparent opacity-60"
        />
        <div className="relative flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
          <FiCloud className="text-[color:var(--accent)]" />
          Local weather
        </div>
        <div className="relative mt-2 grid min-h-0 flex-1 grid-cols-[auto_1fr] items-start gap-4">
          <div className="flex items-baseline gap-1">
            {isLoading ? (
              <span className="inline-block h-12 w-24 animate-pulse rounded-md bg-[color:var(--surface-strong)]" />
            ) : (
              <>
                <span
                  style={{ color: accentColor }}
                  className="text-6xl font-semibold tabular-nums leading-none tracking-tight"
                >
                  {tempLabel}
                </span>
                <span className="text-sm text-[color:var(--muted)]">C</span>
              </>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-1 self-center">
            <span className="truncate text-sm text-[color:var(--ink)]">
              {isLoading ? "…" : isError ? "Sky unreachable" : isBlocked ? "Awaiting permission" : "Now"}
            </span>
            {!isError && !isBlocked ? (
              <span className="truncate text-[11px] text-[color:var(--muted)]">
                {env.locationLabel}
              </span>
            ) : null}
          </div>
        </div>
        <div className="relative mt-2 shrink-0">{footer}</div>
      </div>
    );
  }

  // compact — four stacked lines, footer replaces in place on error/blocked.
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[12px] bg-gradient-to-b from-[color:var(--accent-soft)] to-transparent opacity-60"
      />
      <div className="relative flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <FiCloud className="text-[color:var(--accent)]" />
        Local weather
      </div>
      <div className="relative mt-2 flex shrink-0 items-baseline gap-2">
        {isLoading ? (
          <span className="inline-block h-10 w-20 animate-pulse rounded-md bg-[color:var(--surface-strong)]" />
        ) : (
          <span
            style={{ color: accentColor }}
            className="text-5xl font-semibold tabular-nums leading-none tracking-tight"
          >
            {tempLabel}
          </span>
        )}
        {!isLoading ? <span className="text-sm text-[color:var(--muted)]">C</span> : null}
      </div>
      <div className="relative mt-1 shrink-0 truncate text-[11px] text-[color:var(--muted)]">
        {isLoading ? "…" : isError ? "Sky unreachable" : isBlocked ? "Awaiting permission" : "Now"}
      </div>
      <div className="relative mt-auto shrink-0 pt-2">{footer}</div>
    </div>
  );
}
