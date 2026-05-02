import { defaultFavorites } from "@/data/defaults";
import type { FavoriteItem } from "@/lib/types";

export async function listFavorites(): Promise<FavoriteItem[]> {
  return defaultFavorites;
}
