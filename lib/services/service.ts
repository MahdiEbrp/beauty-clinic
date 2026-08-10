/* eslint-disable max-lines -- comprehensive service layer with CRUD operations for services, groups, categories, and FAQs */

import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type {
  CreateServiceCategoryInput,
  CreateServiceGroupInput,
  CreateServiceInput,
  UpdateServiceCategoryInput,
  UpdateServiceGroupInput,
  UpdateServiceInput,
} from "@/lib/validation/services";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceFaqs,
  serviceGroups,
  serviceImages,
  services,
} from "@/src/db/schema";
import type {
  AdminService,
  AdminServiceCategory,
  AdminServiceGroup,
  AdminServiceFaq,
  AdminServiceImage,
  ListServicesResult,
  ServiceCatalogSummary,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
function priceToColumn(value: number | null | undefined): string | null {
  return value === undefined || value === null ? null : String(value);
}

function mapService(
  row: typeof services.$inferSelect,
): Omit<AdminService, "categoryName" | "groupId" | "groupName" | "images" | "faqs"> {
  return {
    id: row.id,
    categoryId: row.categoryId,
    title: row.title,
    slug: row.slug,
    shortDesc: row.shortDesc,
    fullDesc: row.fullDesc,
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
  };
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, categoryId),
    columns: { id: true },
  });
  if (!category) {
    throw new ApiError(400, "INVALID_CATEGORY", "The selected category does not exist.");
  }
}

async function assertGroupExists(groupId: string): Promise<void> {
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
async function assertSlugAvailable(
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
  const idColumn = table === "services" ? services.id : table === "service_groups" ? serviceGroups.id : serviceCategories.id;
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

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type ListServicesOptions = {
  page: number;
  perPage: number;
  search?: string;
  categoryId?: string;
  status?: "all" | "active" | "inactive";
  featured?: "all" | "yes" | "no";
};

export async function listServices(
  opts: ListServicesOptions,
): Promise<ListServicesResult> {
  const { page, perPage, search, categoryId, status = "all", featured = "all" } = opts;
  const offset = page > 0 ? (page - 1) * perPage : 0;

  const conditions: (SQL | undefined)[] = [];
  if (search) {
    const term = `%${search}%`;
    conditions.push(or(ilike(services.title, term), ilike(services.slug, term)));
  }
  if (categoryId) conditions.push(eq(services.categoryId, categoryId));
  if (status === "active") conditions.push(eq(services.isActive, true));
  if (status === "inactive") conditions.push(eq(services.isActive, false));
  if (featured === "yes") conditions.push(eq(services.isFeatured, true));
  if (featured === "no") conditions.push(eq(services.isFeatured, false));

  const where = and(...conditions);

  const [countRow] = await db
    .select({ value: count() })
    .from(services)
    .where(where);
  const total = countRow?.value ?? 0;

  const rows = await db
    .select({
      id: services.id,
      categoryId: services.categoryId,
      title: services.title,
      slug: services.slug,
      shortDesc: services.shortDesc,
      fullDesc: services.fullDesc,
      price: services.price,
      priceType: services.priceType,
      durationMin: services.durationMin,
      sessionsCount: services.sessionsCount,
      coverImage: services.coverImage,
      isActive: services.isActive,
      isFeatured: services.isFeatured,
      displayOrder: services.displayOrder,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .where(where)
    .orderBy(desc(services.createdAt))
    .limit(perPage)
    .offset(offset);

  const categoryIds = [...new Set(rows.map((row) => row.categoryId))];
  const categoryRows = categoryIds.length
    ? await db
        .select({
          categoryId: serviceCategories.id,
          categoryName: serviceCategories.name,
          groupId: serviceCategories.groupId,
          groupName: serviceGroups.name,
        })
        .from(serviceCategories)
        .innerJoin(serviceGroups, eq(serviceCategories.groupId, serviceGroups.id))
        .where(inArray(serviceCategories.id, categoryIds))
    : [];
  const categoryById = new Map(categoryRows.map((row) => [row.categoryId, row]));

  const items: AdminService[] = rows.map((row) => {
    const category = categoryById.get(row.categoryId);
    return {
      id: row.id,
      categoryId: row.categoryId,
      categoryName: category?.categoryName ?? "",
      groupId: category?.groupId ?? "",
      groupName: category?.groupName ?? "",
      title: row.title,
      slug: row.slug,
      shortDesc: row.shortDesc,
      fullDesc: row.fullDesc,
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
      images: [],
      faqs: [],
    };
  });

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getService(id: string): Promise<AdminService> {
  const row = await db.query.services.findFirst({
    where: eq(services.id, id),
  });
  if (!row) throw new ApiError(404, "SERVICE_NOT_FOUND", "Service not found.");

  const category = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, row.categoryId),
    columns: { id: true, groupId: true, name: true },
  });
  const group = category?.groupId
    ? await db.query.serviceGroups.findFirst({
        where: eq(serviceGroups.id, category.groupId),
        columns: { id: true, name: true },
      })
    : undefined;

  const imageRows = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.serviceId, id))
    .orderBy(serviceImages.displayOrder, serviceImages.id);
  const faqRows = await db
    .select()
    .from(serviceFaqs)
    .where(eq(serviceFaqs.serviceId, id))
    .orderBy(serviceFaqs.displayOrder, serviceFaqs.id);

  const images: AdminServiceImage[] = imageRows.map((image) => ({
    id: image.id,
    serviceId: image.serviceId,
    imageUrl: image.imageUrl,
    type: image.type,
    displayOrder: image.displayOrder,
    createdAt: image.createdAt,
  }));
  const faqs: AdminServiceFaq[] = faqRows.map((faq) => ({
    id: faq.id,
    serviceId: faq.serviceId,
    question: faq.question,
    answer: faq.answer,
    displayOrder: faq.displayOrder,
    createdAt: faq.createdAt,
  }));

  return {
    ...mapService(row),
    categoryName: category?.name ?? "",
    groupId: category?.groupId ?? "",
    groupName: group?.name ?? "",
    images,
    faqs,
  };
}

