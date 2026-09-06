import { eq } from "drizzle-orm";

import {
  loadTranslations,
  toAdminSetting,
  type AdminSetting,
} from "@/lib/settings/admin";
import { db } from "@/src/db";
import { settings } from "@/src/db/schema";

/**
 * Every system setting (active and inactive), grouped client-side on the
 * settings screen. Unpaginated — the dataset stays small; if it ever grows,
 * only perPage/staleTime need tuning, not this shape.
 */
export async function listAllSystemSettings(): Promise<AdminSetting[]> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.scope, "system"))
    .orderBy(settings.displayOrder, settings.key);
  const translations = await loadTranslations(rows.map((row) => row.id));
  return rows.map((row) => toAdminSetting(row, translations));
}