import { and, eq, ne } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceGroups,
  services,
} from "@/src/db/schema";
import type {
  AdminService,
  AdminServiceCategory,
  AdminServiceFaq,
  AdminServiceGroup,
  AdminServiceImage,
  TranslatedContent,
  ServiceCategoryContent,
  ServiceContent,
  ServiceGroupContent,
} from "./types";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function uniqueSlugError(resource: string): ApiError {
  return new ApiError(
    409,
    "SLUG_TAKEN",
    `A ${resource} with this slug already exists.`,
  );
}

/** numeric columns come back as strings; normalize for the admin UI. */
function toNumber(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

/** numeric columns accept strings at write time; normalize the admin input. */
export function priceToColumn(value: number | null | undefined): string | null {
  return value === undefined || value === null ? null : String(value);
}

export function mapServiceRow(
  row: typeof services.$inferSelect,
  tr: TranslatedContent<ServiceContent>,
  categoryName: string,
  groupId: string,
  groupName: string,
  images: AdminServiceImage[] = [],
  faqs: AdminServiceFaq[] = [],
): AdminService {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName,
    groupId,
    groupName,
    slug: row.slug,
    price: toNumber(row.price),
    priceType: row.priceType,
    durationMin: row.durationMin,
    sessionsCount: row.sessionsCount,
    coverImage: row.coverImage,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    title: tr.fa.title,
    shortDesc: tr.fa.shortDesc,
    fullDesc: tr.fa.fullDesc,
    translations: tr,
    images,
    faqs,
  };
}

export function mapCategoryRow(
  row: typeof serviceCategories.$inferSelect,
  tr: TranslatedContent<ServiceCategoryContent>,
  groupName: string,
  serviceCount: number,
): AdminServiceCategory {
  return {
    id: row.id,
    groupId: row.groupId,
    groupName,
    slug: row.slug,
    icon: row.icon,
    image: row.image,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    serviceCount,
    name: tr.fa.name,
    description: tr.fa.description,
    seoTitle: tr.fa.seoTitle,
    seoDescription: tr.fa.seoDescription,
    translations: tr,
  };
}

export function mapGroupRow(
  row: typeof serviceGroups.$inferSelect,
  tr: TranslatedContent<ServiceGroupContent>,
  categoryCount: number,
): AdminServiceGroup {
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    image: row.image,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    categoryCount,
    name: tr.fa.name,
    description: tr.fa.description,
    seoTitle: tr.fa.seoTitle,
    seoDescription: tr.fa.seoDescription,
    translations: tr,
  };
}

export async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, categoryId),
    columns: { id: true },
  });
  if (!category) {
    throw new ApiError(400, "INVALID_CATEGORY", "The selected category does not exist.");
  }
}

export async function assertGroupExists(groupId: string): Promise<void> {
  const group = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, groupId),
    columns: { id: true },
  });
  if (!group) {
    throw new ApiError(400, "INVALID_GROUP", "The selected group does not exist.");
  }
}

/**
 * Deterministic pre-check for slug conflicts on update. The DB unique index
 * is still the source of truth (races are caught in the try/catch below),
 * but checking first gives callers a clean 409 without a write attempt.
 */
export async function assertSlugAvailable(
  table: "services" | "service_groups" | "service_categories",
  slug: string,
  excludeId?: string,
): Promise<void> {
  const target =
    table === "services"
      ? services
      : table === "service_groups"
        ? serviceGroups
        : serviceCategories;
  const idColumn =
    table === "services"
      ? services.id
      : table === "service_groups"
        ? serviceGroups.id
        : serviceCategories.id;
  const slugColumn =
    table === "services"
      ? services.slug
      : table === "service_groups"
        ? serviceGroups.slug
        : serviceCategories.slug;

  const [conflict] = await db
    .select({ id: idColumn })
    .from(target)
    .where(excludeId ? and(eq(slugColumn, slug), ne(idColumn, excludeId)) : eq(slugColumn, slug))
    .limit(1);
  if (conflict) {
    const label = table === "services" ? "service" : table === "service_groups" ? "group" : "category";
    throw uniqueSlugError(label);
  }
}

export { isUniqueViolation, uniqueSlugError };