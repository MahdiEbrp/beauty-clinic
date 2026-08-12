import "server-only";

import { cache } from "react";
import { cacheWrap } from "@/lib/cache";
import { logError } from "@/lib/log";
import { getSystemSettings, SYSTEM_SETTINGS_CACHE_KEY } from "./service";

/** TTL for the cached system-settings map (seconds). */
const SYSTEM_SETTINGS_CACHE_TTL_SECS = 60;

export const loadSystemSettingsMap = cache(async () => {
  try {
    const rows = await cacheWrap(
      SYSTEM_SETTINGS_CACHE_KEY,
      SYSTEM_SETTINGS_CACHE_TTL_SECS,
      getSystemSettings,
    );
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
