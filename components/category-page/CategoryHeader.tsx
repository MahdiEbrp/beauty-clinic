import { createElement } from "react";
import { Link } from "@/src/i18n/navigation";
import { iconForCatalog } from "@/data/services";
import CategoryBreadcrumb, {
  type BreadcrumbCrumb,
} from "./CategoryBreadcrumb";
import type { CategoryPageCategory, CategoryPageGroup } from "@/lib/services/category-page";

type CategoryHeaderProps = {
  category: CategoryPageCategory;
  group: CategoryPageGroup;
  crumbs: BreadcrumbCrumb[];
};

/**
 * Page header for a single service category: breadcrumb, a group link pill,
 * the H1 and the category description.
 */
export default function CategoryHeader({
  category,
  group,
  crumbs,
}: CategoryHeaderProps) {
  const icon = iconForCatalog(category.icon);

  return (
    <header className="mb-8">
      <CategoryBreadcrumb crumbs={crumbs} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
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
          <div className="min-w-0">
            <Link
              href={`/services/${group.slug}`}
              className="inline-flex min-h-11 items-center gap-1 rounded-control px-1 text-caption font-semibold text-copper no-underline transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="font-semibold">{group.title}</span>
            </Link>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-accent sm:text-4xl">
          {category.title}
        </h1>
        {category.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-content-secondary sm:text-base">
            {category.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}