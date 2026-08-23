import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingAboutStats,
  landingAboutStatsI18n,
} from "@/src/db/schema";
import { bustLandingCache } from "../../landing";
import type { TranslatedContent } from "@/lib/services/types";
import { eachLocale, ensureRow, findHomePageId, genKey, sectionIdByKey } from "./helpers";

export type StatDraft = {
  value: number;
  compact: boolean;
  plus: boolean;
  displayOrder: number;
  isActive: boolean;
  translations: TranslatedContent<{ label: string }>;
};

export async function createStat(draft: StatDraft): Promise<{ id: string }> {
  const pageId = await findHomePageId();
  const sectionId = await sectionIdByKey(pageId, "about");
  const [row] = await db
    .insert(landingAboutStats)
    .values({
      sectionId,
      key: genKey("st"),
      value: draft.value,
      compact: draft.compact,
      plus: draft.plus,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .returning({ id: landingAboutStats.id });
  await eachLocale((l) =>
    db.insert(landingAboutStatsI18n).values({
      statId: row.id,
      locale: l,
      label: draft.translations[l].label,
    }),
  );
  await bustLandingCache();
  return { id: row.id };
}

export async function updateStat(id: string, draft: Partial<StatDraft>): Promise<void> {
  await ensureRow("stats", id);
  await db
    .update(landingAboutStats)
    .set({
      value: draft.value,
      compact: draft.compact,
      plus: draft.plus,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .where(eq(landingAboutStats.id, id));
  if (draft.translations) {
    const translations = draft.translations;
    await eachLocale((l) =>
      db
        .insert(landingAboutStatsI18n)
        .values({ statId: id, locale: l, label: translations[l].label })
        .onConflictDoUpdate({
          target: [landingAboutStatsI18n.statId, landingAboutStatsI18n.locale],
          set: { label: translations[l].label },
        }),
    );
  }
  await bustLandingCache();
}

export async function deleteStat(id: string): Promise<void> {
  await ensureRow("stats", id);
  await db.delete(landingAboutStats).where(eq(landingAboutStats.id, id));
  await bustLandingCache();
}