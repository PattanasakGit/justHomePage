import type { IconSize } from "@/lib/types";

export const iconSizeOptions: Array<{ id: IconSize; label: string }> = [
  { id: "sm", label: "S" },
  { id: "md", label: "M" },
  { id: "lg", label: "L" },
  { id: "xl", label: "XL" },
];

export function iconSizeCssVars(iconSize: IconSize) {
  switch (iconSize) {
    case "sm":
      return {
        "--icon-size": "36px",
        "--tile-pad": "10px",
        "--grid-gap": "10px",
        "--tile-size": "84px",
      } as const;
    case "lg":
      return {
        "--icon-size": "58px",
        "--tile-pad": "16px",
        "--grid-gap": "16px",
        "--tile-size": "108px",
      } as const;
    case "xl":
      return {
        "--icon-size": "68px",
        "--tile-pad": "18px",
        "--grid-gap": "18px",
        "--tile-size": "120px",
      } as const;
    case "md":
    default:
      return {
        "--icon-size": "48px",
        "--tile-pad": "14px",
        "--grid-gap": "14px",
        "--tile-size": "96px",
      } as const;
  }
}