export async function createService(
  input: CreateServiceInput,
): Promise<{ id: string }> {
  await assertCategoryExists(input.categoryId);

  try {
    return await db.transaction(async (tx) => {
      const [service] = await tx
        .insert(services)
        .values({
          categoryId: input.categoryId,
          title: input.title,
          slug: input.slug,
          shortDesc: input.shortDesc,
          fullDesc: input.fullDesc,
          price: priceToColumn(input.price),
          priceType: input.priceType,
          durationMin: input.durationMin,
          sessionsCount: input.sessionsCount,
          coverImage: input.coverImage,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          displayOrder: input.displayOrder,
        })
        .returning({ id: services.id });
      if (!service) {
        throw new ApiError(500, "SERVICE_CREATE_FAILED", "Could not create service.");
      }

      if (input.images && input.images.length > 0) {
        await tx
          .insert(serviceImages)
          .values(input.images.map((image) => ({ serviceId: service.id, ...image })));
      }
      if (input.faqs && input.faqs.length > 0) {
        await tx
          .insert(serviceFaqs)
          .values(input.faqs.map((faq) => ({ serviceId: service.id, ...faq })));
      }

      return { id: service.id };
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("service");
    throw error;
  }
}

export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<void> {
  const existing = await db.query.services.findFirst({
    where: eq(services.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "SERVICE_NOT_FOUND", "Service not found.");

  if (input.categoryId !== undefined) {
    await assertCategoryExists(input.categoryId);
  }
  if (input.slug !== undefined) {
    await assertSlugAvailable("services", input.slug, id);
  }

  try {
    await db.transaction(async (tx) => {
      const { images, faqs, price, ...rest } = input;
      const set: Record<string, unknown> = { ...rest };
      if (price !== undefined) set.price = priceToColumn(price);
      if (Object.keys(set).length > 0) {
        await tx.update(services).set(set).where(eq(services.id, id));
      }
      if (images !== undefined) {
        await tx.delete(serviceImages).where(eq(serviceImages.serviceId, id));
        if (images.length > 0) {
          await tx
            .insert(serviceImages)
            .values(images.map((image) => ({ serviceId: id, ...image })));
        }
      }
      if (faqs !== undefined) {
        await tx.delete(serviceFaqs).where(eq(serviceFaqs.serviceId, id));
        if (faqs.length > 0) {
          await tx
            .insert(serviceFaqs)
            .values(faqs.map((faq) => ({ serviceId: id, ...faq })));
        }
      }
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("service");
    throw error;
  }
}

export async function deleteService(id: string): Promise<void> {
  const existing = await db.query.services.findFirst({
    where: eq(services.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "SERVICE_NOT_FOUND", "Service not found.");

  await db.delete(services).where(eq(services.id, id));
}

// ---------------------------------------------------------------------------
// Service groups
// ---------------------------------------------------------------------------

export async function listGroups(): Promise<AdminServiceGroup[]> {
  const rows = await db
    .select()
    .from(serviceGroups)
    .orderBy(serviceGroups.displayOrder, serviceGroups.createdAt);

  const categoryRows = await db
    .select({ groupId: serviceCategories.groupId })
    .from(serviceCategories);
  const counts = new Map<string, number>();
  for (const row of categoryRows) {
    counts.set(row.groupId, (counts.get(row.groupId) ?? 0) + 1);
  }

  return rows.map((row) => ({
    ...row,
    categoryCount: counts.get(row.id) ?? 0,
  }));
}

export async function getGroup(id: string): Promise<AdminServiceGroup> {
  const row = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
  });
  if (!row) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  const [countRow] = await db
    .select({ value: count() })
    .from(serviceCategories)
    .where(eq(serviceCategories.groupId, id));

  return { ...row, categoryCount: countRow?.value ?? 0 };
}

export async function createGroup(
  input: CreateServiceGroupInput,
): Promise<{ id: string }> {
  try {
    const [row] = await db
      .insert(serviceGroups)
      .values(input)
      .returning({ id: serviceGroups.id });
    if (!row) throw new ApiError(500, "GROUP_CREATE_FAILED", "Could not create service group.");
    return { id: row.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("group");
    throw error;
  }
}

export async function updateGroup(
  id: string,
  input: UpdateServiceGroupInput,
): Promise<void> {
  const existing = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  if (input.slug !== undefined) {
    await assertSlugAvailable("service_groups", input.slug, id);
  }

  try {
    if (Object.keys(input).length > 0) {
      await db.update(serviceGroups).set(input).where(eq(serviceGroups.id, id));
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("group");
    throw error;
  }
}

export async function deleteGroup(id: string): Promise<void> {
  const existing = await db.query.serviceGroups.findFirst({
    where: eq(serviceGroups.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, "GROUP_NOT_FOUND", "Service group not found.");

  await db.delete(serviceGroups).where(eq(serviceGroups.id, id));
}

// ---------------------------------------------------------------------------
// Service categories
// ---------------------------------------------------------------------------

export async function listCategories(): Promise<AdminServiceCategory[]> {
  const rows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt);

  const [serviceRowsPerCategory, groupRows] = await Promise.all([
    db.select({ categoryId: services.categoryId }).from(services),
    db.select({ id: serviceGroups.id, name: serviceGroups.name }).from(serviceGroups),
  ]);

  const serviceCounts = new Map<string, number>();
  for (const row of serviceRowsPerCategory) {
    serviceCounts.set(row.categoryId, (serviceCounts.get(row.categoryId) ?? 0) + 1);
  }
  const groupNameById = new Map(groupRows.map((row) => [row.id, row.name]));

  return rows.map((row) => ({
    ...row,
    groupName: groupNameById.get(row.groupId) ?? "",
    serviceCount: serviceCounts.get(row.id) ?? 0,
  }));
}

export async function getCategory(id: string): Promise<AdminServiceCategory> {
  const row = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
  });
  if (!row) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");

  const [countRow, group] = await Promise.all([
    db.select({ value: count() }).from(services).where(eq(services.categoryId, id)),
    db.query.serviceGroups.findFirst({
      where: eq(serviceGroups.id, row.groupId),
      columns: { name: true },
    }),
  ]);

  return {
    ...row,
    groupName: group?.name ?? "",
    serviceCount: countRow[0]?.value ?? 0,
  };
}

export async function createCategory(
  input: CreateServiceCategoryInput,
): Promise<{ id: string }> {
  await assertGroupExists(input.groupId);

  try {
    const [row] = await db
      .insert(serviceCategories)
      .values(input)
      .returning({ id: serviceCategories.id });
    if (!row) {
      throw new ApiError(500, "CATEGORY_CREATE_FAILED", "Could not create service category.");
    }
    return { id: row.id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("category");
    throw error;
  }
}

export async function updateCategory(
  id: string,
  input: UpdateServiceCategoryInput,
): Promise<void> {
  const existing = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");
  }

  if (input.groupId !== undefined) {
    await assertGroupExists(input.groupId);
  }
  if (input.slug !== undefined) {
    await assertSlugAvailable("service_categories", input.slug, id);
  }

  try {
    if (Object.keys(input).length > 0) {
      await db
        .update(serviceCategories)
        .set(input)
        .where(eq(serviceCategories.id, id));
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (isUniqueViolation(error)) throw uniqueSlugError("category");
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, id),
    columns: { id: true },
  });
  if (!existing) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Service category not found.");
  }

  await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
}

// ---------------------------------------------------------------------------
// Catalog summary (used by the dashboard pickers + overview)
// ---------------------------------------------------------------------------

export async function getCatalogSummary(): Promise<ServiceCatalogSummary> {
  const groupRows = await db
    .select()
    .from(serviceGroups)
    .orderBy(serviceGroups.displayOrder, serviceGroups.createdAt);
  const categoryRows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.createdAt);
  const serviceRows = await db.select({ categoryId: services.categoryId }).from(services);

  const groupIdSet = new Set(groupRows.map((row) => row.id));
  const categories = categoryRows.filter((row) => groupIdSet.has(row.groupId));

  const categoryCounts = new Map<string, number>();
  for (const row of categories) {
    categoryCounts.set(row.groupId, (categoryCounts.get(row.groupId) ?? 0) + 1);
  }
  const serviceCounts = new Map<string, number>();
  for (const row of serviceRows) {
    serviceCounts.set(row.categoryId, (serviceCounts.get(row.categoryId) ?? 0) + 1);
  }
  const groupNameById = new Map(groupRows.map((row) => [row.id, row.name]));

  return {
    totalServices: serviceRows.length,
    groups: groupRows.map((row) => ({
      ...row,
      categoryCount: categoryCounts.get(row.id) ?? 0,
    })),
    categories: categories.map((row) => ({
      ...row,
      groupName: groupNameById.get(row.groupId) ?? "",
      serviceCount: serviceCounts.get(row.id) ?? 0,
    })),
  };
}

export type { AdminService };