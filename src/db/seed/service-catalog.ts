import { db } from "../index";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceGroups,
  serviceGroupsI18n,
  services,
  servicesI18n,
} from "../schema";
import { inArray } from "drizzle-orm";
import {
  CATALOG_SEED,
  type SeedCategory,
  type SeedGroup,
  type SeedService,
} from "./catalog";

/**
 * Rebuilds the service catalog from CATALOG_SEED.
 *
 * Idempotent upsert — groups/categories/services are matched by their
 * global-unique slug (onConflictDoUpdate) and i18n rows by their composite
 * (id, locale) primary key. Existing rows are never deleted, so admin-created
 * entries and content survive re-runs; running the seed simply guarantees the
 * seed-defined tree exists and is up to date.
 *
 * Groups that are not part of CATALOG_SEED are deactivated (never deleted) so
 * the live catalog exposes exactly the canonical top-level groups.
 */
export async function seedServiceCatalog(): Promise<void> {
  for (const group of CATALOG_SEED) {
    await upsertGroup(group);
  }
  const { deactivated } = await syncCatalogGroups();
  if (deactivated.length > 0) {
    console.log(`Deactivated legacy groups: ${deactivated.join(", ")}`);
  }
  const { deactivatedCategories, deactivatedServices } = await syncCatalogTree();
  if (deactivatedCategories.length > 0) {
    console.log(`Deactivated legacy categories: ${deactivatedCategories.join(", ")}`);
  }
  if (deactivatedServices.length > 0) {
    console.log(`Deactivated legacy services: ${deactivatedServices.join(", ")}`);
  }
  console.log("Service catalog seeded.");
}

/**
 * Deactivates active service groups whose slug is not part of CATALOG_SEED.
 * Non-destructive: rows and their categories/services are kept, only hidden.
 */
export async function syncCatalogGroups(): Promise<{ deactivated: string[] }> {
  const keep = new Set(CATALOG_SEED.map((group) => group.slug));
  const rows = await db
    .select({ id: serviceGroups.id, slug: serviceGroups.slug, isActive: serviceGroups.isActive })
    .from(serviceGroups);
  const extra = rows.filter((row) => !keep.has(row.slug));
  const toDeactivate = extra.filter((row) => row.isActive).map((row) => row.id);
  if (toDeactivate.length > 0) {
    await db
      .update(serviceGroups)
      .set({ isActive: false, updatedAt: new Date() })
      .where(inArray(serviceGroups.id, toDeactivate));
  }
  return { deactivated: extra.map((row) => row.slug) };
}

/**
 * Deactivates categories/services whose slug is no longer part of the seed
 * tree. Like `syncCatalogGroups`, non-destructive — rows are kept, only
 * hidden — and bookings that reference them stay intact.
 */
export async function syncCatalogTree(): Promise<{
  deactivatedCategories: string[];
  deactivatedServices: string[];
}> {
  const keepCategorySlugs = new Set<string>();
  const keepServiceSlugs = new Set<string>();
  for (const group of CATALOG_SEED) {
    for (const category of group.categories) {
      keepCategorySlugs.add(category.slug);
      for (const service of category.services) {
        keepServiceSlugs.add(service.slug);
      }
    }
  }

  const categoryRows = await db
    .select({ id: serviceCategories.id, slug: serviceCategories.slug, isActive: serviceCategories.isActive })
    .from(serviceCategories);
  const extraCategories = categoryRows.filter((row) => !keepCategorySlugs.has(row.slug));
  const categoriesToDeactivate = extraCategories.filter((row) => row.isActive).map((row) => row.id);
  if (categoriesToDeactivate.length > 0) {
    await db
      .update(serviceCategories)
      .set({ isActive: false })
      .where(inArray(serviceCategories.id, categoriesToDeactivate));
  }

  const serviceRows = await db
    .select({ id: services.id, slug: services.slug, isActive: services.isActive })
    .from(services);
  const extraServices = serviceRows.filter((row) => !keepServiceSlugs.has(row.slug));
  const servicesToDeactivate = extraServices.filter((row) => row.isActive).map((row) => row.id);
  if (servicesToDeactivate.length > 0) {
    await db
      .update(services)
      .set({ isActive: false })
      .where(inArray(services.id, servicesToDeactivate));
  }

  return {
    deactivatedCategories: extraCategories.map((row) => row.slug),
    deactivatedServices: extraServices.map((row) => row.slug),
  };
}


