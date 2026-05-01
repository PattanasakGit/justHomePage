"use client";

import { useEffect, useState } from "react";
import { accentReadsOnLight } from "@/lib/theme";
import { useHomeStore } from "@/stores/home-store";

/**
 * Returns the CSS color value for hero digits that USE `--accent` as fill.
 * Falls back to `var(--ink)` when the active accent is too light to read on
 * a near-white surface (e.g. saturated yellow on the `paper` theme).
 *
 * Subscribes to `preferences.accentColor` so the swap is reactive on theme
 * change. Defaults to `var(--accent)` until mounted (SSR-safe).
 */
export function useAccentTextColor(): string {
  const accent = useHomeStore((state) => state.preferences.accentColor);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "var(--accent)";
  return accentReadsOnLight(accent) ? "var(--accent)" : "var(--ink)";
}
