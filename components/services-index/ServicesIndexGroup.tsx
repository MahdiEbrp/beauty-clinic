import { createElement } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ChevronLeft, Layers } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { iconForCatalog } from "@/data/services";
import type { ServicesIndexGroup as ServicesIndexGroupData } from "@/lib/services/services-index";

type ServicesIndexGroupProps = {
  group: ServicesIndexGroupData;
  locale: string;
};

/**
 * One group section of the `/services` hub: a group header row (icon, title,
 * description, category count, link to the SEO group page) followed by a card
 * grid of its categories that deep-link into the SEO category pages.
 */
export default async function ServicesIndexGroup({
  group,
  locale,
}: ServicesIndexGroupProps) {
  const t = await getTranslations({ locale });

  const icon = iconForCatalog(group.icon);

  return (
    <section aria-labelledby={`group-${group.slug}-heading`} className="mt-10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-control bg-copper/12 text-copper-strong"
          aria-hidden="true"
        >
          {createElement(icon, {
            className: "size-5",
            strokeWidth: 2,
            "aria-hidden": true,
          })}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id={`group-${group.slug}-heading`}
            className="text-lg font-bold tracking-tight text-accent"
          >
            {group.title}
          </h2>
          {group.description ? (
            <p className="mt-0.5 max-w-3xl text-caption leading-relaxed text-content-secondary">
              {group.description}
            </p>
          ) : null}
        </div>
      </div>

      {group.categories.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {group.categories.map((category) => {
            const categoryIcon = iconForCatalog(category.icon);
            return (
              <li key={category.slug}>
                <Link
                  href={`/services/${group.slug}/${category.slug}`}
                  className="group flex h-full min-h-44 flex-col gap-3 rounded-panel border border-border-primary bg-surface-secondary/90 p-5 no-underline shadow-elevation-1 transition-colors hover:border-accent hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex size-9 items-center justify-center rounded-control bg-copper/12 text-copper-strong">
                    {createElement(categoryIcon, {
                      className: "size-4",
                      strokeWidth: 2,
                      "aria-hidden": true,
                    })}
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
      ) : null}

      <div className="mt-4">
        <Link
          href={`/services/${group.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-border-interactive px-4 text-caption font-semibold text-content-secondary no-underline transition-colors hover:border-accent hover:bg-accent hover:text-content-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Layers className="size-3.5" strokeWidth={2} aria-hidden="true" />
          <span>{t("groupPage.categories.heading")}</span>
          <ChevronLeft className="size-3.5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}