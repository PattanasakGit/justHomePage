"use client";

import { FiCloud, FiMapPin } from "react-icons/fi";
import type { WidgetSize } from "@/lib/types";
import { useLocalEnvironment } from "@/hooks/use-local-environment";

export function WidgetWeather({ size = "compact" }: { size?: WidgetSize }) {
  const env = useLocalEnvironment();
  const isLoading = env.status === "idle" || env.status === "locating";
  const isBlocked = env.status === "blocked";
  const isError = env.status === "error";
  const tempLabel = env.temperatureC === null ? "--" : `${env.temperatureC}°`;

  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[12px] bg-gradient-to-b from-[color:var(--accent-soft)] to-transparent opacity-60"
      />
      <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <FiCloud className="text-[color:var(--accent)]" />
        Local weather
      </div>
      <div className="relative mt-2 flex items-baseline gap-3">
        {isLoading ? (
          <span className="inline-block h-10 w-20 animate-pulse rounded-md bg-[color:var(--surface-strong)]" />
        ) : (
          <span className="text-5xl font-semibold tabular-nums tracking-tight text-[color:var(--accent)]">
            {tempLabel}
          </span>
        )}
        {!isLoading ? <span className="text-sm text-[color:var(--muted)]">C</span> : null}
      </div>
      {size === "regular" && !isLoading && !isError ? (
        <div className="relative mt-1 text-[11px] text-[color:var(--muted)]">
          {env.locationLabel}
        </div>
      ) : null}
      <div className="relative mt-auto flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
        <FiMapPin />
        <span className="truncate">{env.locationLabel}</span>
      </div>
      {isBlocked ? (
        <div className="relative mt-1 text-[11px] text-[color:var(--muted)]">Allow location to see weather</div>
      ) : null}
      {isError ? (
        <div className="relative mt-1 text-[11px] text-[color:var(--muted)]">Couldn&rsquo;t reach the sky right now.</div>
      ) : null}
    </div>
  );
}
