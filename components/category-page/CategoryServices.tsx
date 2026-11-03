"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import PricingRow from "@/components/pricing/article/PricingRow";
import type { CategoryPageCategory } from "@/lib/services/category-page";

type CategoryServicesProps = {
  category: CategoryPageCategory;
  groupSlug: string;
  currency: string;
};

/**
 * The services block for a category page — a card mirroring the pricing page's
 * section look, reusing `PricingRow` (name, desc, duration/sessions badges,
 * book button) for every service in the category. Prices are intentionally
 * hidden on category pages.
 */
export default function CategoryServices({
  category,
  groupSlug,
  currency,
}: CategoryServicesProps) {
  const t = useTranslations();
  const router = useRouter();

  const handleBook = (service: { slug: string }) =>
    router.push(`/booking?service=${service.slug}`);

  return (
    <section
      id={`category-${category.slug}`}
      aria-labelledby="category-services-heading"
      className="scroll-mt-24 overflow-hidden rounded-panel border border-border-primary bg-surface-secondary/90 shadow-elevation-1"
    >
      <div className="border-b border-border-primary/60 px-5 py-4 sm:px-7">
        <h2
          id="category-services-heading"
          className="text-lg font-bold tracking-tight text-accent"
        >
          {t("categoryPage.services.heading", { title: category.title })}
        </h2>
        <p className="mt-1 text-caption text-content-tertiary">
          {t("categoryPage.services.subtitle", {
            count: category.services.length,
          })}
        </p>
      </div>

      <ul className="divide-y divide-border-primary/50 px-3 sm:px-5">
        {category.services.map((service) => (
          <PricingRow
            key={service.id}
            service={{
              id: service.id,
              slug: service.slug,
              title: service.title,
              shortDesc: service.shortDesc,
              price: service.price,
              priceType: service.priceType,
              durationMin: service.durationMin,
              sessionsCount: service.sessionsCount,
              isFeatured: service.isFeatured,
              coverImage: service.coverImage,
              images: service.images,
              displayOrder: service.displayOrder,
              unit: service.unit,
            }}
            currency={currency}
            onBook={() => handleBook(service)}
            groupSlug={groupSlug}
            bookVariant="xl"
            showPrice={false}
          />
        ))}
      </ul>

      {category.services.length === 0 && (
        <div className="px-5 py-12 text-center">
          <p className="text-caption text-content-tertiary">
            {t("common.empty")}
          </p>
        </div>
      )}
    </section>
  );
}