import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingGalleryItems,
  landingGalleryItemsI18n,
} from "@/src/db/schema";
import { bustLandingCache } from "../../landing";
import type { TranslatedContent } from "@/lib/services/types";
import { eachLocale, ensureRow, findHomePageId, genKey, sectionIdByKey } from "./helpers";

export type GalleryDraft = {
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  translations: TranslatedContent<{ alt: string; caption?: string | null }>;
};

export async function createGalleryItem(draft: GalleryDraft): Promise<{ id: string }> {
  const pageId = await findHomePageId();
  const sectionId = await sectionIdByKey(pageId, "gallery");
  const [row] = await db
    .insert(landingGalleryItems)
    .values({
      sectionId,
      key: genKey("gl"),
      imageUrl: draft.imageUrl,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .returning({ id: landingGalleryItems.id });
  await eachLocale((l) =>
    db.insert(landingGalleryItemsI18n).values({
      galleryItemId: row.id,
      locale: l,
      alt: draft.translations[l].alt,
      caption: draft.translations[l].caption ?? null,
    }),
  );
  await bustLandingCache();
  return { id: row.id };
}

export async function updateGalleryItem(
  id: string,
  draft: Partial<GalleryDraft>,
): Promise<void> {
  await ensureRow("gallery", id);
  await db
    .update(landingGalleryItems)
    .set({ imageUrl: draft.imageUrl, displayOrder: draft.displayOrder, isActive: draft.isActive })
    .where(eq(landingGalleryItems.id, id));
  if (draft.translations) {
    const translations = draft.translations;
    await eachLocale((l) =>
      db
        .insert(landingGalleryItemsI18n)
        .values({
          galleryItemId: id,
          locale: l,
          alt: translations[l].alt,
          caption: translations[l].caption ?? null,
        })
        .onConflictDoUpdate({
          target: [landingGalleryItemsI18n.galleryItemId, landingGalleryItemsI18n.locale],
          set: {
            alt: translations[l].alt,
            caption: translations[l].caption ?? null,
          },
        }),
    );
  }
  await bustLandingCache();
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await ensureRow("gallery", id);
  await db.delete(landingGalleryItems).where(eq(landingGalleryItems.id, id));
  await bustLandingCache();
}