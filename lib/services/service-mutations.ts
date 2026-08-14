import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from "@/lib/validation/services";
import { db } from "@/src/db";
import {
  serviceFaqs,
  serviceFaqsI18n,
  serviceImages,
  services,
  servicesI18n,
} from "@/src/db/schema";
import { assertCategoryExists, assertSlugAvailable, isUniqueViolation, priceToColumn, uniqueSlugError } from "./helpers";
import { upsertServiceTranslation } from "./i18n";
import type { Locale, ServiceContent } from "./types";

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
          slug: input.slug,
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

      const translations = input.translations;
      await tx.insert(servicesI18n).values([
        {
          serviceId: service.id,
          locale: "fa",
          title: translations.fa.title,
          shortDesc: translations.fa.shortDesc ?? null,
          fullDesc: translations.fa.fullDesc ?? null,
          seoTitle: translations.fa.seoTitle ?? null,
          seoDescription: translations.fa.seoDescription ?? null,
        },
        {
          serviceId: service.id,
          locale: "en",
          title: translations.en.title,
          shortDesc: translations.en.shortDesc ?? null,
          fullDesc: translations.en.fullDesc ?? null,
          seoTitle: translations.en.seoTitle ?? null,
          seoDescription: translations.en.seoDescription ?? null,
        },
      ]);

      if (input.images && input.images.length > 0) {
        await tx
          .insert(serviceImages)
          .values(input.images.map((image) => ({ serviceId: service.id, ...image })));
      }
      if (input.faqs && input.faqs.length > 0) {
        for (const faq of input.faqs) {
          const [created] = await tx
            .insert(serviceFaqs)
            .values({ serviceId: service.id, displayOrder: faq.displayOrder })
            .returning({ id: serviceFaqs.id });
          if (created) {
            await tx.insert(serviceFaqsI18n).values([
              {
                faqId: created.id,
                locale: "fa",
                question: faq.translations.fa.question,
                answer: faq.translations.fa.answer,
              },
              {
                faqId: created.id,
                locale: "en",
                question: faq.translations.en.question,
                answer: faq.translations.en.answer,
              },
            ]);
          }
        }
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
      const { images, faqs, translations, price, ...rest } = input;
      const set: Record<string, unknown> = { ...rest };
      if (price !== undefined) set.price = priceToColumn(price);
      if (Object.keys(set).length > 0) {
        await tx.update(services).set(set).where(eq(services.id, id));
      }

      if (translations) {
        const entries = Object.entries(translations) as [Locale, Partial<ServiceContent>][];
        for (const [locale, content] of entries) {
          if (!content) continue;
          await upsertServiceTranslation(tx, id, locale, content);
        }
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
          for (const faq of faqs) {
            const [created] = await tx
              .insert(serviceFaqs)
              .values({ serviceId: id, displayOrder: faq.displayOrder })
              .returning({ id: serviceFaqs.id });
            if (created) {
              await tx.insert(serviceFaqsI18n).values([
                {
                  faqId: created.id,
                  locale: "fa",
                  question: faq.translations.fa.question,
                  answer: faq.translations.fa.answer,
                },
                {
                  faqId: created.id,
                  locale: "en",
                  question: faq.translations.en.question,
                  answer: faq.translations.en.answer,
                },
              ]);
            }
          }
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