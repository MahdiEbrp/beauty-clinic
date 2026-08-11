import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/src/db";
import {
  serviceCategoriesI18n,
  serviceFaqsI18n,
  serviceGroupsI18n,
  servicesI18n,
} from "@/src/db/schema";
import type {
  Locale,
  ServiceCategoryContent,
  ServiceContent,
  ServiceFaqContent,
  ServiceGroupContent,
  TranslatedContent,
} from "./types";

/** The transaction client type produced by `db.transaction(...)`. */
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function emptyGroupContent(): ServiceGroupContent {
  return { name: "", description: null, seoTitle: null, seoDescription: null };
}

export function emptyServiceContent(): ServiceContent {
  return { title: "", shortDesc: null, fullDesc: null };
}

export function emptyFaqContent(): ServiceFaqContent {
  return { question: "", answer: "" };
}

/** Load fa/en translations for a set of group ids (missing locales fall back to empty). */
export async function loadGroupTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<ServiceGroupContent>>> {
  const map = new Map<string, TranslatedContent<ServiceGroupContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) map.set(id, { fa: emptyGroupContent(), en: emptyGroupContent() });
  const rows = await db
    .select()
    .from(serviceGroupsI18n)
    .where(inArray(serviceGroupsI18n.groupId, ids));
  for (const row of rows) {
    const entry = map.get(row.groupId);
    if (!entry) continue;
    entry[row.locale] = {
      name: row.name,
      description: row.description,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  }
  return map;
}

/** Load fa/en translations for a set of category ids. */
export async function loadCategoryTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<ServiceCategoryContent>>> {
  const map = new Map<string, TranslatedContent<ServiceCategoryContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) map.set(id, { fa: emptyGroupContent(), en: emptyGroupContent() });
  const rows = await db
    .select()
    .from(serviceCategoriesI18n)
    .where(inArray(serviceCategoriesI18n.categoryId, ids));
  for (const row of rows) {
    const entry = map.get(row.categoryId);
    if (!entry) continue;
    entry[row.locale] = {
      name: row.name,
      description: row.description,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
    };
  }
  return map;
}

/** Load fa/en translations for a set of service ids. */
export async function loadServiceTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<ServiceContent>>> {
  const map = new Map<string, TranslatedContent<ServiceContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) map.set(id, { fa: emptyServiceContent(), en: emptyServiceContent() });
  const rows = await db
    .select()
    .from(servicesI18n)
    .where(inArray(servicesI18n.serviceId, ids));
  for (const row of rows) {
    const entry = map.get(row.serviceId);
    if (!entry) continue;
    entry[row.locale] = {
      title: row.title,
      shortDesc: row.shortDesc,
      fullDesc: row.fullDesc,
    };
  }
  return map;
}

/** Load fa/en translations for a set of faq ids. */
export async function loadFaqTranslations(
  ids: string[],
): Promise<Map<string, TranslatedContent<ServiceFaqContent>>> {
  const map = new Map<string, TranslatedContent<ServiceFaqContent>>();
  if (ids.length === 0) return map;
  for (const id of ids) map.set(id, { fa: emptyFaqContent(), en: emptyFaqContent() });
  const rows = await db
    .select()
    .from(serviceFaqsI18n)
    .where(inArray(serviceFaqsI18n.faqId, ids));
  for (const row of rows) {
    const entry = map.get(row.faqId);
    if (!entry) continue;
    entry[row.locale] = { question: row.question, answer: row.answer };
  }
  return map;
}

export async function upsertServiceTranslation(
  tx: Tx,
  serviceId: string,
  locale: Locale,
  content: Partial<ServiceContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(servicesI18n)
    .where(and(eq(servicesI18n.serviceId, serviceId), eq(servicesI18n.locale, locale)))
    .limit(1);
  const current = existing[0];
  const values = {
    title: content.title ?? current?.title ?? "",
    shortDesc: content.shortDesc !== undefined ? content.shortDesc ?? null : (current?.shortDesc ?? null),
    fullDesc: content.fullDesc !== undefined ? content.fullDesc ?? null : (current?.fullDesc ?? null),
  };
  await tx
    .insert(servicesI18n)
    .values({ serviceId, locale, ...values })
    .onConflictDoUpdate({
      target: [servicesI18n.serviceId, servicesI18n.locale],
      set: values,
    });
}

export async function upsertGroupTranslation(
  tx: Tx,
  groupId: string,
  locale: Locale,
  content: Partial<ServiceGroupContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(serviceGroupsI18n)
    .where(and(eq(serviceGroupsI18n.groupId, groupId), eq(serviceGroupsI18n.locale, locale)))
    .limit(1);
  const current = existing[0];
  const values = {
    name: content.name ?? current?.name ?? "",
    description: content.description !== undefined ? content.description ?? null : (current?.description ?? null),
    seoTitle: content.seoTitle !== undefined ? content.seoTitle ?? null : (current?.seoTitle ?? null),
    seoDescription: content.seoDescription !== undefined ? content.seoDescription ?? null : (current?.seoDescription ?? null),
  };
  await tx
    .insert(serviceGroupsI18n)
    .values({ groupId, locale, ...values })
    .onConflictDoUpdate({
      target: [serviceGroupsI18n.groupId, serviceGroupsI18n.locale],
      set: values,
    });
}

export async function upsertCategoryTranslation(
  tx: Tx,
  categoryId: string,
  locale: Locale,
  content: Partial<ServiceCategoryContent>,
): Promise<void> {
  const existing = await tx
    .select()
    .from(serviceCategoriesI18n)
    .where(and(eq(serviceCategoriesI18n.categoryId, categoryId), eq(serviceCategoriesI18n.locale, locale)))
    .limit(1);
  const current = existing[0];
  const values = {
    name: content.name ?? current?.name ?? "",
    description: content.description !== undefined ? content.description ?? null : (current?.description ?? null),
    seoTitle: content.seoTitle !== undefined ? content.seoTitle ?? null : (current?.seoTitle ?? null),
    seoDescription: content.seoDescription !== undefined ? content.seoDescription ?? null : (current?.seoDescription ?? null),
  };
  await tx
    .insert(serviceCategoriesI18n)
    .values({ categoryId, locale, ...values })
    .onConflictDoUpdate({
      target: [serviceCategoriesI18n.categoryId, serviceCategoriesI18n.locale],
      set: values,
    });
}