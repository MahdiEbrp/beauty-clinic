"use client";

import { useTranslations } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { iconForCatalog } from "@/data/services";
import type { PublicTreeGroup } from "@/lib/services/types";
import { cn } from "@/lib/utils";

type GroupRailProps = {
  groups: PublicTreeGroup[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
};

/** Horizontally scrollable group filter pills ("All" + each group). */
export default function GroupRail({ groups, activeSlug, onSelect }: GroupRailProps) {
  const t = useTranslations();
  const items: { slug: string | null; title: string; icon: typeof LayoutGrid }[] = [
    { slug: null, title: t("pricing.sections.all"), icon: LayoutGrid },
    ...groups.map((group) => ({
      slug: group.slug,
      title: group.title,
      icon: iconForCatalog(group.icon),
    })),
  ];

  return (
    <nav
      aria-label={t("pricing.sections.all")}
      className="scrollbar-hide -mx-6 overflow-x-auto px-6 pb-2"
    >
      <ul className="flex w-max items-center gap-2.5">
        {items.map(({ slug, title, icon: Icon }) => {
          const active = slug === activeSlug;
          return (
            <li key={slug ?? "all"}>
              <button
                type="button"
                onClick={() => onSelect(slug)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  active
                    ? "border-accent bg-accent text-content-contrast"
                    : "border-border-primary bg-surface-secondary text-content-secondary hover:border-border-interactive hover:text-accent",
                )}
              >
                <Icon
                  className={cn("size-4", active ? "text-gold" : "text-copper")}
                  aria-hidden="true"
                />
                {title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}