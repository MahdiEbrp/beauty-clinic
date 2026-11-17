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

import { GROUPS, type PriceGroup, type PriceCategory, type PriceService } from "@/data/price-list-seed";

async function upsertGroup(g: PriceGroup) {
  const [row] = await db
    .insert(serviceGroups)
    .values({
      slug: g.slug,
      icon: null,
      image: null,
      displayOrder: g.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceGroups.slug,
      set: { icon: null, image: null, displayOrder: g.displayOrder, isActive: true },
    })
    .returning({ id: serviceGroups.id });

  for (const locale of ["fa", "en"] as const) {
    const name = locale === "fa" ? g.faName : g.enName;
    await db
      .insert(serviceGroupsI18n)
      .values({
        groupId: row.id,
        locale,
        name,
        description: null,
        seoTitle: `${name} | قیمت`,
        seoDescription: null,
      })
      .onConflictDoUpdate({
        target: [serviceGroupsI18n.groupId, serviceGroupsI18n.locale],
        set: { name, description: null, seoTitle: `${name} | قیمت`, seoDescription: null },
      });
  }

  for (const category of g.categories) {
    await upsertCategory(row.id, category);
  }
}

async function upsertCategory(groupId: string, c: PriceCategory) {
  const [row] = await db
    .insert(serviceCategories)
    .values({
      groupId,
      slug: c.slug,
      icon: null,
      image: null,
      displayOrder: c.displayOrder,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: serviceCategories.slug,
      set: { groupId, icon: null, image: null, displayOrder: c.displayOrder, isActive: true },
    })
    .returning({ id: serviceCategories.id });

  for (const locale of ["fa", "en"] as const) {
    const name = locale === "fa" ? c.faName : c.enName;
    await db
      .insert(serviceCategoriesI18n)
      .values({
        categoryId: row.id,
        locale,
        name,
        description: null,
        seoTitle: `${name} | قیمت`,
        seoDescription: null,
      })
      .onConflictDoUpdate({
        target: [serviceCategoriesI18n.categoryId, serviceCategoriesI18n.locale],
        set: { name, description: null, seoTitle: `${name} | قیمت`, seoDescription: null },
      });
  }

  for (const service of c.services) {
    await upsertService(row.id, service);
  }
}

async function upsertService(categoryId: string, s: PriceService) {
  const [row] = await db
    .insert(services)
    .values({
      categoryId,
      slug: s.slug,
      price: s.price === null ? null : String(s.price),
      priceType: s.priceType,
      durationMin: null,
      sessionsCount: 1,
      displayOrder: s.displayOrder,
      isActive: true,
      isFeatured: false,
    })
    .onConflictDoUpdate({
      target: services.slug,
      set: {
        categoryId,
        price: s.price === null ? null : String(s.price),
        priceType: s.priceType,
        displayOrder: s.displayOrder,
        isActive: true,
        isFeatured: false,
      },
    })
    .returning({ id: services.id });

  for (const locale of ["fa", "en"] as const) {
    const title = locale === "fa" ? s.faTitle : s.enTitle;
    await db
      .insert(servicesI18n)
      .values({
        serviceId: row.id,
        locale,
        title,
        shortDesc: null,
        seoTitle: `${title} | قیمت`,
        seoDescription: null,
      })
      .onConflictDoUpdate({
        target: [servicesI18n.serviceId, servicesI18n.locale],
        set: { title, shortDesc: null, seoTitle: `${title} | قیمت`, seoDescription: null },
      });
  }
}

async function main() {
  const keepGroupSlugs = new Set(GROUPS.map((g) => g.slug));
  const keepCategorySlugs = new Set<string>();
  const keepServiceSlugs = new Set<string>();
  for (const g of GROUPS) {
    for (const c of g.categories) {
      keepCategorySlugs.add(c.slug);
      for (const s of c.services) keepServiceSlugs.add(s.slug);
    }
  }

  for (const g of GROUPS) await upsertGroup(g);

  const allGroups = await db.select({ id: serviceGroups.id, slug: serviceGroups.slug, isActive: serviceGroups.isActive }).from(serviceGroups);
  const toDeactivateGroups = allGroups.filter((r) => !keepGroupSlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateGroups.length) {
    await db.update(serviceGroups).set({ isActive: false }).where(inArray(serviceGroups.id, toDeactivateGroups));
  }

  const allCategories = await db.select({ id: serviceCategories.id, slug: serviceCategories.slug, isActive: serviceCategories.isActive }).from(serviceCategories);
  const toDeactivateCategories = allCategories.filter((r) => !keepCategorySlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateCategories.length) {
    await db.update(serviceCategories).set({ isActive: false }).where(inArray(serviceCategories.id, toDeactivateCategories));
  }

  const allServices = await db.select({ id: services.id, slug: services.slug, isActive: services.isActive }).from(services);
  const toDeactivateServices = allServices.filter((r) => !keepServiceSlugs.has(r.slug) && r.isActive).map((r) => r.id);
  if (toDeactivateServices.length) {
    await db.update(services).set({ isActive: false }).where(inArray(services.id, toDeactivateServices));
  }

  const totalServices = GROUPS.reduce((a, g) => a + g.categories.reduce((b, c) => b + c.services.length, 0), 0);
  console.log(`✅ Seeded ${GROUPS.length} groups, ${GROUPS.reduce((a, g) => a + g.categories.length, 0)} categories, ${totalServices} services.`);
}

main().catch((err) => {
  console.error("SEED ERROR:", (err as Error).message);
  process.exit(1);
});
