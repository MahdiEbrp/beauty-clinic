import { ChevronLeft } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

export type BreadcrumbCrumb = {
  label: string;
  href: string;
};

type CategoryBreadcrumbProps = {
  crumbs: BreadcrumbCrumb[];
};

/**
 * Semantic <nav> breadcrumb trail for the category page. Each crumb is an
 * inline link (≥44px hit area via min-h-11) with the current page as the last,
 * non-interactive item. Separator icon is `rtl-mirror` so it flips in fa.
 */
export default function CategoryBreadcrumb({ crumbs }: CategoryBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronLeft
                  className="size-3.5 text-content-tertiary rtl-mirror"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center rounded-control px-2 text-caption font-semibold text-content-tertiary"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-11 items-center rounded-control px-2 text-caption font-medium text-content-secondary no-underline transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}