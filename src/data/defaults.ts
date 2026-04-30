import type { Favorite, HomeWidget, Preferences } from "@/lib/types";

export const defaultFavorites: Favorite[] = [
  { id: "fav-openai", title: "ChatGPT", url: "https://chat.openai.com", icon: "openai" },
  { id: "fav-github", title: "GitHub", url: "https://github.com", icon: "github" },
  { id: "fav-notion", title: "Notion", url: "https://notion.so", icon: "notion" },
  { id: "fav-youtube", title: "YouTube", url: "https://youtube.com", icon: "play" },
  { id: "fav-gmail", title: "Gmail", url: "https://mail.google.com", icon: "gmail" },
  { id: "fav-drive", title: "Drive", url: "https://drive.google.com", icon: "drive" },
  { id: "fav-calendar", title: "Calendar", url: "https://calendar.google.com", icon: "calendar" },
  { id: "fav-reddit", title: "Reddit", url: "https://reddit.com", icon: "reddit" },
  { id: "fav-x", title: "X", url: "https://x.com", icon: "x" },
  { id: "fav-linkedin", title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { id: "fav-spotify", title: "Spotify", url: "https://spotify.com", icon: "spotify" },
  { id: "fav-figma", title: "Figma", url: "https://figma.com", icon: "figma" },
];

export const defaultWidgets: HomeWidget[] = [
  { id: "widget-clock", type: "clock", title: "Bangkok", size: "middle", config: {} },
  { id: "widget-date", type: "date", title: "Today", size: "small", config: {} },
  {
    id: "widget-note",
    type: "notes",
    title: "Scratch note",
    size: "max",
    config: { body: "Drop thoughts here. It autosaves locally." },
  },
  {
    id: "widget-links",
    type: "quickLinks",
    title: "Focus",
    size: "middle",
    config: { links: "Docs,Tasks,Inbox" },
  },
];

export const defaultPreferences: Preferences = {
  searchProvider: "google",
  theme: "linen",
  wallpaperImage: null,
  wallpaperLuminance: null,
  font: "system",
  accentColor: "#339b8e",
  uiOpacity: 76,
  blur: 14,
  contrast: "auto",
  favoriteScale: "cozy",
  widgetScale: "cozy",
  editMode: false,
  zoneOrder: ["search", "favorites", "workspace"],
  zoneVisibility: { search: true, favorites: true, workspace: true },
};
