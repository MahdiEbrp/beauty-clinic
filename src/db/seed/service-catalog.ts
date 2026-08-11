import { db } from "../index";
import {
  serviceCategories,
  serviceCategoriesI18n,
  serviceFaqs,
  serviceFaqsI18n,
  serviceGroups,
  serviceGroupsI18n,
  serviceImages,
  services,
  servicesI18n,
} from "../schema";
import {
  CATEGORY_CONTENT,
  FAQ_CONTENT,
  GROUP_CONTENT,
  SERVICE_CONTENT,
} from "./content";

const GROUP_DEFS = [
  { slug: "facial", icon: "facial", displayOrder: 1 },
  { slug: "laser", icon: "laser", displayOrder: 2 },
  { slug: "antiaging", icon: "antiaging", displayOrder: 3 },
  { slug: "body", icon: "body", displayOrder: 4 },
  { slug: "peel", icon: "peel", displayOrder: 5 },
  { slug: "wellness", icon: "wellness", displayOrder: 6 },
] as const;

const CATEGORY_DEFS = [
  { slug: "gel-botox", icon: "gelBotox", groupSlug: "antiaging", displayOrder: 1 },
  { slug: "facial", icon: "facial", groupSlug: "facial", displayOrder: 2 },
  { slug: "rejuvenation", icon: "rejuvenation", groupSlug: "antiaging", displayOrder: 3 },
  { slug: "body-filler", icon: "bodyFiller", groupSlug: "body", displayOrder: 4 },
  { slug: "hifu", icon: "hifu", groupSlug: "laser", displayOrder: 5 },
  { slug: "microneedling", icon: "microneedling", groupSlug: "facial", displayOrder: 6 },
] as const;

const SERVICE_DEFS = [
  { slug: "gel-botox-injection", categorySlug: "gel-botox", price: 23600, priceType: "from", durationMin: 30, sessionsCount: 1, isFeatured: true },
  { slug: "specialized-facial", categorySlug: "facial", price: null, priceType: "on_request", durationMin: 60, sessionsCount: 1 },
  { slug: "rejuvenation-lift", categorySlug: "rejuvenation", price: 16290, priceType: "from", durationMin: 45, sessionsCount: 2 },
  { slug: "body-filler", categorySlug: "body-filler", price: 390, priceType: "from", durationMin: 30, sessionsCount: 2 },
  { slug: "hifu-therapy", categorySlug: "hifu", price: null, priceType: "on_request", durationMin: 60, sessionsCount: 3 },
  { slug: "microneedling", categorySlug: "microneedling", price: 1990, priceType: "fixed", durationMin: 45, sessionsCount: 3 },
] as const;

const IMAGE_DEFS: {
  slug: string;
  images: { imageUrl: string; type: "before" | "after" | "gallery"; displayOrder: number }[];
}[] = [
  {
    slug: "gel-botox-injection",
    images: [
      { imageUrl: "/images/gallery/hydrafacial.webp", type: "gallery", displayOrder: 1 },
      { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 2 },
    ],
  },
  {
    slug: "specialized-facial",
    images: [
      { imageUrl: "/images/gallery/hydrafacial.webp", type: "before", displayOrder: 1 },
      { imageUrl: "/images/gallery/skin-care.webp", type: "after", displayOrder: 2 },
    ],
  },
  {
    slug: "rejuvenation-lift",
    images: [
      { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 1 },
    ],
  },
  {
    slug: "body-filler",
    images: [
      { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 1 },
    ],
  },
  {
    slug: "hifu-therapy",
    images: [
      { imageUrl: "/images/gallery/laser-rejuv.webp", type: "gallery", displayOrder: 1 },
      { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 2 },
    ],
  },
  {
    slug: "microneedling",
    images: [
      { imageUrl: "/images/gallery/microneedling.webp", type: "gallery", displayOrder: 1 },
    ],
  },
];

/**
 * Rebuilds the service catalog.
 *
 * Localized content is stored directly in the *_i18n tables (sourced from
 * ./content, previously message-file translation keys). The catalog is
 * rebuilt on each run: old rows are cleared first (deleting a group cascades
 * to categories, services, faqs, images and translations), then the tree is
 * inserted fresh with fa/en translations.
 */
