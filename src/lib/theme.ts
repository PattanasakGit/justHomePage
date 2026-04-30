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
