import { and, eq, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type { CareGuideItemStatusFilter } from "@/lib/validation/care-guides";
import { db } from "@/src/db";
import { careGuideItems, careGuideItemsI18n, careGuides } from "@/src/db/schema";
import { bustCareGuidesCache } from "./care-guides";
import { isUniqueViolation } from "./helpers";
import type { AdminCareGuideItem, ListCareGuideItemsResult } from "./care-guides-types";
import {
  emptyCareGuideItemContent,
  loadCareGuideItemsTranslations,
  loadCareGuidesTranslations,
  upsertCareGuideItemTranslation,
} from "./care-guides-i18n";
import type { Locale } from "./types";

function mapItemRow(
  row: typeof careGuideItems.$inferSelect,
  content: {
    fa: { title: string; description: string | null };
    en: { title: string; description: string | null };
  },
  guideName: string,
): AdminCareGuideItem {
  return {
    id: row.id,
    guideId: row.guideId,
    guideName,
    highlighted: row.highlighted,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    title: content.fa.title,
    description: content.fa.description,
    translations: content,
  };
}

async function assertGuideExists(guideId: string): Promise<void> {
  const guide = await db.query.careGuides.findFirst({
    where: eq(careGuides.id, guideId),
    columns: { id: true },
  });
  if (!guide) {
    throw new ApiError(400, "INVALID_CARE_GUIDE", "The selected care guide does not exist.");
  }
}

export async function getCareGuideItem(id: string): Promise<AdminCareGuideItem> {
  const row = await db.query.careGuideItems.findFirst({
    where: eq(careGuideItems.id, id),
  });
  if (!row) throw new ApiError(404, "CARE_GUIDE_ITEM_NOT_FOUND", "Care guide item not found.");

  const [tr, guideTr] = await Promise.all([
    loadCareGuideItemsTranslations([id]),
    loadCareGuidesTranslations([row.guideId]),
  ]);
  const content = tr.get(id) ?? {
    fa: emptyCareGuideItemContent(),
    en: emptyCareGuideItemContent(),
  };
  const guideName = guideTr.get(row.guideId)?.fa.name ?? "";
  return mapItemRow(row, content, guideName);
}

function itemListConditions(opts: {
  search?: string;
  status?: CareGuideItemStatusFilter;
  guideId?: string;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.guideId) conditions.push(eq(careGuideItems.guideId, opts.guideId));
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      sql`exists (
        select 1 from ${careGuideItemsI18n}
        where ${careGuideItemsI18n.itemId} = ${careGuideItems.id}
          and ${careGuideItemsI18n.title} ilike ${term}
      )`,
    );
  }
  if (opts.status === "active") conditions.push(eq(careGuideItems.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(careGuideItems.isActive, false));
  return conditions;
}

