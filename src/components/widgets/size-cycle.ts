import type { WidgetSize } from "@/lib/types";

/**
 * Pure helper used by the per-widget cycle resize control.
 *
 * Returns the next allowed size after `current`, wrapping at the end. If
 * `current` is not in `allowed` (e.g. after an invalid migration) the first
 * allowed size is returned. If `allowed` has length 1 the same size is
 * returned — callers should hide the control entirely in that case.
 */
export function nextSize(current: WidgetSize, allowed: WidgetSize[]): WidgetSize {
  if (allowed.length === 0) return current;
  if (allowed.length === 1) return allowed[0];
  const index = allowed.indexOf(current);
  if (index < 0) return allowed[0];
  return allowed[(index + 1) % allowed.length];
}

/**
 * Mirror of `nextSize` but in reverse, used by `shift+r` for back-cycle.
 */
export function previousSize(current: WidgetSize, allowed: WidgetSize[]): WidgetSize {
  if (allowed.length === 0) return current;
  if (allowed.length === 1) return allowed[0];
  const index = allowed.indexOf(current);
  if (index < 0) return allowed[0];
  return allowed[(index - 1 + allowed.length) % allowed.length];
}
