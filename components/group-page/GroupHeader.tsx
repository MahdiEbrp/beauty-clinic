import { createElement } from "react";
import { iconForCatalog } from "@/data/services";
import CategoryBreadcrumb, {
  type BreadcrumbCrumb,
} from "@/components/category-page/CategoryBreadcrumb";
import type { GroupPageGroup } from "@/lib/services/group-page";

type GroupHeaderProps = {
  group: GroupPageGroup;
  crumbs: BreadcrumbCrumb[];
};

/**
 * Header for a single service group: breadcrumb, the group icon, the H1 and
 * the group description/intro.
 */
export default function GroupHeader({ group, crumbs }: GroupHeaderProps) {
  const icon = iconForCatalog(group.icon);

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
          <span className="text-caption font-semibold text-copper">
            {group.title}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-accent sm:text-4xl">
          {group.title}
        </h1>
        {group.description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-content-secondary sm:text-base">
            {group.description}
          </p>
        ) : null}
      </div>
    </header>
  );
}