import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/src/db";
import { careGuideItemsI18n, careGuidesI18n } from "@/src/db/schema";
import type {
  CareGuideContent,
  CareGuideItemContent,
} from "./care-guides-types";
import type { Tx } from "./i18n";
import type { Locale, TranslatedContent } from "./types";

export function emptyCareGuideContent(): CareGuideContent {
  return { name: "", description: null };
}

export function emptyCareGuideItemContent(): CareGuideItemContent {
  return { title: "", description: null };
}

export async function loadCareGuidesTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<CareGuideContent>>> {
  const map = new Map<string, TranslatedContent<CareGuideContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) {
    map.set(id, { fa: emptyCareGuideContent(), en: emptyCareGuideContent() });
  }
  const rows = await db
    .select()
    .from(careGuidesI18n)
    .where(inArray(careGuidesI18n.guideId, ids));
  for (const row of rows) {
    const entry = map.get(row.guideId);
    if (!entry) continue;
    entry[row.locale as "fa" | "en"] = {
      name: row.name,
      description: row.description,
    };
  }
  return map;
}

export async function loadCareGuideItemsTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<CareGuideItemContent>>> {
  const map = new Map<string, TranslatedContent<CareGuideItemContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) {
    map.set(id, { fa: emptyCareGuideItemContent(), en: emptyCareGuideItemContent() });
  }
  const rows = await db
    .select()
    .from(careGuideItemsI18n)
    .where(inArray(careGuideItemsI18n.itemId, ids));
  for (const row of rows) {
    const entry = map.get(row.itemId);
    if (!entry) continue;
    entry[row.locale as "fa" | "en"] = {
      title: row.title,
      description: row.description,
    };
  }
  return map;
}

export async function upsertCareGuideTranslation(
  tx: Tx,
  guideId: string,
  locale: Locale,
  content: Partial<CareGuideContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(careGuidesI18n)
    .where(and(eq(careGuidesI18n.guideId, guideId), eq(careGuidesI18n.locale, locale)))
    .limit(1);
  const current = existing[0];
  const values = {
    name: content.name ?? current?.name ?? "",
    description:
      content.description !== undefined
        ? content.description ?? null
        : (current?.description ?? null),
  };
  await tx
    .insert(careGuidesI18n)
    .values({ guideId, locale, ...values })
    .onConflictDoUpdate({
      target: [careGuidesI18n.guideId, careGuidesI18n.locale],
      set: values,
    });
}

export async function upsertCareGuideItemTranslation(
  tx: Tx,
  itemId: string,
  locale: Locale,
  content: Partial<CareGuideItemContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(careGuideItemsI18n)
    .where(
      and(eq(careGuideItemsI18n.itemId, itemId), eq(careGuideItemsI18n.locale, locale)),
    )
    .limit(1);
  const current = existing[0];
  const values = {
    title: content.title ?? current?.title ?? "",
    description:
      content.description !== undefined
        ? content.description ?? null
        : (current?.description ?? null),
  };
  await tx
    .insert(careGuideItemsI18n)
    .values({ itemId, locale, ...values })
    .onConflictDoUpdate({
      target: [careGuideItemsI18n.itemId, careGuideItemsI18n.locale],
      set: values,
    });
}
