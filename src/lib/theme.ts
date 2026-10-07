import { DARK_THEME_IDS } from "@/data/themes";
import type { Appearance, ContrastMode, ContrastStrength, Preferences } from "./types";

type ThemeVariableInput = Pick<Preferences, "accentColor" | "uiOpacity" | "blur"> & {
  contrast?: Exclude<ContrastMode, "auto">;
  appearance?: Appearance;
  contrastStrength?: ContrastStrength;
};

const HEX_RE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

const WALLPAPER_LIGHT_TEXT_THRESHOLD = 0.55;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string) {
  const match = hex.trim().match(HEX_RE);
  if (!match) return { r: 0, g: 122, b: 255 };
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

export function getReadableTextPair(
  contrast: Exclude<ContrastMode, "auto">,
  contrastStrength: ContrastStrength = "normal",
) {
  if (contrast === "light") {
    if (contrastStrength === "soft") {
      return { ink: "rgba(255,255,255,0.7)", muted: "rgba(235,235,245,0.5)", inkInverse: "#000000" };
    }
    if (contrastStrength === "strong") {
      return { ink: "#ffffff", muted: "rgba(255,255,255,0.85)", inkInverse: "#000000" };
    }
    return { ink: "rgba(255, 255, 255, 0.92)", muted: "rgba(235, 235, 245, 0.6)", inkInverse: "#000000" };
  }

  if (contrastStrength === "soft") {
    return { ink: "rgba(0,0,0,0.62)", muted: "rgba(60,60,67,0.5)", inkInverse: "#ffffff" };
  }
  if (contrastStrength === "strong") {
    return { ink: "#000000", muted: "rgba(0,0,0,0.75)", inkInverse: "#ffffff" };
  }
  return { ink: "rgba(0, 0, 0, 0.88)", muted: "rgba(60, 60, 67, 0.72)", inkInverse: "#ffffff" };
}

export function resolveContrast(
  contrast: ContrastMode,
  hasWallpaper: boolean,
  theme: Preferences["theme"],
  wallpaperLuminance: number | null,
  appearance?: Appearance,
) {
  if (contrast !== "auto") return contrast;
  if (hasWallpaper) {
    if (wallpaperLuminance === null) return "dark";
    return wallpaperLuminance < WALLPAPER_LIGHT_TEXT_THRESHOLD ? "light" : "dark";
  }
  if (appearance) return appearance === "dark" ? "light" : "dark";
  return DARK_THEME_IDS.has(theme) ? "light" : "dark";
}

export function buildThemeVariables({
  accentColor,
  uiOpacity,
  blur,
  contrast = "dark",
  appearance = "light",
}: ThemeVariableInput) {
  const opacity = clamp(uiOpacity, 35, 96) / 100;
  const strongOpacity = clamp(uiOpacity + 14, 42, 98) / 100;
  const tileOpacity = clamp(uiOpacity - 8, 28, 94) / 100;
  const isDarkGlass = contrast === "light" || appearance === "dark";
  const glassRgb = isDarkGlass ? "30, 30, 35" : "255, 255, 255";
  const popupRgb = isDarkGlass ? "28, 28, 30" : "252, 252, 252";
  const surfaceAlpha = opacity;

  return {
    "--accent": accentColor,
    "--accent-text": accentColor,
    "--accent-soft": rgba(accentColor, 0.14),
    "--accent-warm": rgba(accentColor, 0.86),
    "--panel": `rgba(${glassRgb}, ${opacity.toFixed(2)})`,
    "--surface": `rgba(${glassRgb}, ${Math.max(0.3, opacity - 0.08).toFixed(2)})`,
    "--surface-strong": `rgba(${glassRgb}, ${strongOpacity.toFixed(2)})`,
    "--tile": `rgba(${glassRgb}, ${tileOpacity.toFixed(2)})`,
    "--popup": `rgba(${popupRgb}, 0.96)`,
    "--surface-alpha": surfaceAlpha.toFixed(2),
    "--blur": `${clamp(blur, 0, 60)}px`,
    "--ui-blur": `${clamp(blur, 0, 60)}px`,
    "--ui-blur-tile": `${Math.max(clamp(blur, 0, 60) * 0.5, 12)}px`,
    "--saturate": "1.8",
    "--veil": appearance === "dark" ? "0.28" : "0.08",
  } as const;
}

export function densityCssVars(density: Preferences["density"]) {
  if (density === "comfort") return { "--grid-gap": "16px", "--tile-size": "108px" } as const;
  if (density === "compact") return { "--grid-gap": "8px", "--tile-size": "80px" } as const;
  return { "--grid-gap": "12px", "--tile-size": "96px" } as const;
}
