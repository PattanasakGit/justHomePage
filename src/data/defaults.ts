import type { FavoriteItem, HomeWidget, Preferences } from "@/lib/types";

export const defaultFavorites: FavoriteItem[] = [
  { type: "link", id: "fav-openai", title: "ChatGPT", url: "https://chat.openai.com", icon: "openai" },
  { type: "link", id: "fav-github", title: "GitHub", url: "https://github.com", icon: "github" },
  { type: "link", id: "fav-notion", title: "Notion", url: "https://notion.so", icon: "notion" },
  { type: "link", id: "fav-youtube", title: "YouTube", url: "https://youtube.com", icon: "play" },
  { type: "link", id: "fav-gmail", title: "Gmail", url: "https://mail.google.com", icon: "gmail" },
  { type: "link", id: "fav-drive", title: "Drive", url: "https://drive.google.com", icon: "drive" },
  { type: "link", id: "fav-calendar", title: "Calendar", url: "https://calendar.google.com", icon: "calendar" },
  { type: "link", id: "fav-reddit", title: "Reddit", url: "https://reddit.com", icon: "reddit" },
  { type: "link", id: "fav-x", title: "X", url: "https://x.com", icon: "x" },
  { type: "link", id: "fav-linkedin", title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" },
  { type: "link", id: "fav-spotify", title: "Spotify", url: "https://spotify.com", icon: "spotify" },
  { type: "link", id: "fav-figma", title: "Figma", url: "https://figma.com", icon: "figma" },
];

export const defaultWidgets: HomeWidget[] = [
  {
    id: "widget-clock",
    type: "clock",
    title: "Bangkok",
    variant: "clock-square",
    layout: { x: 0, y: 0, w: 2, h: 2 },
    config: {},
  },
  {
    id: "widget-date",
    type: "date",
    title: "Today",
    variant: "date-square",
    layout: { x: 2, y: 0, w: 2, h: 2 },
    config: {},
  },
  {
    id: "widget-note",
    type: "notes",
    title: "Scratch note",
    variant: "notes-pad",
    layout: { x: 4, y: 0, w: 4, h: 4 },
    config: { body: "Drop a thought. Autosaves locally." },
  },
  {
    id: "widget-links",
    type: "quickLinks",
    title: "Focus",
    variant: "links-row",
    layout: { x: 8, y: 0, w: 4, h: 2 },
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
