import { defaultFavorites } from "@/data/defaults";
import type { Favorite } from "@/lib/types";

export async function listFavorites(): Promise<Favorite[]> {
  return defaultFavorites;
}
