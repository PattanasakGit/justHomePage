import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAirplay,
  FiBell,
  FiBook,
  FiBookmark,
  FiBookOpen,
  FiBox,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiCloud,
  FiCode,
  FiCoffee,
  FiCompass,
  FiCpu,
  FiCreditCard,
  FiDatabase,
  FiDollarSign,
  FiDownload,
  FiEdit3,
  FiFeather,
  FiFile,
  FiFileText,
  FiFilm,
  FiFolder,
  FiGift,
  FiGitBranch,
  FiGlobe,
  FiHeadphones,
  FiHeart,
  FiHelpCircle,
  FiHome,
  FiImage,
  FiInbox,
  FiKey,
  FiLayers,
  FiLifeBuoy,
  FiLink,
  FiList,
  FiLock,
  FiMail,
  FiMap,
  FiMapPin,
  FiMessageCircle,
  FiMic,
  FiMonitor,
  FiMoon,
  FiMusic,
  FiPackage,
  FiPaperclip,
  FiPenTool,
  FiPhone,
  FiPieChart,
  FiPlay,
  FiPrinter,
  FiRadio,
  FiRss,
  FiSearch,
  FiServer,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiShoppingCart,
  FiSmartphone,
  FiStar,
  FiSun,
  FiTag,
  FiTerminal,
  FiTool,
  FiTrendingUp,
  FiTruck,
  FiTv,
  FiUmbrella,
  FiUser,
  FiUsers,
  FiVideo,
  FiZap,
} from "react-icons/fi";
export const LETTER_ICON = "letter";

export const iconCategories = ["brand", "productivity", "communication", "media", "money", "travel", "general"] as const;
export type IconCategory = (typeof iconCategories)[number];

export type IconCatalogEntry = {
  id: string;
  label: string;
  category: IconCategory;
  keywords: string[];
  /** Used for neutral icons (not in brand-icon registry). */
  fallbackIcon?: IconType;
};

const brandEntries: IconCatalogEntry[] = [
  { id: "openai", label: "OpenAI", category: "brand", keywords: ["openai", "chatgpt", "ai", "gpt"] },
  { id: "claude", label: "Claude", category: "brand", keywords: ["claude", "anthropic", "ai"] },
  { id: "gemini", label: "Gemini", category: "brand", keywords: ["gemini", "google", "ai", "bard"] },
  { id: "github", label: "GitHub", category: "brand", keywords: ["github", "git", "code", "repo"] },
  { id: "notion", label: "Notion", category: "brand", keywords: ["notion", "notes", "docs"] },
  { id: "youtube", label: "YouTube", category: "brand", keywords: ["youtube", "video", "watch"] },
  { id: "gmail", label: "Gmail", category: "brand", keywords: ["gmail", "mail", "email", "google"] },
  { id: "drive", label: "Google Drive", category: "brand", keywords: ["drive", "google", "files"] },
  { id: "calendar", label: "Google Calendar", category: "brand", keywords: ["calendar", "google", "schedule"] },
  { id: "reddit", label: "Reddit", category: "brand", keywords: ["reddit", "forum", "community"] },
  { id: "x", label: "X", category: "brand", keywords: ["x", "twitter", "social"] },
  { id: "threads", label: "Threads", category: "brand", keywords: ["threads", "meta", "social"] },
  { id: "linkedin", label: "LinkedIn", category: "brand", keywords: ["linkedin", "work", "career"] },
  { id: "instagram", label: "Instagram", category: "brand", keywords: ["instagram", "ig", "social", "photos"] },
  { id: "tiktok", label: "TikTok", category: "brand", keywords: ["tiktok", "video", "social"] },
  { id: "pinterest", label: "Pinterest", category: "brand", keywords: ["pinterest", "boards", "inspiration"] },
  { id: "spotify", label: "Spotify", category: "brand", keywords: ["spotify", "music", "audio"] },
  { id: "figma", label: "Figma", category: "brand", keywords: ["figma", "design", "ui"] },
  { id: "vercel", label: "Vercel", category: "brand", keywords: ["vercel", "deploy", "hosting"] },
  { id: "discord", label: "Discord", category: "brand", keywords: ["discord", "chat", "community"] },
  { id: "slack", label: "Slack", category: "brand", keywords: ["slack", "chat", "work"] },
  { id: "telegram", label: "Telegram", category: "brand", keywords: ["telegram", "chat", "messenger"] },
  { id: "whatsapp", label: "WhatsApp", category: "brand", keywords: ["whatsapp", "chat", "messenger"] },
  { id: "twitch", label: "Twitch", category: "brand", keywords: ["twitch", "stream", "gaming"] },
  { id: "stripe", label: "Stripe", category: "brand", keywords: ["stripe", "payments", "money"] },
  { id: "netflix", label: "Netflix", category: "brand", keywords: ["netflix", "video", "stream"] },
  { id: "apple", label: "Apple", category: "brand", keywords: ["apple", "ios", "mac"] },
  { id: "dropbox", label: "Dropbox", category: "brand", keywords: ["dropbox", "files", "cloud"] },
  { id: "cloudflare", label: "Cloudflare", category: "brand", keywords: ["cloudflare", "dns", "edge"] },
  { id: "medium", label: "Medium", category: "brand", keywords: ["medium", "blog", "writing"] },
  { id: "substack", label: "Substack", category: "brand", keywords: ["substack", "newsletter", "writing"] },
];

