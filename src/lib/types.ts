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

export type FontId = "system" | "rounded" | "editorial" | "thaiSoft" | "mono";

export type ContrastMode = "auto" | "dark" | "light";

export type UIScale = "compact" | "cozy" | "large";

export type WidgetType =
  | "clock"
  | "date"
  | "notes"
  | "quickLinks"
  | "pomodoro"
  | "todo"
  | "weather"
  | "bookmark";

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type PomodoroConfig = {
  focusMinutes: number;
  breakMinutes: number;
};

export type TodoConfig = {
  items: TodoItem[];
};

export type WeatherConfig = {
  /** Optional; falls back to geolocation when omitted. */
  city?: string;
};

export type BookmarkConfig = {
  url: string;
  caption: string;
  thumbnail: string | null;
};

export type ClockConfig = Record<string, never>;
export type DateConfig = Record<string, never>;
export type NotesConfig = { body: string };
export type QuickLinksConfig = { links: string };

export type WidgetConfigByType = {
  clock: ClockConfig;
  date: DateConfig;
  notes: NotesConfig;
  quickLinks: QuickLinksConfig;
  pomodoro: PomodoroConfig;
  todo: TodoConfig;
  weather: WeatherConfig;
  bookmark: BookmarkConfig;
};

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
  /**
   * Per-widget configuration. Stored loosely so migrations remain trivial,
   * but each widget component reads/writes through `WidgetConfigByType`.
   */
  config: Record<string, unknown>;
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
