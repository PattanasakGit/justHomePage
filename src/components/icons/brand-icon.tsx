import type { IconType } from "react-icons";
import { BsBing } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import { FiCpu, FiGlobe, FiPlus } from "react-icons/fi";
import {
  SiBrave,
  SiClaude,
  SiDuckduckgo,
  SiFigma,
  SiGithub,
  SiGmail,
  SiGoogle,
  SiGooglecalendar,
  SiGoogledrive,
  SiGooglegemini,
  SiNotion,
  SiOpenai,
  SiPerplexity,
  SiReddit,
  SiSpotify,
  SiVercel,
  SiX,
  SiYoutube,
} from "react-icons/si";

export const iconChoices = [
  "openai",
  "github",
  "notion",
  "youtube",
  "gmail",
  "drive",
  "calendar",
  "reddit",
  "x",
  "linkedin",
  "spotify",
  "figma",
  "vercel",
  "claude",
  "gemini",
  "copilot",
  "you",
  "phind",
  "globe",
] as const;

const iconMap: Record<string, { icon: IconType; color: string; label: string }> = {
  openai: { icon: SiOpenai, color: "#119b75", label: "OpenAI" },
  github: { icon: SiGithub, color: "#181717", label: "GitHub" },
  notion: { icon: SiNotion, color: "#111111", label: "Notion" },
  youtube: { icon: SiYoutube, color: "#ff0033", label: "YouTube" },
  play: { icon: SiYoutube, color: "#ff0033", label: "YouTube" },
  gmail: { icon: SiGmail, color: "#ea4335", label: "Gmail" },
  drive: { icon: SiGoogledrive, color: "#34a853", label: "Google Drive" },
  calendar: { icon: SiGooglecalendar, color: "#4285f4", label: "Google Calendar" },
  reddit: { icon: SiReddit, color: "#ff4500", label: "Reddit" },
  x: { icon: SiX, color: "#111111", label: "X" },
  linkedin: { icon: FaLinkedin, color: "#0a66c2", label: "LinkedIn" },
  spotify: { icon: SiSpotify, color: "#1db954", label: "Spotify" },
  figma: { icon: SiFigma, color: "#a259ff", label: "Figma" },
  vercel: { icon: SiVercel, color: "#111111", label: "Vercel" },
  google: { icon: SiGoogle, color: "#4285f4", label: "Google" },
  bing: { icon: BsBing, color: "#008373", label: "Bing" },
  duckduckgo: { icon: SiDuckduckgo, color: "#de5833", label: "DuckDuckGo" },
  brave: { icon: SiBrave, color: "#fb542b", label: "Brave" },
  perplexity: { icon: SiPerplexity, color: "#1f8a89", label: "Perplexity" },
  chatgpt: { icon: SiOpenai, color: "#119b75", label: "ChatGPT" },
  claude: { icon: SiClaude, color: "#cc785c", label: "Claude" },
  gemini: { icon: SiGooglegemini, color: "#6e7cf6", label: "Gemini" },
  copilot: { icon: BsBing, color: "#0078d4", label: "Copilot" },
  you: { icon: FiCpu, color: "#6f4dff", label: "You.com" },
  phind: { icon: FiCpu, color: "#5f6f8a", label: "Phind" },
  globe: { icon: FiGlobe, color: "#2f8f83", label: "Website" },
  add: { icon: FiPlus, color: "#66736c", label: "Add" },
};

export function getBrandIcon(name: string) {
  return iconMap[name] ?? iconMap.globe;
}
