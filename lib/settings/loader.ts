import "server-only";

import { cache } from "react";
import { logError } from "@/lib/log";
import { getSystemSettings } from "./service";

export const loadSystemSettingsMap = cache(async () => {
  try {
    const rows = await getSystemSettings();
    return new Map(rows.map((r) => [r.key, r.value]));
  } catch (error) {
    // System settings are optional site-wide overrides (contact info, social
    // links). A missing/migrated table or a brief DB hiccup must never take
    // down every page render — callers fall back to their compiled defaults.
    logError("settings.load_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Map<string, unknown>();
  }
});