export async function listCareGuideItemsAdmin(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: CareGuideItemStatusFilter;
  guideId?: string;
}): Promise<ListCareGuideItemsResult> {
  const { page, perPage, search, status = "all", guideId } = opts;
  const offset = (page - 1) * perPage;
  const where = and(...itemListConditions({ search, status, guideId }));

  const [countRow] = await db
    .select({ value: sql<number>`count(*)` })
    .from(careGuideItems)
    .where(where);
  const total = Number(countRow?.value ?? 0);

  const rows = await db
    .select()
    .from(careGuideItems)
    .where(where)
    .orderBy(careGuideItems.guideId, careGuideItems.displayOrder, careGuideItems.createdAt)
    .limit(perPage)
    .offset(offset);

  const itemIds = rows.map((row) => row.id);
  const guideIds = [...new Set(rows.map((row) => row.guideId))];
  const [trMap, guideTr] = await Promise.all([
    loadCareGuideItemsTranslations(itemIds),
    loadCareGuidesTranslations(guideIds),
  ]);

  return {
    items: rows.map((row) =>
      mapItemRow(
        row,
        trMap.get(row.id) ?? {
          fa: emptyCareGuideItemContent(),
          en: emptyCareGuideItemContent(),
        },
        guideTr.get(row.guideId)?.fa.name ?? "",
      ),
    ),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function findCareGuideItemIds(opts: {
  search?: string;
  status?: CareGuideItemStatusFilter;
  guideId?: string;
}): Promise<string[]> {
  const where = and(...itemListConditions(opts));
  const rows = await db
    .select({ id: careGuideItems.id })
    .from(careGuideItems)
    .where(where);
  return rows.map((row) => row.id);
}

async function nextDisplayOrder(guideId: string): Promise<number> {
  const rows = await db
    .select({ displayOrder: careGuideItems.displayOrder })
    .from(careGuideItems)
    .where(eq(careGuideItems.guideId, guideId))
    .orderBy(careGuideItems.displayOrder);
  return rows.length === 0 ? 1 : rows[rows.length - 1].displayOrder + 1;
}

export async function createCareGuideItem(input: {
  guideId: string;
  highlighted: boolean;
  displayOrder?: number;
  isActive: boolean;
  translations: {
    fa: { title: string; description?: string | null };
    en: { title: string; description?: string | null };
  };
}): Promise<{ id: string }> {
  await assertGuideExists(input.guideId);
  try {
    const result = await db.transaction(async (tx) => {
      const displayOrder = input.displayOrder ?? (await nextDisplayOrder(input.guideId));
      const [row] = await tx
        .insert(careGuideItems)
        .values({
          guideId: input.guideId,
          highlighted: input.highlighted,
          displayOrder,
          isActive: input.isActive,
        })
        .returning({ id: careGuideItems.id });
      if (!row) {
        throw new ApiError(500, "CARE_GUIDE_ITEM_CREATE_FAILED", "Could not create care guide item.");
      }
      const translations = input.translations;
      await tx.insert(careGuideItemsI18n).values([
        { itemId: row.id, locale: "fa", title: translations.fa.title, description: translations.fa.description ?? null },
        { itemId: row.id, locale: "en", title: translations.en.title, description: translations.en.description ?? null },
      ]);
      return { id: row.id };
    });
    await bustCareGuidesCache();
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) {
      throw new ApiError(409, "CARE_GUIDE_ITEM_ORDER_TAKEN", "An item with this position already exists in the guide.");
    }
    throw error;
  }
}

export async function updateCareGuideItem(
  id: string,
  input: {
    guideId?: string;
    highlighted?: boolean;
    displayOrder?: number;
    isActive?: boolean;
    translations?: {
      fa?: Partial<{ title: string; description: string | null }>;
      en?: Partial<{ title: string; description: string | null }>;
    };
  },
): Promise<void> {
  const existing = await db.query.careGuideItems.findFirst({
    where: eq(careGuideItems.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CARE_GUIDE_ITEM_NOT_FOUND", "Care guide item not found.");
  }
  if (input.guideId !== undefined) {
    await assertGuideExists(input.guideId);
  }
  try {
    await db.transaction(async (tx) => {
      const { translations, ...rest } = input;
      if (Object.keys(rest).length > 0) {
        await tx.update(careGuideItems).set(rest).where(eq(careGuideItems.id, id));

      }
      if (translations) {
        const entries = Object.entries(translations) as [
          Locale,
          Partial<{ title: string; description: string | null }>,
        ][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertCareGuideItemTranslation(tx, id, locale, content);
        }
      }
    });
    await bustCareGuidesCache();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) {
      throw new ApiError(409, "CARE_GUIDE_ITEM_ORDER_TAKEN", "An item with this position already exists in the guide.");
    }
    throw error;
  }
}

export async function deleteCareGuideItem(id: string): Promise<void> {
  const existing = await db.query.careGuideItems.findFirst({
    where: eq(careGuideItems.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CARE_GUIDE_ITEM_NOT_FOUND", "Care guide item not found.");
  }
  await db.delete(careGuideItems).where(eq(careGuideItems.id, id));
  await bustCareGuidesCache();
}

// Re-exported so item mutations can read items by guide in bulk if needed.
export { loadCareGuideItemsTranslations };
