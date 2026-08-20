import "server-only";

import { cache } from "react";
import { cacheWrap } from "@/lib/cache";
import { logError } from "@/lib/log";
import { db } from "@/src/db";
import { eq, inArray } from "drizzle-orm";
import { settings, settingsI18n, socialLinks, socialLinksI18n } from "@/src/db/schema";
import {
  getSystemSettings,
  SYSTEM_SETTINGS_CACHE_KEY,
  SYSTEM_SETTINGS_DATASET_CACHE_KEY,
} from "./service";

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

/**
 * A system setting row with its per-locale values merged in. Locale data is
 * carried alongside the row, so one cached payload serves both languages.
 */
export type SystemSettingEntry = {
  id: string;
  key: string;
  value: unknown;
  type: string | null;
  isActive: boolean;
  displayOrder: number;
  translations: { fa?: unknown; en?: unknown };
};

/** A social link with its localized labels. */
export type SocialLinkEntry = {
  id: string;
  url: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  labels: { fa?: string; en?: string };
};

/**
 * Full system-settings dataset (rows + translations). This data barely changes,
 * so it is cached hard (10 min) and busted on every admin mutation.
 */
const SYSTEM_SETTINGS_DATASET_TTL_SECS = 600;

async function loadSystemSettingsDatasetRaw(): Promise<SystemSettingEntry[]> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.scope, "system"))
    .orderBy(settings.displayOrder, settings.key);
  if (rows.length === 0) return [];

  const i18nRows = await db
    .select()
    .from(settingsI18n)
    .where(inArray(settingsI18n.settingId, rows.map((row) => row.id)));

  const byId = new Map<string, { fa?: unknown; en?: unknown }>();
  for (const row of i18nRows) {
    const entry = byId.get(row.settingId) ?? {};
    entry[row.locale] = row.value;
    byId.set(row.settingId, entry);
  }

  return rows.map((row) => ({
    id: row.id,
    key: row.key,
    value: row.value,
    type: row.type,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    translations: byId.get(row.id) ?? {},
  }));
}

export const loadSystemSettingsDataset = cache(async (): Promise<SystemSettingEntry[]> => {
  try {
    return await cacheWrap(
      SYSTEM_SETTINGS_DATASET_CACHE_KEY,
      SYSTEM_SETTINGS_DATASET_TTL_SECS,
      loadSystemSettingsDatasetRaw,
    );
  } catch (error) {
    logError("settings.dataset_load_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});

/**
 * Social links dataset (rows + localized labels). Near-static content, cached
 * hard and busted by every social-link admin mutation.
 */
export const SOCIAL_LINKS_CACHE_KEY = "social:links";
const SOCIAL_LINKS_TTL_SECS = 600;

async function loadSocialLinksRaw(): Promise<SocialLinkEntry[]> {
  const rows = await db
    .select()
    .from(socialLinks)
    .orderBy(socialLinks.displayOrder, socialLinks.createdAt);
  if (rows.length === 0) return [];

  const i18nRows = await db
    .select()
    .from(socialLinksI18n)
    .where(inArray(socialLinksI18n.socialLinkId, rows.map((row) => row.id)));

  const byId = new Map<string, { fa?: string; en?: string }>();
  for (const row of i18nRows) {
    const entry = byId.get(row.socialLinkId) ?? {};
    entry[row.locale] = row.label;
    byId.set(row.socialLinkId, entry);
  }

  return rows.map((row) => ({
    id: row.id,
    url: row.url,
    imageUrl: row.imageUrl,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    labels: byId.get(row.id) ?? {},
  }));
}

export const loadSocialLinksDataset = cache(async (): Promise<SocialLinkEntry[]> => {
  try {
    return await cacheWrap(SOCIAL_LINKS_CACHE_KEY, SOCIAL_LINKS_TTL_SECS, loadSocialLinksRaw);
  } catch (error) {
    logError("social.links_load_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
});