import { and, count, desc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { db } from "@/src/db";
import {
  serviceCategories,
  serviceFaqs,
  serviceImages,
  services,
  servicesI18n,
} from "@/src/db/schema";
import { mapServiceRow } from "./helpers";
import {
  emptyFaqContent,
  emptyServiceContent,
  loadCategoryTranslations,
  loadFaqTranslations,
  loadGroupTranslations,
  loadServiceTranslations,
} from "./i18n";
import type { AdminService, AdminServiceFaq, AdminServiceImage, ListServicesResult } from "./types";

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
    // Titles live in the i18n table; resolve matching ids first so search can
    // still match by the fa/en title as well as the technical slug.
    const titleMatches = await db
      .select({ id: servicesI18n.serviceId })
      .from(servicesI18n)
      .where(ilike(servicesI18n.title, term));
    const titleIds = [...new Set(titleMatches.map((row) => row.id))];
    conditions.push(
      or(ilike(services.slug, term), inArray(services.id, titleIds)),
    );
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
    .select()
    .from(services)
    .where(where)
    .orderBy(desc(services.createdAt))
    .limit(perPage)
    .offset(offset);

  const serviceTr = await loadServiceTranslations(rows.map((row) => row.id));

  const categoryIds = [...new Set(rows.map((row) => row.categoryId))];
  const categoryTr = await loadCategoryTranslations(categoryIds);
  const categoryRows = categoryIds.length
    ? await db
        .select({ id: serviceCategories.id, groupId: serviceCategories.groupId })
        .from(serviceCategories)
        .where(inArray(serviceCategories.id, categoryIds))
    : [];
  const groupIds = [...new Set(categoryRows.map((row) => row.groupId))];
  const groupTr = await loadGroupTranslations(groupIds);
  const groupOfCategory = new Map(categoryRows.map((row) => [row.id, row.groupId]));

  const items: AdminService[] = rows.map((row) => {
    const tr = serviceTr.get(row.id) ?? { fa: emptyServiceContent(), en: emptyServiceContent() };
    const groupId = groupOfCategory.get(row.categoryId) ?? "";
    const categoryNames = categoryTr.get(row.categoryId);
    const groupNames = groupId ? groupTr.get(groupId) : undefined;
    return mapServiceRow(
      row,
      tr,
      categoryNames?.fa.name ?? "",
      groupId,
      groupNames?.fa.name ?? "",
    );
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

  const tr = (await loadServiceTranslations([id])).get(id) ?? {
    fa: emptyServiceContent(),
    en: emptyServiceContent(),
  };

  const category = await db.query.serviceCategories.findFirst({
    where: eq(serviceCategories.id, row.categoryId),
    columns: { id: true, groupId: true },
  });
  const categoryNames = category
    ? (await loadCategoryTranslations([category.id])).get(category.id)
    : undefined;
  const groupNames = category?.groupId
    ? (await loadGroupTranslations([category.groupId])).get(category.groupId)
    : undefined;

  const imageRows = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.serviceId, id))
    .orderBy(serviceImages.displayOrder, serviceImages.id);
  const images: AdminServiceImage[] = imageRows.map((image) => ({
    id: image.id,
    serviceId: image.serviceId,
    imageUrl: image.imageUrl,
    type: image.type,
    displayOrder: image.displayOrder,
    createdAt: image.createdAt,
  }));

  const faqRows = await db
    .select()
    .from(serviceFaqs)
    .where(eq(serviceFaqs.serviceId, id))
    .orderBy(serviceFaqs.displayOrder, serviceFaqs.id);
  const faqTr = await loadFaqTranslations(faqRows.map((faq) => faq.id));
  const faqs: AdminServiceFaq[] = faqRows.map((faq) => {
    const content = faqTr.get(faq.id) ?? { fa: emptyFaqContent(), en: emptyFaqContent() };
    return {
      id: faq.id,
      serviceId: faq.serviceId,
      displayOrder: faq.displayOrder,
      createdAt: faq.createdAt,
      question: content.fa.question,
      answer: content.fa.answer,
      translations: content,
    };
  });

  return mapServiceRow(
    row,
    tr,
    categoryNames?.fa.name ?? "",
    category?.groupId ?? "",
    groupNames?.fa.name ?? "",
    images,
    faqs,
  );
}