async function upsertGroup(group: SeedGroup): Promise<void> {
  const [row] = await db
    .insert(serviceGroups)
    .values({
      slug: group.slug,
      icon: group.icon ?? null,
      image: group.image ?? null,
      displayOrder: group.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceGroups.slug,
      set: {
        icon: group.icon ?? null,
        image: group.image ?? null,
        displayOrder: group.displayOrder,
        isActive: true,
      },
    })
    .returning({ id: serviceGroups.id });

  for (const locale of group.i18n) {
    await db
      .insert(serviceGroupsI18n)
      .values({
        groupId: row.id,
        locale: locale.locale,
        name: locale.name,
        description: locale.description ?? null,
        seoTitle: locale.seoTitle ?? null,
        seoDescription: locale.seoDescription ?? null,
      })
      .onConflictDoUpdate({
        target: [serviceGroupsI18n.groupId, serviceGroupsI18n.locale],
        set: {
          name: locale.name,
          description: locale.description ?? null,
          seoTitle: locale.seoTitle ?? null,
          seoDescription: locale.seoDescription ?? null,
        },
      });
  }

  for (const category of group.categories) {
    await upsertCategory(row.id, category, group.image ?? null);
  }
}

async function upsertCategory(
  groupId: string,
  category: SeedCategory,
  groupImage: string | null,
): Promise<void> {
  const image = category.image ?? groupImage;
  const [row] = await db
    .insert(serviceCategories)
    .values({
      groupId,
      slug: category.slug,
      icon: category.icon ?? null,
      image,
      displayOrder: category.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceCategories.slug,
      set: {
        groupId,
        icon: category.icon ?? null,
        image,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    })
    .returning({ id: serviceCategories.id });

  for (const locale of category.i18n) {
    await db
      .insert(serviceCategoriesI18n)
      .values({
        categoryId: row.id,
        locale: locale.locale,
        name: locale.name,
        description: locale.description ?? null,
        seoTitle: locale.seoTitle ?? null,
        seoDescription: locale.seoDescription ?? null,
      })
      .onConflictDoUpdate({
        target: [serviceCategoriesI18n.categoryId, serviceCategoriesI18n.locale],
        set: {
          name: locale.name,
          description: locale.description ?? null,
          seoTitle: locale.seoTitle ?? null,
          seoDescription: locale.seoDescription ?? null,
        },
      });
  }

  for (const service of category.services) {
    await upsertService(row.id, service);
  }
}

async function upsertService(
  categoryId: string,
  service: SeedService,
): Promise<void> {
  const [row] = await db
    .insert(services)
    .values({
      categoryId,
      slug: service.slug,
      price: service.price === null ? null : String(service.price),
      priceType: service.priceType,
      displayOrder: service.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: services.slug,
      set: {
        categoryId,
        price: service.price === null ? null : String(service.price),
        priceType: service.priceType,
        displayOrder: service.displayOrder,
        isActive: true,
      },
    })
    .returning({ id: services.id });

  for (const locale of service.i18n) {
    await db
      .insert(servicesI18n)
      .values({
        serviceId: row.id,
        locale: locale.locale,
        title: locale.title,
        shortDesc: locale.shortDesc ?? null,
        seoTitle: locale.seoTitle ?? null,
        seoDescription: locale.seoDescription ?? null,
      })
      .onConflictDoUpdate({
        target: [servicesI18n.serviceId, servicesI18n.locale],
        set: {
          title: locale.title,
          shortDesc: locale.shortDesc ?? null,
          seoTitle: locale.seoTitle ?? null,
          seoDescription: locale.seoDescription ?? null,
        },
      });
  }
}