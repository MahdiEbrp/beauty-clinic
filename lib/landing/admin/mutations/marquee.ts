import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingMarqueeItems,
  landingMarqueeItemsI18n,
} from "@/src/db/schema";
import { bustLandingCache } from "../../landing";
import type { TranslatedContent } from "@/lib/services/types";
import { eachLocale, ensureRow, findHomePageId, genKey } from "./helpers";

export type MarqueeDraft = {
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  translations: TranslatedContent<{ text: string }>;
};

export async function createMarqueeItem(draft: MarqueeDraft): Promise<{ id: string }> {
  const pageId = await findHomePageId();
  const [row] = await db
    .insert(landingMarqueeItems)
    .values({
      landingPageId: pageId,
      key: genKey("mq"),
      icon: draft.icon,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .returning({ id: landingMarqueeItems.id });
  await eachLocale((l) =>
    db.insert(landingMarqueeItemsI18n).values({
      marqueeItemId: row.id,
      locale: l,
      text: draft.translations[l].text,
    }),
  );
  await bustLandingCache();
  return { id: row.id };
}

export async function updateMarqueeItem(id: string, draft: Partial<MarqueeDraft>): Promise<void> {
  await ensureRow("marquee", id);
  await db
    .update(landingMarqueeItems)
    .set({
      icon: draft.icon,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .where(eq(landingMarqueeItems.id, id));
  if (draft.translations) {
    const translations = draft.translations;
    await eachLocale((l) =>
      db
        .insert(landingMarqueeItemsI18n)
        .values({ marqueeItemId: id, locale: l, text: translations[l].text })
        .onConflictDoUpdate({
          target: [landingMarqueeItemsI18n.marqueeItemId, landingMarqueeItemsI18n.locale],
          set: { text: translations[l].text },
        }),
    );
  }
  await bustLandingCache();
}

export async function deleteMarqueeItem(id: string): Promise<void> {
  await ensureRow("marquee", id);
  await db.delete(landingMarqueeItems).where(eq(landingMarqueeItems.id, id));
  await bustLandingCache();
}