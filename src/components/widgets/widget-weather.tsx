"use client";

import { FiCloud, FiMapPin } from "react-icons/fi";
import { useLocalEnvironment } from "@/hooks/use-local-environment";

export function WidgetWeather() {
  const env = useLocalEnvironment();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
        <FiCloud className="text-[color:var(--accent)]" />
        Local weather
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums tracking-tight">
          {env.temperatureC === null ? "--" : `${env.temperatureC}°`}
        </span>
        <span className="text-sm text-[color:var(--muted)]">C</span>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
        <FiMapPin />
        <span className="truncate">{env.locationLabel}</span>
      </div>
      {env.status === "blocked" ? (
        <div className="mt-1 text-[11px] text-[color:var(--muted)]">Allow location to see weather.</div>
      ) : null}
    </div>
  );
}
