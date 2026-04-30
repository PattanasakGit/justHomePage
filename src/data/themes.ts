import type { BackgroundId, ThemeCategory } from "@/lib/types";

export type ThemeDefinition = {
  id: BackgroundId;
  label: string;
  category: ThemeCategory;
  style: "soft" | "minimal" | "vibrant" | "neon";
  preview: string;
  accents: readonly string[];
};

export const themeCatalog: readonly ThemeDefinition[] = [
  {
    id: "linen",
    label: "Linen",
    category: "light",
    style: "soft",
    preview: "from-[#d8eee7] via-[#f8f2e9] to-[#efd9cf]",
    accents: ["#339b8e", "#cc7a5d", "#e8b04b", "#7e9e6f", "#b88a64"],
  },
  {
    id: "aurora",
    label: "Aurora",
    category: "light",
    style: "soft",
    preview: "from-[#b9ded4] via-[#eef5ef] to-[#e8b4a8]",
    accents: ["#4ca68b", "#e17055", "#7a8cd6", "#d68c5b", "#5fa19f"],
  },
  {
    id: "sky",
    label: "Sky",
    category: "light",
    style: "soft",
    preview: "from-[#d9edf4] via-[#f7f3e8] to-[#cfe4dd]",
    accents: ["#4189b8", "#e89358", "#5fb7a5", "#a07cc8", "#d57aa0"],
  },
  {
    id: "sunset",
    label: "Sunset",
    category: "light",
    style: "vibrant",
    preview: "from-[#ffe2cc] via-[#ffd1d6] to-[#f3c5d8]",
    accents: ["#e85a4f", "#f59e0b", "#d6336c", "#a55eea", "#ff7a59"],
  },
  {
    id: "rose",
    label: "Rose",
    category: "light",
    style: "soft",
    preview: "from-[#fdf0ee] via-[#fbe1e8] to-[#f7d4e0]",
    accents: ["#d6336c", "#b56576", "#e85a4f", "#a463a3", "#cc7a5d"],
  },
  {
    id: "honey",
    label: "Honey",
    category: "light",
    style: "vibrant",
    preview: "from-[#fff3d6] via-[#ffe1ad] to-[#f7c98a]",
    accents: ["#e8a02b", "#cc6633", "#7e9e3c", "#3a7a8c", "#b8743f"],
  },
  {
    id: "sand",
    label: "Sand",
    category: "light",
    style: "minimal",
    preview: "from-[#f3ead8] via-[#ece1cc] to-[#e2d5bb]",
    accents: ["#8b7355", "#5a7a6c", "#9b6b3f", "#6b8e7f", "#a85b3a"],
  },
  {
    id: "mint",
    label: "Mint",
    category: "light",
    style: "soft",
    preview: "from-[#e6f7ee] via-[#d3f0e0] to-[#c4e9d6]",
    accents: ["#2fa37a", "#3a8b9e", "#7e9e3c", "#cc7a5d", "#b58dca"],
  },
  {
    id: "lavender",
    label: "Lavender",
    category: "light",
    style: "soft",
    preview: "from-[#ece4f7] via-[#ddd0ef] to-[#c9b9e5]",
    accents: ["#8b5cf6", "#a463a3", "#5a7ec8", "#d57aa0", "#5fa19f"],
  },
  {
    id: "slate",
    label: "Slate",
    category: "light",
    style: "minimal",
    preview: "from-[#e6ebf0] via-[#dee5ec] to-[#ccd6e0]",
    accents: ["#4a6b8a", "#6b7a8a", "#8b6f5a", "#5a8a7a", "#7a5a8a"],
  },
  {
    id: "paper",
    label: "Paper",
    category: "light",
    style: "minimal",
    preview: "from-[#fafafa] via-[#f4f4f5] to-[#e8e8ec]",
    accents: ["#111111", "#525252", "#3b6cb6", "#a35a3a", "#1f6b4f"],
  },
  {
    id: "mist",
    label: "Mist",
    category: "light",
    style: "minimal",
    preview: "from-[#eef3f7] via-[#e2eaf2] to-[#d4dce6]",
    accents: ["#4a7ba8", "#6b8aa3", "#3a8b7a", "#8a6f5a", "#7a6f9b"],
  },
  {
    id: "blush",
    label: "Blush",
    category: "light",
    style: "minimal",
    preview: "from-[#fbeef0] via-[#f8e3e7] to-[#f2d2d8]",
    accents: ["#cc4f6c", "#a05a8a", "#cc7a5d", "#7a8aa3", "#5a8a7a"],
  },
  {
    id: "dawn",
    label: "Dawn",
    category: "light",
    style: "vibrant",
    preview: "from-[#fde8e0] via-[#fbd5d2] to-[#e9c6dd]",
    accents: ["#e85a4f", "#cc4f6c", "#f59e0b", "#a55eea", "#3a7a8c"],
  },
  {
    id: "ivory",
    label: "Ivory",
    category: "light",
    style: "minimal",
    preview: "from-[#fbf6ec] via-[#f6efde] to-[#ede4cd]",
    accents: ["#8b6b3a", "#5a7a6c", "#cc7a5d", "#3a6b7a", "#6b3a5a"],
  },
  {
    id: "graphite",
    label: "Graphite",
    category: "dark",
    style: "soft",
    preview: "from-[#202620] via-[#43534d] to-[#242a27]",
    accents: ["#4ca68b", "#e8a04b", "#7a9ed6", "#e17055", "#b58dca"],
  },
  {
    id: "ocean",
    label: "Ocean",
    category: "dark",
    style: "soft",
    preview: "from-[#0f3a55] via-[#144a6a] to-[#0d2c44]",
    accents: ["#4ec5d4", "#e89358", "#a5d676", "#d57aa0", "#f4d35e"],
  },
  {
    id: "forest",
    label: "Forest",
    category: "dark",
    style: "soft",
    preview: "from-[#1f3027] via-[#2c4636] to-[#1a2620]",
    accents: ["#7ed6a3", "#e8a04b", "#d68c5b", "#a5c4d6", "#cc7a8d"],
  },
  {
    id: "midnight",
    label: "Midnight",
    category: "dark",
    style: "soft",
    preview: "from-[#131634] via-[#1f2350] to-[#0e1024]",
    accents: ["#7a8ce8", "#f4d35e", "#e85a8d", "#5fc4a8", "#c08bdb"],
  },
  {
    id: "nebula",
    label: "Nebula",
    category: "dark",
    style: "vibrant",
    preview: "from-[#1c1238] via-[#2b1c4f] to-[#150e29]",
    accents: ["#c08bdb", "#5a8ce8", "#e85a8d", "#f4a35e", "#5fd6c4"],
  },
  {
    id: "plum",
    label: "Plum",
    category: "dark",
    style: "soft",
    preview: "from-[#2a1430] via-[#3e1d44] to-[#1c0e22]",
    accents: ["#cc8ad6", "#e8a04b", "#5a8ce8", "#7ed6a3", "#e85a8d"],
  },
  {
    id: "noir",
    label: "Noir",
    category: "dark",
    style: "minimal",
    preview: "from-[#0a0a0a] via-[#1a1a1a] to-[#000000]",
    accents: ["#f5f5f5", "#cccccc", "#e85a4f", "#4ca68b", "#e8a04b"],
  },
  {
    id: "inferno",
    label: "Inferno",
    category: "dark",
    style: "vibrant",
    preview: "from-[#2a0e0e] via-[#4a1a1a] to-[#1a0606]",
    accents: ["#ff5a3a", "#f4d35e", "#cc4f6c", "#e89358", "#5fc4a8"],
  },
  {
    id: "neonCyan",
    label: "Neon Cyan",
    category: "dark",
    style: "neon",
    preview: "from-[#020a14] via-[#031628] to-[#01080f]",
    accents: ["#00f0ff", "#00ffa3", "#ff00d4", "#fff200", "#ff6b6b"],
  },
  {
    id: "neonPink",
    label: "Neon Pink",
    category: "dark",
    style: "neon",
    preview: "from-[#180420] via-[#2c0a3a] to-[#0d020f]",
    accents: ["#ff2bd6", "#00f0ff", "#ffe600", "#9b5cff", "#ff6b6b"],
  },
  {
    id: "neonViolet",
    label: "Neon Violet",
    category: "dark",
    style: "neon",
    preview: "from-[#0c0420] via-[#1a0a3a] to-[#06020f]",
    accents: ["#9b5cff", "#00f0ff", "#ff2bd6", "#fff200", "#5fc4a8"],
  },
  {
    id: "abyss",
    label: "Abyss",
    category: "dark",
    style: "minimal",
    preview: "from-[#020618] via-[#0a1024] to-[#01030a]",
    accents: ["#5a8ce8", "#e0e0e0", "#5fc4a8", "#cc8ad6", "#e8a04b"],
  },
  {
    id: "cyber",
    label: "Cyber",
    category: "dark",
    style: "neon",
    preview: "from-[#031408] via-[#0a2a14] to-[#010a04]",
    accents: ["#00ff88", "#00f0ff", "#ffe600", "#ff2bd6", "#ff6b6b"],
  },
] as const;

const themeMap = new Map(themeCatalog.map((theme) => [theme.id, theme] as const));

export function getThemeDefinition(id: BackgroundId): ThemeDefinition {
  return themeMap.get(id) ?? themeCatalog[0]!;
}

export function getDefaultAccent(id: BackgroundId): string {
  return getThemeDefinition(id).accents[0]!;
}

export const DARK_THEME_IDS: ReadonlySet<BackgroundId> = new Set(
  themeCatalog.filter((theme) => theme.category === "dark").map((theme) => theme.id),
);