const neutralEntries: IconCatalogEntry[] = [
  // productivity
  { id: "fi-mail", label: "Mail", category: "communication", keywords: ["mail", "email", "inbox"], fallbackIcon: FiMail },
  { id: "fi-inbox", label: "Inbox", category: "communication", keywords: ["inbox", "mail", "messages"], fallbackIcon: FiInbox },
  { id: "fi-message", label: "Chat", category: "communication", keywords: ["chat", "message", "talk"], fallbackIcon: FiMessageCircle },
  { id: "fi-bell", label: "Notifications", category: "communication", keywords: ["bell", "alerts", "notify"], fallbackIcon: FiBell },
  { id: "fi-phone", label: "Phone", category: "communication", keywords: ["phone", "call"], fallbackIcon: FiPhone },
  { id: "fi-mic", label: "Microphone", category: "communication", keywords: ["mic", "audio", "record"], fallbackIcon: FiMic },
  { id: "fi-rss", label: "RSS", category: "communication", keywords: ["rss", "feed", "news"], fallbackIcon: FiRss },
  { id: "fi-users", label: "Team", category: "communication", keywords: ["users", "team", "people"], fallbackIcon: FiUsers },
  { id: "fi-user", label: "Profile", category: "general", keywords: ["user", "profile", "account"], fallbackIcon: FiUser },

  { id: "fi-calendar", label: "Calendar", category: "productivity", keywords: ["calendar", "date", "schedule"], fallbackIcon: FiCalendar },
  { id: "fi-clock", label: "Clock", category: "productivity", keywords: ["clock", "time", "hour"], fallbackIcon: FiClock },
  { id: "fi-checksquare", label: "Tasks", category: "productivity", keywords: ["tasks", "todo", "check"], fallbackIcon: FiCheckSquare },
  { id: "fi-list", label: "List", category: "productivity", keywords: ["list", "items", "menu"], fallbackIcon: FiList },
  { id: "fi-clipboard", label: "Clipboard", category: "productivity", keywords: ["clipboard", "copy", "tasks"], fallbackIcon: FiClipboard },
  { id: "fi-edit", label: "Edit", category: "productivity", keywords: ["edit", "write", "pencil"], fallbackIcon: FiEdit3 },
  { id: "fi-pen", label: "Design", category: "productivity", keywords: ["pen", "design", "draw"], fallbackIcon: FiPenTool },
  { id: "fi-feather", label: "Writing", category: "productivity", keywords: ["feather", "writing", "blog"], fallbackIcon: FiFeather },
  { id: "fi-bookopen", label: "Read", category: "productivity", keywords: ["book", "read", "docs"], fallbackIcon: FiBookOpen },
  { id: "fi-book", label: "Library", category: "productivity", keywords: ["book", "library", "study"], fallbackIcon: FiBook },
  { id: "fi-bookmark", label: "Bookmark", category: "productivity", keywords: ["bookmark", "save", "later"], fallbackIcon: FiBookmark },
  { id: "fi-file", label: "File", category: "productivity", keywords: ["file", "document"], fallbackIcon: FiFile },
  { id: "fi-filetext", label: "Doc", category: "productivity", keywords: ["doc", "document", "text"], fallbackIcon: FiFileText },
  { id: "fi-folder", label: "Folder", category: "productivity", keywords: ["folder", "files", "directory"], fallbackIcon: FiFolder },
  { id: "fi-paperclip", label: "Attach", category: "productivity", keywords: ["paperclip", "attach", "files"], fallbackIcon: FiPaperclip },
  { id: "fi-printer", label: "Printer", category: "productivity", keywords: ["printer", "print"], fallbackIcon: FiPrinter },
  { id: "fi-briefcase", label: "Work", category: "productivity", keywords: ["briefcase", "work", "office"], fallbackIcon: FiBriefcase },
  { id: "fi-tool", label: "Tool", category: "productivity", keywords: ["tool", "wrench", "settings"], fallbackIcon: FiTool },
  { id: "fi-settings", label: "Settings", category: "productivity", keywords: ["settings", "gear", "config"], fallbackIcon: FiSettings },

  // tech / dev
  { id: "fi-code", label: "Code", category: "productivity", keywords: ["code", "dev", "programming"], fallbackIcon: FiCode },
  { id: "fi-terminal", label: "Terminal", category: "productivity", keywords: ["terminal", "shell", "console"], fallbackIcon: FiTerminal },
  { id: "fi-cpu", label: "CPU", category: "productivity", keywords: ["cpu", "chip", "compute"], fallbackIcon: FiCpu },
  { id: "fi-database", label: "Database", category: "productivity", keywords: ["database", "data", "storage"], fallbackIcon: FiDatabase },
  { id: "fi-server", label: "Server", category: "productivity", keywords: ["server", "host", "ops"], fallbackIcon: FiServer },
  { id: "fi-cloud", label: "Cloud", category: "productivity", keywords: ["cloud", "storage", "saas"], fallbackIcon: FiCloud },
  { id: "fi-gitbranch", label: "Branch", category: "productivity", keywords: ["git", "branch", "version"], fallbackIcon: FiGitBranch },
  { id: "fi-monitor", label: "Monitor", category: "productivity", keywords: ["monitor", "screen", "display"], fallbackIcon: FiMonitor },
  { id: "fi-smartphone", label: "Mobile", category: "productivity", keywords: ["phone", "mobile", "device"], fallbackIcon: FiSmartphone },
  { id: "fi-key", label: "Key", category: "productivity", keywords: ["key", "auth", "login"], fallbackIcon: FiKey },
  { id: "fi-lock", label: "Lock", category: "productivity", keywords: ["lock", "secure", "private"], fallbackIcon: FiLock },
  { id: "fi-shield", label: "Security", category: "productivity", keywords: ["shield", "security", "safe"], fallbackIcon: FiShield },

  // media
  { id: "fi-play", label: "Play", category: "media", keywords: ["play", "video", "media"], fallbackIcon: FiPlay },
  { id: "fi-film", label: "Film", category: "media", keywords: ["film", "movie", "video"], fallbackIcon: FiFilm },
  { id: "fi-music", label: "Music", category: "media", keywords: ["music", "audio", "song"], fallbackIcon: FiMusic },
  { id: "fi-headphones", label: "Headphones", category: "media", keywords: ["headphones", "audio", "podcast"], fallbackIcon: FiHeadphones },
  { id: "fi-image", label: "Image", category: "media", keywords: ["image", "photo", "picture"], fallbackIcon: FiImage },
  { id: "fi-camera", label: "Camera", category: "media", keywords: ["camera", "photo"], fallbackIcon: FiCamera },
  { id: "fi-video", label: "Video", category: "media", keywords: ["video", "stream"], fallbackIcon: FiVideo },
  { id: "fi-tv", label: "TV", category: "media", keywords: ["tv", "show", "stream"], fallbackIcon: FiTv },
  { id: "fi-radio", label: "Radio", category: "media", keywords: ["radio", "broadcast"], fallbackIcon: FiRadio },
  { id: "fi-airplay", label: "Airplay", category: "media", keywords: ["airplay", "cast"], fallbackIcon: FiAirplay },

  // money
  { id: "fi-dollar", label: "Money", category: "money", keywords: ["dollar", "money", "cash"], fallbackIcon: FiDollarSign },
  { id: "fi-creditcard", label: "Card", category: "money", keywords: ["card", "credit", "pay"], fallbackIcon: FiCreditCard },
  { id: "fi-piechart", label: "Analytics", category: "money", keywords: ["analytics", "chart", "report"], fallbackIcon: FiPieChart },
  { id: "fi-trendingup", label: "Trending", category: "money", keywords: ["trending", "stocks", "growth"], fallbackIcon: FiTrendingUp },
  { id: "fi-shoppingcart", label: "Cart", category: "money", keywords: ["cart", "shop", "store"], fallbackIcon: FiShoppingCart },
  { id: "fi-shoppingbag", label: "Shopping", category: "money", keywords: ["shopping", "bag", "store"], fallbackIcon: FiShoppingBag },
  { id: "fi-tag", label: "Tag", category: "money", keywords: ["tag", "label", "price"], fallbackIcon: FiTag },
  { id: "fi-gift", label: "Gift", category: "money", keywords: ["gift", "present"], fallbackIcon: FiGift },

  // travel
  { id: "fi-map", label: "Map", category: "travel", keywords: ["map", "location"], fallbackIcon: FiMap },
  { id: "fi-mappin", label: "Pin", category: "travel", keywords: ["pin", "location", "place"], fallbackIcon: FiMapPin },
  { id: "fi-compass", label: "Compass", category: "travel", keywords: ["compass", "direction", "travel"], fallbackIcon: FiCompass },
  { id: "fi-truck", label: "Delivery", category: "travel", keywords: ["truck", "delivery", "shipping"], fallbackIcon: FiTruck },
  { id: "fi-package", label: "Package", category: "travel", keywords: ["package", "box", "delivery"], fallbackIcon: FiPackage },
  { id: "fi-umbrella", label: "Umbrella", category: "travel", keywords: ["umbrella", "weather", "rain"], fallbackIcon: FiUmbrella },
  { id: "fi-sun", label: "Sun", category: "travel", keywords: ["sun", "weather", "day"], fallbackIcon: FiSun },
  { id: "fi-moon", label: "Moon", category: "travel", keywords: ["moon", "night"], fallbackIcon: FiMoon },
  { id: "fi-coffee", label: "Coffee", category: "travel", keywords: ["coffee", "cafe", "drink"], fallbackIcon: FiCoffee },

  // general
  { id: "fi-globe", label: "Website", category: "general", keywords: ["globe", "web", "site"], fallbackIcon: FiGlobe },
  { id: "fi-link", label: "Link", category: "general", keywords: ["link", "url"], fallbackIcon: FiLink },
  { id: "fi-search", label: "Search", category: "general", keywords: ["search", "find"], fallbackIcon: FiSearch },
  { id: "fi-home", label: "Home", category: "general", keywords: ["home", "house"], fallbackIcon: FiHome },
  { id: "fi-star", label: "Star", category: "general", keywords: ["star", "favorite"], fallbackIcon: FiStar },
  { id: "fi-heart", label: "Heart", category: "general", keywords: ["heart", "love", "like"], fallbackIcon: FiHeart },
  { id: "fi-zap", label: "Zap", category: "general", keywords: ["zap", "lightning", "fast"], fallbackIcon: FiZap },
  { id: "fi-activity", label: "Activity", category: "general", keywords: ["activity", "pulse"], fallbackIcon: FiActivity },
  { id: "fi-box", label: "Box", category: "general", keywords: ["box", "container"], fallbackIcon: FiBox },
  { id: "fi-layers", label: "Layers", category: "general", keywords: ["layers", "stack"], fallbackIcon: FiLayers },
  { id: "fi-download", label: "Download", category: "general", keywords: ["download", "save"], fallbackIcon: FiDownload },
  { id: "fi-helpcircle", label: "Help", category: "general", keywords: ["help", "question", "support"], fallbackIcon: FiHelpCircle },
  { id: "fi-lifebuoy", label: "Support", category: "general", keywords: ["support", "lifebuoy", "help"], fallbackIcon: FiLifeBuoy },
];

export const iconCatalog: IconCatalogEntry[] = [
  { id: LETTER_ICON, label: "Letter avatar", category: "general", keywords: ["letter", "avatar", "initial", "default"] },
  ...brandEntries,
  ...neutralEntries,
];

export function getCatalogByCategory(category: IconCategory): IconCatalogEntry[] {
  return iconCatalog.filter((entry) => entry.category === category);
}

export function searchCatalog(query: string): IconCatalogEntry[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return iconCatalog;
  return iconCatalog.filter((entry) => {
    if (entry.label.toLowerCase().includes(trimmed)) return true;
    return entry.keywords.some((keyword) => keyword.toLowerCase().includes(trimmed));
  });
}

/** Lookup map for neutral fallback renderers. */
export const neutralIconMap: Record<string, IconType> = neutralEntries.reduce(
  (acc, entry) => {
    if (entry.fallbackIcon) acc[entry.id] = entry.fallbackIcon;
    return acc;
  },
  {} as Record<string, IconType>,
);
