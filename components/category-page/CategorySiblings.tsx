"use client";

import { ArrowRight, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import type { CategoryPageCategory, CategoryPageGroup } from "@/lib/services/category-page";

type CategorySiblingsProps = {
  group: CategoryPageGroup;
  siblings: CategoryPageCategory[];
};

/**
 * "More in <group>" rail listing the sibling categories as link chips so the
 * visitor can jump between a group's categories without the mega menu.
 */
export default function CategorySiblings({
  group,
  siblings,
}: CategorySiblingsProps) {
  const t = useTranslations();

  if (siblings.length === 0) return null;

  return (
    <section aria-labelledby="category-siblings-heading" className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <PackageOpen
          className="size-4 text-copper"
          strokeWidth={2}
          aria-hidden="true"
        />
        <h2
          id="category-siblings-heading"
          className="text-base font-bold tracking-tight text-accent"
        >
          {t("categoryPage.siblings.heading", { title: group.title })}
        </h2>
      </div>

      <ul className="flex flex-wrap gap-2">
        {siblings.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/services/${group.slug}/${category.slug}`}
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-caption font-semibold text-content-secondary no-underline transition-colors hover:border-accent hover:bg-accent hover:text-content-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="max-w-56 truncate">{category.title}</span>
              <ArrowRight
                className="size-3.5 rtl-mirror text-copper transition-colors group-hover:text-content-contrast"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}