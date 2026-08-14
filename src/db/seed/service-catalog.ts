import { db } from "../index";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceGroups,
  serviceGroupsI18n,
  services,
  servicesI18n,
} from "../schema";
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
 */
export async function seedServiceCatalog(): Promise<void> {
  for (const group of CATALOG_SEED) {
    await upsertGroup(group);
  }
  console.log("Service catalog seeded.");
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
    await upsertCategory(row.id, category);
  }
}

async function upsertCategory(
  groupId: string,
  category: SeedCategory,
): Promise<void> {
  const [row] = await db
    .insert(serviceCategories)
    .values({
      groupId,
      slug: category.slug,
      icon: category.icon ?? null,
      displayOrder: category.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceCategories.slug,
      set: {
        groupId,
        icon: category.icon ?? null,
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