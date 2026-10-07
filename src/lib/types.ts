export type SearchProviderId =
  | "google"
  | "duckduckgo"
  | "bing"
  | "brave"
  | "youtube"
  | "github"
  | "chatgpt"
  | "claude"
  | "gemini"
  | "copilot"
  | "perplexity"
  | "you"
  | "phind";

export type BackgroundId =
  | "linen"
  | "aurora"
  | "sky"
  | "sunset"
  | "rose"
  | "honey"
  | "sand"
  | "mint"
  | "lavender"
  | "slate"
  | "paper"
  | "mist"
  | "blush"
  | "dawn"
  | "ivory"
  | "graphite"
  | "ocean"
  | "forest"
  | "midnight"
  | "nebula"
  | "plum"
  | "noir"
  | "inferno"
  | "neonCyan"
  | "neonPink"
  | "neonViolet"
  | "abyss"
  | "cyber";

export type ThemeCategory = "light" | "dark";

export type Appearance = "light" | "dark";

export type FontId = "system" | "rounded" | "editorial" | "thaiSoft" | "mono";

export type IconSize = "sm" | "md" | "lg" | "xl";

export type ContrastMode = "auto" | "dark" | "light";

export type ContrastStrength = "soft" | "normal" | "strong";

export type Density = "comfort" | "cozy" | "compact";

export type ChromeVisibility = "shown" | "hidden";

export type UIScale = "compact" | "cozy" | "large";

export type WidgetType = "clock" | "date" | "notes" | "quickLinks";

export type WidgetSize = "small" | "middle" | "max";

export type Folder = {
  id: string;
  name: string;
};

export type Favorite = {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconUrl?: string | null;
  folderId?: string | null;
};

export type FavoriteInput = Omit<Favorite, "id">;

export type HomeWidget = {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  config: Record<string, string>;
};

export type Preferences = {
  searchProvider: SearchProviderId;
  theme: BackgroundId;
  appearance: Appearance;
  wallpaperImage: string | null;
  wallpaperLuminance: number | null;
  font: FontId;
  accentColor: string;
  uiOpacity: number;
  blur: number;
  contrast: ContrastMode;
  contrastStrength: ContrastStrength;
  density: Density;
  chrome: ChromeVisibility;
  favoriteScale: UIScale;
  widgetScale: UIScale;
  editMode: boolean;
  activeFolderId: string | null;
  iconSize: IconSize;
  librarySidebarOpen: boolean;
};

export const DEFAULT_ACCENT_LIGHT = "#0071e3";
export const DEFAULT_ACCENT_DARK = "#2997ff";
export const ALL_FOLDER_ID = null;
