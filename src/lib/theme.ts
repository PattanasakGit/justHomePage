import { DARK_THEME_IDS } from "@/data/themes";
import type { ContrastMode, Preferences } from "./types";

type ThemeVariableInput = Pick<Preferences, "accentColor" | "uiOpacity" | "blur"> & {
  contrast?: Exclude<ContrastMode, "auto">;
};

const HEX_RE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const WALLPAPER_LIGHT_TEXT_THRESHOLD = 0.55;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const match = hex.trim().match(HEX_RE);
  if (!match) return { r: 51, g: 155, b: 142 };
  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/**
 * Approximate relative luminance of a color in the 0–1 range.
 * Uses the WCAG-style channel weighting (linearised RGB).
 */
function relativeLuminance(hex: string): number | null {
  const match = hex.trim().match(HEX_RE);
  if (!match) return null;
  const channel = (raw: number) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = channel(Number.parseInt(match[1], 16));
  const g = channel(Number.parseInt(match[2], 16));
  const b = channel(Number.parseInt(match[3], 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ACCENT_LIGHT_THRESHOLD = 0.85;

/**
 * Whether the given accent colour is dark enough to remain legible when
 * used as fill on a near-white surface (e.g. the `paper` theme tile).
 *
 * Returns `false` only when the accent's relative luminance exceeds
 * {@link ACCENT_LIGHT_THRESHOLD} (≈ pastel yellow on white), which is the
 * cue for hero digits to fall back to `var(--ink)` instead.
 *
 * Malformed input is treated as "safe to use" — we don't want a parsing
 * miss to silently strip accent colour everywhere.
 */
export function accentReadsOnLight(color: string): boolean {
  const luminance = relativeLuminance(color);
  if (luminance === null) return true;
  return luminance <= ACCENT_LIGHT_THRESHOLD;
}

export function getReadableTextPair(contrast: Exclude<ContrastMode, "auto">) {
  if (contrast === "light") {
    return { ink: "#f7faf6", muted: "#d8e0dc", inkInverse: "#17201b" };
  }

  return { ink: "#17201b", muted: "#66736c", inkInverse: "#f7faf6" };
}

export function resolveContrast(
  contrast: ContrastMode,
  hasWallpaper: boolean,
  theme: Preferences["theme"],
  wallpaperLuminance: number | null,
) {
  if (contrast !== "auto") return contrast;
  if (hasWallpaper) {
    if (wallpaperLuminance === null) return "dark";
    return wallpaperLuminance < WALLPAPER_LIGHT_TEXT_THRESHOLD ? "light" : "dark";
  }
  return DARK_THEME_IDS.has(theme) ? "light" : "dark";
}

export function buildThemeVariables({ accentColor, uiOpacity, blur, contrast = "dark" }: ThemeVariableInput) {
  const opacity = clamp(uiOpacity, 42, 96) / 100;
  const strongOpacity = clamp(uiOpacity + 14, 50, 98) / 100;
  const tileOpacity = clamp(uiOpacity - 8, 34, 94) / 100;
  const glassRgb = contrast === "light" ? "18, 25, 22" : "255, 255, 255";
  const popupRgb = contrast === "light" ? "22, 28, 25" : "252, 252, 252";

  return {
    "--accent": accentColor,
    "--accent-soft": rgba(accentColor, 0.14),
    "--accent-warm": rgba(accentColor, 0.86),
    "--panel": `rgba(${glassRgb}, ${opacity.toFixed(2)})`,
    "--surface": `rgba(${glassRgb}, ${Math.max(0.3, opacity - 0.08).toFixed(2)})`,
    "--surface-strong": `rgba(${glassRgb}, ${strongOpacity.toFixed(2)})`,
    "--tile": `rgba(${glassRgb}, ${tileOpacity.toFixed(2)})`,
    "--popup": `rgba(${popupRgb}, 0.96)`,
    "--ui-blur": `${clamp(blur, 0, 28)}px`,
  } as const;
}
