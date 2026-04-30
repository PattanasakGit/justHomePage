import { defaultPreferences } from "@/data/defaults";
import type { Preferences } from "@/lib/types";

export async function getSettings(): Promise<Preferences> {
  return defaultPreferences;
}
