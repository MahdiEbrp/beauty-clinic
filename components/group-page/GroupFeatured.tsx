"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import PricingRow from "@/components/pricing/article/PricingRow";
import type { CategoryPageService } from "@/lib/services/category-page";

type GroupFeaturedProps = {
  groupSlug: string;
  services: (CategoryPageService & { categorySlug: string })[];
  currency: string;
};

/**
 * "Featured treatments" block for the group page — the group's isFeatured
 * services rendered with the same pricing rows as the pricing/category pages.
 */
export default function GroupFeatured({
  groupSlug,
  services,
  currency,
}: GroupFeaturedProps) {
  const t = useTranslations();
  const router = useRouter();

  if (services.length === 0) return null;

  const handleBook = (service: { slug: string }) =>
    router.push(`/booking?service=${service.slug}`);

  return (
    <section
      id="featured-services"
      aria-labelledby="group-featured-heading"
      className="mt-8 scroll-mt-24"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-copper" strokeWidth={2} aria-hidden="true" />
        <h2
          id="group-featured-heading"
          className="text-base font-bold tracking-tight text-accent"
        >
          {t("groupPage.featured.heading")}
        </h2>
      </div>

      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary/90 shadow-elevation-1">
        <ul className="divide-y divide-border-primary/50 px-3 sm:px-5">
          {services.map((service) => (
            <PricingRow
              key={service.id}
              service={service}
              currency={currency}
              onBook={() => handleBook(service)}
              groupSlug={groupSlug}
              bookVariant="xl"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}