"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { iconForCatalog } from "@/data/services";
import type { PublicNavCatalog } from "@/lib/services/types";

const groupHeaderClass =
  "flex items-center gap-2 px-3 pb-2 pt-1 text-body-sm font-bold text-accent";

const serviceLinkClass =
  "group flex min-h-9 items-center gap-2 rounded-control px-3 py-1.5 text-caption text-content-secondary no-underline transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";


export default function ServicesMegaMenu({ catalog }: { catalog: PublicNavCatalog | null }) {
  const t = useTranslations();
  const groups = catalog?.groups ?? [];

  if (groups.length === 0) return null;

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{t("nav.services")}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="flex w-[min(calc(100vw-3rem),58rem)] flex-col">
          <div className="grid max-h-[min(70vh,32rem)] grid-cols-1 gap-x-2 gap-y-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {groups.map((group) => {
              const Icon = iconForCatalog(group.icon);
              // The mega menu flattens every category's services into a single
              // <ul>, whose <li> items are keyed by service.slug. If a service
              // ever sits under two categories of the same group (stale or
              // over-constrained catalog data), that flat list would contain
              // two siblings with the same key, which React treats as an error,
              // re-renders repeatedly and can crash the page when the menu
              // opens. Collapse to the first occurrence per group so the keys
              // are always unique. (Categories aren't shown here anyway.)
              const seen = new Set<string>();
              const services = group.categories.flatMap((category) =>
                category.services.filter((service) => {
                  if (seen.has(service.slug)) return false;
                  seen.add(service.slug);
                  return true;
                }),
              );
              return (
                <div key={group.slug}>
                  <div className={groupHeaderClass}>
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-copper/15 text-copper-strong"
                      aria-hidden="true"
                    >
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <span className="truncate">{group.title}</span>
                  </div>

                  <ul className="m-0 list-none">
                    {services.map((service) => (
                        <li key={service.slug}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/pricing#pricing-${group.slug}-${service.slug}`}
                              className={serviceLinkClass}
                            >
                              <span className="truncate">{service.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 border-t border-border-primary p-3">
            <NavigationMenuLink asChild>
              <Link
                href="/pricing"
                className="flex min-h-11 items-center justify-center gap-2 rounded-control border border-border-primary bg-surface-secondary px-4 py-2.5 text-body-sm font-semibold text-content-secondary no-underline transition-colors hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Sparkles className="size-4" strokeWidth={2} aria-hidden="true" />
                {t("nav.pricing")}
                <ArrowLeft className="size-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
              </Link>
            </NavigationMenuLink>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