export async function seedServiceCatalog(): Promise<void> {
  await db.delete(serviceGroups);

  for (const def of GROUP_DEFS) {
    const [row] = await db
      .insert(serviceGroups)
      .values({ slug: def.slug, icon: def.icon, displayOrder: def.displayOrder })
      .returning({ id: serviceGroups.id });
    const tr = GROUP_CONTENT[def.slug];
    await db.insert(serviceGroupsI18n).values([
      {
        groupId: row.id,
        locale: "fa",
        name: tr.fa.name,
        description: tr.fa.description,
        seoTitle: tr.fa.seoTitle,
        seoDescription: tr.fa.seoDescription,
      },
      {
        groupId: row.id,
        locale: "en",
        name: tr.en.name,
        description: tr.en.description,
        seoTitle: tr.en.seoTitle,
        seoDescription: tr.en.seoDescription,
      },
    ]);
  }
  const groupRows = await db.select().from(serviceGroups);
  const groupIdBySlug = new Map(groupRows.map((g) => [g.slug, g.id]));

  for (const def of CATEGORY_DEFS) {
    const groupId = groupIdBySlug.get(def.groupSlug);
    if (!groupId) {
      console.warn(`Skipping category ${def.slug}: group ${def.groupSlug} not found.`);
      continue;
    }
    const [row] = await db
      .insert(serviceCategories)
      .values({ groupId, slug: def.slug, icon: def.icon, displayOrder: def.displayOrder })
      .returning({ id: serviceCategories.id });
    const tr = CATEGORY_CONTENT[def.slug];
    await db.insert(serviceCategoriesI18n).values([
      {
        categoryId: row.id,
        locale: "fa",
        name: tr.fa.name,
        description: tr.fa.description,
        seoTitle: tr.fa.seoTitle,
        seoDescription: tr.fa.seoDescription,
      },
      {
        categoryId: row.id,
        locale: "en",
        name: tr.en.name,
        description: tr.en.description,
        seoTitle: tr.en.seoTitle,
        seoDescription: tr.en.seoDescription,
      },
    ]);
  }
  const categoryRows = await db.select().from(serviceCategories);
  const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  for (const def of SERVICE_DEFS) {
    const categoryId = categoryIdBySlug.get(def.categorySlug);
    if (!categoryId) {
      console.warn(`Skipping service ${def.slug}: category ${def.categorySlug} not found.`);
      continue;
    }
    const [row] = await db
      .insert(services)
      .values({
        categoryId,
        slug: def.slug,
        price: def.price === null ? null : String(def.price),
        priceType: def.priceType,
        durationMin: def.durationMin,
        sessionsCount: def.sessionsCount,
        isFeatured: (def as { isFeatured?: boolean }).isFeatured ?? false,
      })
      .returning({ id: services.id });
    const tr = SERVICE_CONTENT[def.slug];
    await db.insert(servicesI18n).values([
      {
        serviceId: row.id,
        locale: "fa",
        title: tr.fa.title,
        shortDesc: tr.fa.shortDesc,
        fullDesc: tr.fa.fullDesc,
      },
      {
        serviceId: row.id,
        locale: "en",
        title: tr.en.title,
        shortDesc: tr.en.shortDesc,
        fullDesc: tr.en.fullDesc,
      },
    ]);
  }
  const serviceRows = await db.select().from(services);
  const serviceIdBySlug = new Map(serviceRows.map((s) => [s.slug, s.id]));

  for (const def of IMAGE_DEFS) {
    const serviceId = serviceIdBySlug.get(def.slug);
    if (!serviceId) continue;
    for (const image of def.images) {
      await db.insert(serviceImages).values({ serviceId, ...image });
    }
  }

  for (const [slug, tr] of Object.entries(FAQ_CONTENT)) {
    const serviceId = serviceIdBySlug.get(slug);
    if (!serviceId) continue;
    const faItems = tr.fa;
    const enItems = tr.en;
    /* eslint-disable security/detect-object-injection -- FAQ_CONTENT is a closed, seed-owned constant */
    for (let i = 0; i < faItems.length; i += 1) {
      const [faq] = await db
        .insert(serviceFaqs)
        .values({ serviceId, displayOrder: i + 1 })
        .returning({ id: serviceFaqs.id });
      await db.insert(serviceFaqsI18n).values([
        {
          faqId: faq.id,
          locale: "fa",
          question: faItems[i].question,
          answer: faItems[i].answer,
        },
        {
          faqId: faq.id,
          locale: "en",
          question: enItems[i].question,
          answer: enItems[i].answer,
        },
      ]);
    }
    /* eslint-enable security/detect-object-injection */
  }

  console.log("Service catalog seeded.");
}