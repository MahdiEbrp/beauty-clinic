import "server-only";

import { cacheWrap } from "@/lib/cache";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceFaqs,
  serviceGroups,
  serviceImages,
  services,
} from "@/src/db/schema";
import { bumpContentVersion, getContentVersion } from "./content-version";
import {
  emptyFaqContent,
  emptyGroupContent,
  emptyServiceContent,
  loadCategoryTranslations,
  loadFaqTranslations,
  loadGroupTranslations,
  loadServiceTranslations,
} from "./i18n";
import type {
  Locale,
  PublicServiceTree,
  PublicTreeCategory,
  PublicTreeFaq,
  PublicTreeGroup,
  PublicTreeService,
  ServiceContent,
  ServiceFaqContent,
  ServiceGroupContent,
  ServiceDetailImage,
  TranslatedContent,
} from "./types";

const TREE_TTL_SECS = 7 * 24 * 60 * 60;
const CACHE_PREFIX = "catalog:tree";

function treeCacheKey(locale: Locale, version: number): string {
  return `${CACHE_PREFIX}:v${version}:${locale}`;
}

/** Picks the requested locale with a fallback to the other one. */
function pick<T>(
  translations: TranslatedContent<T> | undefined,
  locale: Locale,
  empty: T,
  isPresent: (content: T) => boolean,
): T {
  const primary = locale === "en" ? translations?.en : translations?.fa;
  const secondary = locale === "en" ? translations?.fa : translations?.en;
  if (primary && isPresent(primary)) return primary;
  if (secondary && isPresent(secondary)) return secondary;
  return primary ?? empty;
}

const groupIsPresent = (content: ServiceGroupContent) => Boolean(content.name);
const serviceIsPresent = (content: ServiceContent) => Boolean(content.title);
const faqIsPresent = (content: ServiceFaqContent) => Boolean(content.question);

/**
 * Full localized service catalog tree (groups → categories → services →
 * images → faqs) for the public pricing experience.
 *
 * Only `isActive` rows are exposed. Content resolves through the *_i18n tables
 * for the requested locale, falling back to the other locale when a title is
 * missing. All levels are ordered by `displayOrder`, then id, and empty levels
 * (categories/groups without active services) are pruned from the tree.
 *
 * Loaded with sequential batched queries (a single `inArray` lookup per *_i18n
 * table) to stay within the pool/connection budget, then cached per-locale so
 * repeat visits never touch Postgres. Mutations bust it via
 * `bustPublicServiceTreeCache()`.
 */
export async function getPublicServiceTree(locale: Locale): Promise<PublicServiceTree> {
  const version = await getContentVersion();
  return cacheWrap(treeCacheKey(locale, version), TREE_TTL_SECS, () => loadServiceTree(locale));
}

async function loadServiceTree(locale: Locale): Promise<PublicServiceTree> {
  const groupRows = await db
    .select()
    .from(serviceGroups)
    .orderBy(serviceGroups.displayOrder, serviceGroups.id);
  const groupTranslations = await loadGroupTranslations(groupRows.map((row) => row.id));

  const categoryRows = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.displayOrder, serviceCategories.id);
  const categoryTranslations = await loadCategoryTranslations(categoryRows.map((row) => row.id));

  const serviceRows = await db
    .select()
    .from(services)
    .orderBy(services.displayOrder, services.id);
  const serviceTranslations = await loadServiceTranslations(serviceRows.map((row) => row.id));

  const imageRows = await db
    .select()
    .from(serviceImages)
    .orderBy(serviceImages.displayOrder, serviceImages.id);

  const faqRows = await db
    .select()
    .from(serviceFaqs)
    .orderBy(serviceFaqs.displayOrder, serviceFaqs.id);
  const faqTranslations = await loadFaqTranslations(faqRows.map((row) => row.id));

  const imagesByService = new Map<string, ServiceDetailImage[]>();
  for (const row of imageRows) {
    const list = imagesByService.get(row.serviceId) ?? [];
    list.push({
      imageUrl: row.imageUrl,
      type: row.type,
      displayOrder: row.displayOrder,
    });
    imagesByService.set(row.serviceId, list);
  }

  const faqsByService = new Map<string, PublicTreeFaq[]>();
  for (const row of faqRows) {
    const content = pick(faqTranslations.get(row.id), locale, emptyFaqContent(), faqIsPresent);
    const list = faqsByService.get(row.serviceId) ?? [];
    list.push({
      question: content.question,
      answer: content.answer,
      displayOrder: row.displayOrder,
    });
    faqsByService.set(row.serviceId, list);
  }

  const servicesByCategory = new Map<string, PublicTreeService[]>();
  for (const row of serviceRows) {
    if (!row.isActive) continue;
    const content = pick(
      serviceTranslations.get(row.id),
      locale,
      emptyServiceContent(),
      serviceIsPresent,
    );
    const list = servicesByCategory.get(row.categoryId) ?? [];
    list.push({
      id: row.id,
      slug: row.slug,
      title: content.title,
      shortDesc: content.shortDesc,
      fullDesc: content.fullDesc,
      price: row.price === null ? null : Number(row.price),
      priceType: row.priceType,
      durationMin: row.durationMin,
      sessionsCount: row.sessionsCount,
      coverImage: row.coverImage,
      isFeatured: row.isFeatured,
      images: imagesByService.get(row.id) ?? [],
      faqs: faqsByService.get(row.id) ?? [],
    });
    servicesByCategory.set(row.categoryId, list);
  }

  const categoriesByGroup = new Map<string, PublicTreeCategory[]>();
  for (const row of categoryRows) {
    if (!row.isActive) continue;
    const categoryServices = servicesByCategory.get(row.id) ?? [];
    if (categoryServices.length === 0) continue;
    const content = pick(
      categoryTranslations.get(row.id),
      locale,
      emptyGroupContent(),
      groupIsPresent,
    );
    const list = categoriesByGroup.get(row.groupId) ?? [];
    list.push({
      slug: row.slug,
      icon: row.icon,
      image: row.image,
      title: content.name,
      description: content.description,
      services: categoryServices,
    });
    categoriesByGroup.set(row.groupId, list);
  }

  const groups: PublicTreeGroup[] = [];
  for (const row of groupRows) {
    if (!row.isActive) continue;
    const groupCategories = categoriesByGroup.get(row.id) ?? [];
    if (groupCategories.length === 0) continue;
    const content = pick(groupTranslations.get(row.id), locale, emptyGroupContent(), groupIsPresent);
    groups.push({
      slug: row.slug,
      icon: row.icon,
      image: row.image,
      title: content.name,
      description: content.description,
      categories: groupCategories,
    });
  }

  return { groups };
}

/** Invalidate all versioned public content caches (rules, catalog, tree). */
export async function bustPublicServiceTreeCache(): Promise<void> {
  await bumpContentVersion();
}
