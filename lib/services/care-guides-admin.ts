import "server-only";

import { eq, inArray } from "drizzle-orm";

import { cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import { careGuideItems, careGuides } from "@/src/db/schema";
import { bumpContentVersion, getContentVersion } from "./content-version";
import type { PublicCareGuide } from "./care-guides-types";
import {
  emptyCareGuideContent,
  loadCareGuideItemsTranslations,
  loadCareGuidesTranslations,
} from "./care-guides-i18n";
import type { Locale } from "./types";

/** TTL for the cached public care-guides feed (seconds). */
const CARE_GUIDES_TTL_SECS = 7 * 24 * 60 * 60;

const CACHE_PREFIX = "care-guides:public";
function publicCacheKey(locale: Locale, version: number): string {
  return `${CACHE_PREFIX}:v${version}:${locale}`;
}

export async function getCareGuidesForPublic(
  locale: Locale,
  opts: { status?: "active" | "inactive" | "all" } = {},
): Promise<PublicCareGuide[]> {
  const status = opts.status ?? "active";
  const version = await getContentVersion();
  return cacheWrap(publicCacheKey(locale, version), CARE_GUIDES_TTL_SECS, () =>
    loadPublicGuides(locale, status),
  );
}

async function loadPublicGuides(
  locale: Locale,
  status: "active" | "inactive" | "all",
): Promise<PublicCareGuide[]> {
  const where =
    status === "active"
      ? eq(careGuides.isActive, true)
      : status === "inactive"
        ? eq(careGuides.isActive, false)
        : undefined;

  const guides = await db
    .select()
    .from(careGuides)
    .where(where)
    .orderBy(careGuides.displayOrder, careGuides.createdAt);

  const guideIds = guides.map((row) => row.id);
  const [guideTr, items] = await Promise.all([
    loadCareGuidesTranslations(guideIds),
    loadItemsForGuides(guideIds),
  ]);

  const itemIds = items.map((item) => item.id);
  const itemTr = await loadCareGuideItemsTranslations(itemIds);

  return guides.map((guide) => {
    const guideContent =
      locale === "en"
        ? guideTr.get(guide.id)?.en ?? emptyCareGuideContent()
        : guideTr.get(guide.id)?.fa ?? emptyCareGuideContent();
    return {
      id: guide.id,
      slug: guide.slug,
      name: guideContent.name,
      description: guideContent.description,
      icon: guide.icon,
      displayOrder: guide.displayOrder,
      items: items
        .filter((item) => item.guideId === guide.id)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => {
          const content =
            locale === "en" ? itemTr.get(item.id)?.en : itemTr.get(item.id)?.fa;
          return {
            id: item.id,
            title: content?.title ?? "",
            description: content?.description ?? null,
            highlighted: item.highlighted,
            displayOrder: item.displayOrder,
          };
        }),
    };
  });
}

async function loadItemsForGuides(
  guideIds: string[],
): Promise<
  Array<{ id: string; guideId: string; highlighted: boolean; displayOrder: number }>
> {
  if (guideIds.length === 0) return [];
  return db
    .select({
      id: careGuideItems.id,
      guideId: careGuideItems.guideId,
      highlighted: careGuideItems.highlighted,
      displayOrder: careGuideItems.displayOrder,
    })
    .from(careGuideItems)
    .where(inArray(careGuideItems.guideId, guideIds));
}

/** Invalidate all versioned public content caches after a care-guide mutation. */
export async function bustPublicCareGuidesCache(): Promise<void> {
  await bumpContentVersion();
}
