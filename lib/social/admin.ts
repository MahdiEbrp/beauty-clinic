import { and, count, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { cacheDel } from "@/lib/cache";
import { SOCIAL_LINKS_CACHE_KEY } from "@/lib/settings/loader";
import type { SocialLinkStatusFilter } from "@/lib/validation/social-links";
import { db } from "@/src/db";
import { socialLinks, socialLinksI18n } from "@/src/db/schema";

/** Social link row normalized for the admin list with fa/en labels. */
export type AdminSocialLink = {
  id: string;
  url: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  labelFa: string;
  labelEn: string;
};

export type ListSocialLinksResult = {
  items: AdminSocialLink[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type SocialLinkMutation = {
  url?: string;
  imageUrl?: string | null;
  labelFa?: string;
  labelEn?: string;
  displayOrder?: number;
  isActive?: boolean;
};

function toAdminSocialLink(
  row: typeof socialLinks.$inferSelect,
  labels: Map<string, { fa?: string; en?: string }>,
): AdminSocialLink {
  const entry = labels.get(row.id);
  return {
    id: row.id,
    url: row.url,
    imageUrl: row.imageUrl,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    labelFa: entry?.fa ?? "",
    labelEn: entry?.en ?? "",
  };
}

function listConditions(opts: {
  search?: string;
  status?: SocialLinkStatusFilter;
}): (SQL | undefined)[] {
  const conditions: (SQL | undefined)[] = [];
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        ilike(socialLinks.url, term),
        sql`exists (
          select 1 from ${socialLinksI18n}
          where ${socialLinksI18n.socialLinkId} = ${socialLinks.id}
            and ${socialLinksI18n.label} ilike ${term}
        )`,
      ),
    );
  }
  if (opts.status === "active") conditions.push(eq(socialLinks.isActive, true));
  else if (opts.status === "inactive") conditions.push(eq(socialLinks.isActive, false));
  return conditions;
}

async function loadLabels(ids: string[]): Promise<Map<string, { fa?: string; en?: string }>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select()
    .from(socialLinksI18n)
    .where(inArray(socialLinksI18n.socialLinkId, ids));
  const map = new Map<string, { fa?: string; en?: string }>();
  for (const row of rows) {
    const entry = map.get(row.socialLinkId) ?? {};
    entry[row.locale] = row.label;
    map.set(row.socialLinkId, entry);
  }
  return map;
}

/** Paginated, filterable list of social links for the management screen. */
export async function listSocialLinks(opts: {
  page: number;
  perPage: number;
  search?: string;
  status?: SocialLinkStatusFilter;
}): Promise<ListSocialLinksResult> {
  const { page, perPage, search, status = "all" } = opts;
  const where = and(...listConditions({ search, status }));

  const [countRow] = await db
    .select({ value: count() })
    .from(socialLinks)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select()
    .from(socialLinks)
    .where(where)
    .orderBy(socialLinks.displayOrder, socialLinks.createdAt)
    .limit(perPage)
    .offset((page - 1) * perPage);

  const labels = await loadLabels(rows.map((row) => row.id));

  return {
    items: rows.map((row) => toAdminSocialLink(row, labels)),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/** Returns the ids of social links matching the given search/status filters. */
export async function findSocialLinkIds(opts: {
  search?: string;
  status?: SocialLinkStatusFilter;
}): Promise<string[]> {
  const where = and(...listConditions(opts));
  const rows = await db
    .select({ id: socialLinks.id })
    .from(socialLinks)
    .where(where);
  return rows.map((row) => row.id);
}

/** Full admin row for the edit screen, or null when not found. */
export async function getSocialLinkById(id: string): Promise<AdminSocialLink | null> {
  const [row] = await db.select().from(socialLinks).where(eq(socialLinks.id, id));
  if (!row) return null;
  const labels = await loadLabels([row.id]);
  return toAdminSocialLink(row, labels);
}

export async function createSocialLink(input: SocialLinkMutation): Promise<{ id: string }> {
  const { url, imageUrl = null, displayOrder = 0, isActive = true } = input;
  if (!url) {
    throw new ApiError(400, "INVALID_URL", "A URL is required.");
  }
  const [row] = await db
    .insert(socialLinks)
    .values({ url, imageUrl, displayOrder, isActive })
    .returning({ id: socialLinks.id });
  if (!row) {
    throw new ApiError(500, "SOCIAL_LINK_CREATE_FAILED", "Could not create social link.");
  }
  await db.insert(socialLinksI18n).values([
    { socialLinkId: row.id, locale: "fa", label: input.labelFa ?? "" },
    { socialLinkId: row.id, locale: "en", label: input.labelEn ?? "" },
  ]);
  await bustSocialLinksCache();
  return { id: row.id };
}

export async function updateSocialLink(id: string, input: SocialLinkMutation): Promise<void> {
  const existing = await getSocialLinkById(id);
  if (!existing) {
    throw new ApiError(404, "SOCIAL_LINK_NOT_FOUND", "Social link not found.");
  }

  const patch: Partial<typeof socialLinks.$inferInsert> = {};
  if (input.url !== undefined) patch.url = input.url;
  if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
  if (input.displayOrder !== undefined) patch.displayOrder = input.displayOrder;
  if (input.isActive !== undefined) patch.isActive = input.isActive;
  patch.updatedAt = new Date();

  await db.update(socialLinks).set(patch).where(eq(socialLinks.id, id));

  const labels: Array<{ locale: "fa" | "en"; label: string }> = [];
  if (input.labelFa !== undefined) labels.push({ locale: "fa", label: input.labelFa });
  if (input.labelEn !== undefined) labels.push({ locale: "en", label: input.labelEn });
  if (labels.length > 0) {
    await db
      .insert(socialLinksI18n)
      .values(labels.map((entry) => ({ socialLinkId: id, ...entry })))
      .onConflictDoUpdate({
        target: [socialLinksI18n.socialLinkId, socialLinksI18n.locale],
        set: { label: sql`excluded.label` },
      });
  }

  await bustSocialLinksCache();
}

export async function deleteSocialLink(id: string): Promise<void> {
  const [row] = await db
    .delete(socialLinks)
    .where(eq(socialLinks.id, id))
    .returning({ id: socialLinks.id });
  if (!row) {
    throw new ApiError(404, "SOCIAL_LINK_NOT_FOUND", "Social link not found.");
  }
  await bustSocialLinksCache();
}

export async function setSocialLinkActive(id: string, isActive: boolean): Promise<void> {
  const [row] = await db
    .update(socialLinks)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(socialLinks.id, id))
    .returning({ id: socialLinks.id });
  if (!row) {
    throw new ApiError(404, "SOCIAL_LINK_NOT_FOUND", "Social link not found.");
  }
  await bustSocialLinksCache();
}

export async function bulkUpdateSocialLinks(
  ids: string[],
  action: "activate" | "deactivate",
): Promise<void> {
  if (ids.length === 0) return;
  await db
    .update(socialLinks)
    .set({ isActive: action === "activate", updatedAt: new Date() })
    .where(inArray(socialLinks.id, ids));
  await bustSocialLinksCache();
}

export async function bulkDeleteSocialLinks(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db.delete(socialLinks).where(inArray(socialLinks.id, ids));
  await bustSocialLinksCache();
}

/** Drop the cached social-links dataset so next public render refreshes. */
export async function bustSocialLinksCache(): Promise<void> {
  await cacheDel(SOCIAL_LINKS_CACHE_KEY);
}