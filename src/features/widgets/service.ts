import { defaultWidgets } from "@/data/defaults";
import type { HomeWidget } from "@/lib/types";

export async function listWidgets(): Promise<HomeWidget[]> {
  return defaultWidgets;
}
