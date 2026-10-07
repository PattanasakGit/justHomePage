import type { Favorite, Folder, HomeWidget, Preferences } from "@/lib/types";
import { DEFAULT_ACCENT_LIGHT } from "@/lib/types";

export const defaultFolders: Folder[] = [
  { id: "folder-work", name: "Work" },
  { id: "folder-learn", name: "Learn" },
  { id: "folder-fun", name: "Fun" },
];

export const defaultFavorites: Favorite[] = [
  { id: "fav-openai", title: "ChatGPT", url: "https://chat.openai.com", icon: "openai", folderId: "folder-work" },
  { id: "fav-github", title: "GitHub", url: "https://github.com", icon: "github", folderId: "folder-work" },
  { id: "fav-notion", title: "Notion", url: "https://notion.so", icon: "notion", folderId: "folder-work" },
  { id: "fav-youtube", title: "YouTube", url: "https://youtube.com", icon: "play", folderId: "folder-fun" },
  { id: "fav-gmail", title: "Gmail", url: "https://mail.google.com", icon: "gmail", folderId: null },
  { id: "fav-drive", title: "Drive", url: "https://drive.google.com", icon: "drive", folderId: null },
  { id: "fav-calendar", title: "Calendar", url: "https://calendar.google.com", icon: "calendar", folderId: null },
  { id: "fav-reddit", title: "Reddit", url: "https://reddit.com", icon: "reddit", folderId: "folder-fun" },
  { id: "fav-x", title: "X", url: "https://x.com", icon: "x", folderId: "folder-fun" },
  { id: "fav-linkedin", title: "LinkedIn", url: "https://linkedin.com", icon: "linkedin", folderId: "folder-work" },
  { id: "fav-spotify", title: "Spotify", url: "https://spotify.com", icon: "spotify", folderId: "folder-fun" },
  { id: "fav-figma", title: "Figma", url: "https://figma.com", icon: "figma", folderId: "folder-learn" },
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
  appearance: "light",
  wallpaperImage: null,
  wallpaperLuminance: null,
  font: "system",
  accentColor: DEFAULT_ACCENT_LIGHT,
  uiOpacity: 62,
  blur: 40,
  contrast: "auto",
  contrastStrength: "normal",
  density: "cozy",
  chrome: "shown",
  favoriteScale: "cozy",
  widgetScale: "cozy",
  editMode: false,
  activeFolderId: null,
};
