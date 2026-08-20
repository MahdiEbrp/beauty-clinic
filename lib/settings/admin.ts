import { and, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { cacheDel } from "@/lib/cache";
import { SYSTEM_SETTINGS_DATASET_CACHE_KEY } from "@/lib/settings/service";
import type { SettingStatusFilter } from "@/lib/validation/settings-admin";
import { db } from "@/src/db";
import { settings, settingsI18n } from "@/src/db/schema";

/** Setting row normalized for the admin list with its fa/en translations. */
export type AdminSetting = {
  id: string;
  key: string;
  type: string | null;
  value: unknown;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  translations: { fa?: unknown; en?: unknown };
};

export type ListSystemSettingsResult = {
  items: AdminSetting[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type SettingMutation = {
  key?: string;
  value?: unknown;
  type?: string;
  isActive?: boolean;
  displayOrder?: number;
  translations?: { fa?: unknown; en?: unknown };
};

function toAdminSetting(
  row: typeof settings.$inferSelect,
  translations: Map<string, { fa?: unknown; en?: unknown }>,
): AdminSetting {
  const tr = translations.get(row.id);
  return {
    id: row.id,
    key: row.key,
    type: row.type,
    value: row.value,
    isActive: row.isActive,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: tr ?? {},
  };
}

/** Shared search/status filter for system settings rows. */
function settingListConditions(opts: {
  search?: string;
  status?: SettingStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [eq(settings.scope, "system")];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(settings.key, term),
        sql`exists (
          select 1 from ${settingsI18n}
          where ${settingsI18n.settingId} = ${settings.id}
            and ${settingsI18n.value}::text ilike ${term}
        )`,
        sql`${settings.value}::text ilike ${term}`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(settings.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(settings.isActive, false));
  return conditions;
}

async function loadTranslations(
  ids: string[],
): Promise<Map<string, { fa?: unknown; en?: unknown }>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select()
    .from(settingsI18n)
    .where(inArray(settingsI18n.settingId, ids));
  const map = new Map<string, { fa?: unknown; en?: unknown }>();
  for (const row of rows) {
    const entry = map.get(row.settingId) ?? {};
    entry[row.locale] = row.value;
    map.set(row.settingId, entry);
  }
  return map;
}

/** Paginated, filterable list of system settings for the management screen. */
export async function listSystemSettings(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: SettingStatusFilter;
}): Promise<ListSystemSettingsResult> {
  const { page, perPage, search, status = "all" } = opts;
  const where = and(...settingListConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(settings)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(settings)
    .where(where)
    .orderBy(settings.displayOrder, settings.key)
    .limit(perPage)
    .offset((page - 1) * perPage);

  const translations = await loadTranslations(rows.map((row) => row.id));

  return {
    items: rows.map((row) => toAdminSetting(row, translations)),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/** Returns the ids of system settings matching the given search/status filters. */
export async function findSettingIds(opts: {
  search?: string;
  status?: SettingStatusFilter;
}): Promise<string[]> {
  const where = and(...settingListConditions(opts));
  const rows = await db
    .select({ id: settings.id })
    .from(settings)
    .where(where);
  return rows.map((row) => row.id);
}

/** Full admin row for the edit screen, or null when not found. */
export async function getSystemSettingById(id: string): Promise<AdminSetting | null> {
  const [row] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.id, id), eq(settings.scope, "system")));
  if (!row) return null;
  const translations = await loadTranslations([row.id]);
  return toAdminSetting(row, translations);
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

function keyTakenError(): ApiError {
  return new ApiError(
    409,
    "KEY_TAKEN",
    "A system setting with this key already exists.",
  );
}

export async function createSystemSetting(input: SettingMutation): Promise<{ id: string }> {
  const { key, value = null, type = "string", isActive = true, displayOrder = 0, translations } = input;
  if (!key) {
    throw new ApiError(400, "INVALID_KEY", "A key is required.");
  }
  try {
    const [row] = await db
      .insert(settings)
      .values({
        scope: "system",
        key,
        value,
        type,
        isActive,
        displayOrder,
      })
      .returning({ id: settings.id });
    if (!row) {
      throw new ApiError(500, "SETTING_CREATE_FAILED", "Could not create system setting.");
    }
    if (translations) {
      const rows = (
        [
          { locale: "fa", value: translations.fa },
          { locale: "en", value: translations.en },
        ] as const
      )
        .filter((entry) => entry.value !== undefined)
        .map((entry) => ({ settingId: row.id, locale: entry.locale, value: entry.value }));
      if (rows.length > 0) {
        await db.insert(settingsI18n).values(rows);
      }
    }
    return { id: row.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw keyTakenError();
    throw error;
  } finally {
    await bustSystemSettingsCache();
  }
}

export async function updateSystemSetting(
  id: string,
  input: SettingMutation,
): Promise<void> {
  const existing = await getSystemSettingById(id);
  if (!existing) {
    throw new ApiError(404, "SETTING_NOT_FOUND", "System setting not found.");
  }

  const patch: Partial<typeof settings.$inferInsert> = {};
  if (input.value !== undefined) patch.value = input.value;
  if (input.type !== undefined) patch.type = input.type;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  if (input.displayOrder !== undefined) patch.displayOrder = input.displayOrder;
  patch.updatedAt = new Date();

  await db.update(settings).set(patch).where(eq(settings.id, id));

  if (input.translations) {
    await db.delete(settingsI18n).where(eq(settingsI18n.settingId, id));
    const rows = (
      [
        { locale: "fa", value: input.translations.fa },
        { locale: "en", value: input.translations.en },
      ] as const
    )
      .filter((entry) => entry.value !== undefined)
      .map((entry) => ({ settingId: id, locale: entry.locale, value: entry.value }));
    if (rows.length > 0) {
      await db.insert(settingsI18n).values(rows);
    }
  }

  await bustSystemSettingsCache();
}

export async function deleteSystemSetting(id: string): Promise<void> {
  const [row] = await db
    .delete(settings)
    .where(and(eq(settings.id, id), eq(settings.scope, "system")))
    .returning({ id: settings.id });
  if (!row) {
    throw new ApiError(404, "SETTING_NOT_FOUND", "System setting not found.");
  }
  await bustSystemSettingsCache();
}

export async function setSystemSettingActive(id: string, isActive: boolean): Promise<void> {
  const [row] = await db
    .update(settings)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(settings.id, id), eq(settings.scope, "system")))
    .returning({ id: settings.id });
  if (!row) {
    throw new ApiError(404, "SETTING_NOT_FOUND", "System setting not found.");
  }
  await bustSystemSettingsCache();
}

export async function bulkUpdateSettings(
  ids: string[],
  action: "activate" | "deactivate",
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(settings)
    .set({ isActive: action === "activate", updatedAt: new Date() })
    .where(and(inArray(settings.id, ids), eq(settings.scope, "system")));
  await bustSystemSettingsCache();
}

export async function bulkDeleteSettings(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(settings).where(inArray(settings.id, ids));
  await bustSystemSettingsCache();
}

/** Drop the cached system-settings dataset so next public render refreshes. */
export async function bustSystemSettingsCache(): Promise<void> {
  await cacheDel(SYSTEM_SETTINGS_DATASET_CACHE_KEY);
}