import { and, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type { CareGuideStatusFilter } from "@/lib/validation/care-guides";
import { db } from "@/src/db";
import { careGuideItems, careGuides, careGuidesI18n } from "@/src/db/schema";
import { assertSlugAvailable, isUniqueViolation, uniqueSlugError } from "./helpers";
import { bumpContentVersion } from "./content-version";
import type {
  AdminCareGuide,
  ListCareGuidesResult,
} from "./care-guides-types";
import {
  emptyCareGuideContent,
  loadCareGuidesTranslations,
  upsertCareGuideTranslation,
} from "./care-guides-i18n";
import type { Locale } from "./types";

function mapGuideRow(
  row: typeof careGuides.$inferSelect,
  content: {
    fa: { name: string; description: string | null };
    en: { name: string; description: string | null };
  },
  itemCount: number,
): AdminCareGuide {
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    itemCount,
    name: content.fa.name,
    description: content.fa.description,
    translations: content,
  };
}

function guideListConditions(opts: {
  search?: string;
  status?: CareGuideStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(careGuides.slug, term),
        sql`exists (
          select 1 from ${careGuidesI18n}
          where ${careGuidesI18n.guideId} = ${careGuides.id}
            and ${careGuidesI18n.name} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(careGuides.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(careGuides.isActive, false));
  return conditions;
}

export async function getCareGuide(id: string): Promise<AdminCareGuide> {
  const row = await db.query.careGuides.findFirst({
    where: eq(careGuides.id, id),
  });
  if (!row) throw new ApiError(404, "CARE_GUIDE_NOT_FOUND", "Care guide not found.");

  const tr = (await loadCareGuidesTranslations([id])).get(id) ?? {
    fa: emptyCareGuideContent(),
    en: emptyCareGuideContent(),
  };
  const [countRow] = await db
    .select({ value: count() })
    .from(careGuideItems)
    .where(eq(careGuideItems.guideId, id));
  return mapGuideRow(row, tr, countRow?.value ?? 0);
}

async function loadItemCounts(guideIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (guideIds.length === 0) return map;
  const rows = await db
    .select({ guideId: careGuideItems.guideId, value: count() })
    .from(careGuideItems)
    .where(inArray(careGuideItems.guideId, guideIds))
    .groupBy(careGuideItems.guideId);
  for (const row of rows) map.set(row.guideId, row.value);
  return map;
}

export async function listCareGuidesAdmin(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: CareGuideStatusFilter;
}): Promise<ListCareGuidesResult> {
  const { page, perPage, search, status = "all" } = opts;
  const offset = (page - 1) * perPage;
  const where = and(...guideListConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(careGuides)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(careGuides)
    .where(where)
    .orderBy(careGuides.displayOrder, careGuides.createdAt)
    .limit(perPage)
    .offset(offset);

  const ids = rows.map((row) => row.id);
  const [trMap, itemCounts] = await Promise.all([
    loadCareGuidesTranslations(ids),
    loadItemCounts(ids),
  ]);

  return {
    items: rows.map((row) =>
      mapGuideRow(
        row,
        trMap.get(row.id) ?? { fa: emptyCareGuideContent(), en: emptyCareGuideContent() },
        itemCounts.get(row.id) ?? 0,
      ),
    ),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function findGuideIds(opts: {
  search?: string;
  status?: CareGuideStatusFilter;
}): Promise<string[]> {
  const where = and(...guideListConditions(opts));
  const rows = await db
    .select({ id: careGuides.id })
    .from(careGuides)
    .where(where);
  return rows.map((row) => row.id);
}

/** Lightweight guide options (id + fa name) for the item wizard's picker. */
export async function listGuideOptions(): Promise<Array<{ id: string; name: string }>> {
  const rows = await db
    .select({ id: careGuides.id, displayOrder: careGuides.displayOrder })
    .from(careGuides)
    .orderBy(careGuides.displayOrder, careGuides.createdAt);
  const guideTr = await loadCareGuidesTranslations(rows.map((row) => row.id));
  return rows.map((row) => ({
    id: row.id,
    name: guideTr.get(row.id)?.fa.name ?? "",
  }));
}

export async function createCareGuide(input: {
  slug: string;
  icon?: string | null;
  displayOrder: number;
  isActive: boolean;
  translations: {
    fa: { name: string; description?: string | null };
    en: { name: string; description?: string | null };
  };
}): Promise<{ id: string }> {
  try {
    const result = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(careGuides)
        .values({
          slug: input.slug,
          icon: input.icon ?? null,
          displayOrder: input.displayOrder,
          isActive: input.isActive,
        })
        .returning({ id: careGuides.id });
      if (!row) {
        throw new ApiError(500, "CARE_GUIDE_CREATE_FAILED", "Could not create care guide.");
      }
      const translations = input.translations;
      await tx.insert(careGuidesI18n).values([
        {
          guideId: row.id,
          locale: "fa",
          name: translations.fa.name,
          description: translations.fa.description ?? null,
        },
        {
          guideId: row.id,
          locale: "en",
          name: translations.en.name,
          description: translations.en.description ?? null,
        },
      ]);
      return { id: row.id };
    });
    await bustCareGuidesCache();
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("care guide");
    throw error;
  }
}

export async function updateCareGuide(
  id: string,
  input: {
    slug?: string;
    icon?: string | null;
    displayOrder?: number;
    isActive?: boolean;
    translations?: {
      fa?: Partial<{ name: string; description: string | null }>;
      en?: Partial<{ name: string; description: string | null }>;
    };
  },
): Promise<void> {
  const existing = await db.query.careGuides.findFirst({
    where: eq(careGuides.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CARE_GUIDE_NOT_FOUND", "Care guide not found.");
  }
  if (input.slug !== undefined) {
    await assertSlugAvailable("care_guides", input.slug, id);
  }
  try {
    await db.transaction(async (tx) => {
      const { translations, ...rest } = input;
      if (Object.keys(rest).length > 0) {
        await tx.update(careGuides).set(rest).where(eq(careGuides.id, id));
      }
      if (translations) {
        const entries = Object.entries(translations) as [
          Locale,
          Partial<{ name: string; description: string | null }>,
        ][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertCareGuideTranslation(tx, id, locale, content);
        }
      }
    });
    await bustCareGuidesCache();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("care guide");
    throw error;
  }
}

export async function deleteCareGuide(id: string): Promise<void> {
  const existing = await db.query.careGuides.findFirst({
    where: eq(careGuides.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CARE_GUIDE_NOT_FOUND", "Care guide not found.");
  }
  await db.delete(careGuides).where(eq(careGuides.id, id));
  await bustCareGuidesCache();
}

export async function bustCareGuidesCache(): Promise<void> {
  await bumpContentVersion();
}
