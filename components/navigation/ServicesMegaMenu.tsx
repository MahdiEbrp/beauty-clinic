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
  "mb-1.5 flex items-center gap-2 border-b border-border-primary/60 pb-1.5";

const serviceLinkClass = [
  "group/link",
  "flex min-h-7 w-full items-center justify-between gap-2",
  "rounded-control px-2 py-1",
  "text-caption leading-5",
  "text-content-secondary no-underline",
  "transition-colors duration-150",
  "hover:bg-accent-subtle hover:text-accent",
  "focus-visible:outline-2 focus-visible:outline-offset-2",
  "focus-visible:outline-accent",
].join(" ");

export default function ServicesMegaMenu({
  catalog,
}: {
  catalog: PublicNavCatalog | null;
}) {
  const t = useTranslations();

  const groups = catalog?.groups ?? [];

  if (groups.length === 0) {
    return null;
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        {t("nav.services")}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <div
          className="
            w-[min(calc(100vw-2rem),56rem)]
            overflow-hidden
            rounded-panel
            border
            border-border-primary
            bg-surface
            shadow-elevation-2
          "
        >
          {/* Main menu */}
          <div className="relative">
            {/* Very subtle top accent */}
            <div
              className="
                pointer-events-none
                absolute inset-x-0 top-0
                h-16
                bg-linear-to-b
                from-copper/[0.035]
                to-transparent
              "
              aria-hidden="true"
            />

            <div
              className="
                relative
                max-h-[min(70vh,36rem)]
                overflow-y-auto
                px-3.5
                py-3.5
                sm:px-4
                sm:py-4
              "
            >
              {/* 
                CSS columns are intentional here.

                Unlike grid:
                - groups don't create large empty spaces
                - content flows vertically
                - each group stays intact
                - 3 columns are used on large screens
                - 2 on tablets
                - 1 on mobile
              */}
              <div
                className="
                  columns-1
                  gap-x-7
                  sm:columns-2
                  lg:columns-3
                "
              >
                {groups.map((group) => {
                  const Icon = iconForCatalog(group.icon);

                  /*
                   * Deduplicate services inside a group.
                   * This protects against stale catalog data where the
                   * same service exists in multiple categories.
                   */
                  const seen = new Set<string>();

                  const services = group.categories.flatMap((category) =>
                    category.services.filter((service) => {
                      if (seen.has(service.slug)) {
                        return false;
                      }

                      seen.add(service.slug);

                      return true;
                    }),
                  );

                  /*
                   * Don't render empty groups.
                   * This also prevents unnecessary blank areas in columns.
                   */
                  if (services.length === 0) {
                    return null;
                  }

                  return (
                    <section
                      key={group.slug}
                      className="
                        mb-4
                        break-inside-avoid
                        align-top
                      "
                    >
                      {/* Group header */}
                      <div className={groupHeaderClass}>
                        <span
                          className="
                            flex size-6.5 shrink-0
                            items-center justify-center
                            rounded-control
                            bg-copper/10
                            text-copper-strong
                          "
                          aria-hidden="true"
                        >
                          <Icon
                            className="size-3.5"
                            strokeWidth={2}
                          />
                        </span>

                        <span
                          className="
                            min-w-0
                            truncate
                            text-caption
                            font-bold
                            text-accent
                          "
                        >
                          {group.title}
                        </span>

                        <span
                          className="
                            ms-auto
                            shrink-0
                            text-[10px]
                            font-semibold
                            tabular-nums
                            text-content-tertiary
                          "
                          aria-label={`${services.length} services`}
                        >
                          {services.length}
                        </span>
                      </div>

                      {/* Services */}
                      <ul className="m-0 list-none space-y-px p-0">
                        {services.map((service) => (
                          <li key={service.slug}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={`/pricing#pricing-${group.slug}-${service.slug}`}
                                className={serviceLinkClass}
                              >
                                <span className="min-w-0 truncate">
                                  {service.title}
                                </span>

                                <ArrowLeft
                                  className="
                                    size-3
                                    shrink-0
                                    rtl-mirror
                                    text-copper-strong
                                    opacity-0
                                    transition-opacity
                                    duration-150
                                    group-hover/link:opacity-100
                                  "
                                  strokeWidth={2.5}
                                  aria-hidden="true"
                                />
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Compact footer */}
          <div
            className="
              border-t
              border-border-primary
              bg-surface-tertiary/30
              px-3
              py-2
            "
          >
            <NavigationMenuLink asChild>
              <Link
                href="/pricing"
                className="
                  flex
                  h-9
                  items-center
                  justify-center
                  gap-2
                  rounded-control
                  bg-accent
                  px-3
                  text-caption
                  font-bold
                  text-content-contrast
                  no-underline
                  shadow-elevation-1
                  transition-colors
                  hover:bg-accent-hover
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-accent
                "
              >
                <Sparkles
                  className="size-3.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>{t("nav.pricing")}</span>

                <ArrowLeft
                  className="size-3.5 rtl-mirror"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            </NavigationMenuLink>
          </div>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}