"use client";

import { ArrowRight, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { iconForCatalog } from "@/data/services";
import type { GroupPageCategory } from "@/lib/services/group-page";

type GroupCategoriesProps = {
  groupSlug: string;
  categories: GroupPageCategory[];
};

/**
 * Card grid of the group's categories — the main navigation surface of the
 * group landing page. Each card deep-links to its own SEO category page.
 */
export default function GroupCategories({
  groupSlug,
  categories,
}: GroupCategoriesProps) {
  const t = useTranslations();

  if (categories.length === 0) {
    return (
      <section aria-labelledby="group-categories-heading" className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="size-4 text-copper" strokeWidth={2} aria-hidden="true" />
          <h2
            id="group-categories-heading"
            className="text-base font-bold tracking-tight text-accent"
          >
            {t("groupPage.categories.heading")}
          </h2>
        </div>
        <p className="rounded-panel border border-border-primary bg-surface-secondary/90 px-5 py-12 text-center text-caption text-content-tertiary">
          {t("common.empty")}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="group-categories-heading" className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Layers className="size-4 text-copper" strokeWidth={2} aria-hidden="true" />
        <h2
          id="group-categories-heading"
          className="text-base font-bold tracking-tight text-accent"
        >
          {t("groupPage.categories.heading")}
        </h2>
        <span className="ms-auto text-caption font-semibold tabular-nums text-content-tertiary">
          {t("groupPage.categories.count", { count: categories.length })}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = iconForCatalog(category.icon);
          return (
            <li key={category.slug}>
              <Link
                href={`/services/${groupSlug}/${category.slug}`}
                className="group flex h-full min-h-44 flex-col gap-3 rounded-panel border border-border-primary bg-surface-secondary/90 p-5 no-underline shadow-elevation-1 transition-colors hover:border-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex size-9 items-center justify-center rounded-control bg-copper/12 text-copper-strong">
                  <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-bold tracking-tight text-accent">
                    {category.title}
                  </span>
                  {category.description ? (
                    <span className="mt-1 block text-caption leading-relaxed text-content-secondary line-clamp-2">
                      {category.description}
                    </span>
                  ) : null}
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-caption font-semibold text-copper transition-colors group-hover:text-accent">
                  <span>
                    {t("groupPage.categories.serviceCount", {
                      count: category.serviceCount,
                    })}
                  </span>
                  <ArrowRight
                    className="size-3.5 rtl-mirror"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}