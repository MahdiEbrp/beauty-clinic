import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/src/db";
import {
  landingServices,
  landingServicesI18n,
} from "@/src/db/schema";
import { bustLandingCache } from "../../landing";
import type { TranslatedContent } from "@/lib/services/types";
import { eachLocale, ensureRow, findHomePageId, genKey, sectionIdByKey } from "./helpers";

export type ServiceCardDraft = {
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  translations: TranslatedContent<{
    title: string;
    description?: string | null;
    ctaLabel?: string | null;
  }>;
};

export async function createServiceCard(draft: ServiceCardDraft): Promise<{ id: string }> {
  const pageId = await findHomePageId();
  const sectionId = await sectionIdByKey(pageId, "services");
  const [row] = await db
    .insert(landingServices)
    .values({
      sectionId,
      key: genKey("sc"),
      icon: draft.icon,
      image: draft.image,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .returning({ id: landingServices.id });
  await eachLocale((l) =>
    db.insert(landingServicesI18n).values({
      landingServiceId: row.id,
      locale: l,
      title: draft.translations[l].title,
      description: draft.translations[l].description ?? null,
      ctaLabel: draft.translations[l].ctaLabel ?? null,
    }),
  );
  await bustLandingCache();
  return { id: row.id };
}

export async function updateServiceCard(
  id: string,
  draft: Partial<ServiceCardDraft>,
): Promise<void> {
  await ensureRow("services", id);
  await db
    .update(landingServices)
    .set({
      icon: draft.icon,
      image: draft.image,
      displayOrder: draft.displayOrder,
      isActive: draft.isActive,
    })
    .where(eq(landingServices.id, id));
  if (draft.translations) {
    await eachLocale((l) =>
      db
        .insert(landingServicesI18n)
        .values({
          landingServiceId: id,
          locale: l,
          title: draft.translations![l].title,
          description: draft.translations![l].description ?? null,
          ctaLabel: draft.translations![l].ctaLabel ?? null,
        })
        .onConflictDoUpdate({
          target: [landingServicesI18n.landingServiceId, landingServicesI18n.locale],
          set: {
            title: draft.translations![l].title,
            description: draft.translations![l].description ?? null,
            ctaLabel: draft.translations![l].ctaLabel ?? null,
          },
        }),
    );
  }
  await bustLandingCache();
}

export async function deleteServiceCard(id: string): Promise<void> {
  await ensureRow("services", id);
  await db.delete(landingServices).where(eq(landingServices.id, id));
  await bustLandingCache();
}