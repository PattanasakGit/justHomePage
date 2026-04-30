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
  | "graphite"
  | "sunset"
  | "rose"
  | "honey"
  | "sand"
  | "mint"
  | "ocean"
  | "lavender"
  | "forest"
  | "slate"
  | "midnight"
  | "nebula"
  | "plum";

export type FontId = "system" | "rounded" | "editorial" | "thaiSoft" | "mono";

export type ContrastMode = "auto" | "dark" | "light";

export type UIScale = "compact" | "cozy" | "large";

export type WidgetType = "clock" | "date" | "notes" | "quickLinks";

export type WidgetSize = "small" | "middle" | "max";

export type Favorite = {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconUrl?: string | null;
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
  wallpaperImage: string | null;
  wallpaperLuminance: number | null;
  font: FontId;
  accentColor: string;
  uiOpacity: number;
  blur: number;
  contrast: ContrastMode;
  favoriteScale: UIScale;
  widgetScale: UIScale;
  editMode: boolean;
};
