const PALETTE = [
  "#339b8e",
  "#4f8cff",
  "#8b5cf6",
  "#ef6f53",
  "#f59e0b",
  "#22c55e",
  "#ec4899",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#a855f7",
  "#84cc16",
];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getLetterAvatar(seed: string) {
  const trimmed = seed.trim();
  const letter = trimmed.length === 0 ? "•" : trimmed[0]!.toUpperCase();
  const color = PALETTE[hashString(trimmed || "•") % PALETTE.length]!;
  return { letter, color };
}
