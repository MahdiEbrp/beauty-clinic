"use client";

import { useTranslations } from "next-intl";
import { LogOut, X } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import BrandLogo from "@/components/BrandLogo";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { iconForCatalog } from "@/data/services";
import type { PublicNavCatalog } from "@/lib/services/types";
import type { NavKey, RouteNavKey } from "@/data/navigation";
import type { AuthUser } from "@/lib/auth/dal";

export type DrawerLink = { key: NavKey | RouteNavKey; href: string };

const rowBase =
  "flex w-full items-center gap-3 rounded-control text-body-sm font-semibold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function rowClass(active: boolean) {
  return `${rowBase} min-h-11 px-4 ${
    active
      ? "border-s-2 border-accent bg-accent text-content-contrast shadow-elevation-1"
      : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
  }`;
}

/**
 * Public mobile drawer content — a visual clone of the dashboard's
 * MobileHeader drawer (flat edges, elevation shadow, start-anchored slide via
 * the parent Sheet). Sections: brand header + locale switch + close, a
 * scrollable nav list whose Services accordion is fed by the lightweight
 * `PublicNavCatalog` tree (group -> category -> service names only, see
 * lib/services/types.ts), and an account block pinned to the end.
 *
 * Each group is its own accordion item; each service inside links straight
 * to its entry on the pricing page (`#pricing-<groupSlug>-<serviceSlug>`),
 * matching the desktop mega menu's link scheme. Category names are shown as
 * non-interactive subheadings above their services when a group has more
 * than one category, to keep the list scannable without adding another
 * nesting level of accordion.
 */
export default function MobileDrawerContent({
  user,
  catalog,
  anchorItems,
  routeItems,
  isRouteActive,
  onClose,
  loggingOut,
  onLogout,
}: {
  user: AuthUser | null;
  catalog: PublicNavCatalog | null;
  anchorItems: DrawerLink[];
  routeItems: DrawerLink[];
  isRouteActive: (href: string) => boolean;
  onClose: () => void;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const t = useTranslations();
  const groups = catalog?.groups ?? [];

  return (
    <>
      <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border-primary pe-3 ps-5">
        <Link
          href="/"
          onClick={onClose}
          className="flex min-h-11 items-center gap-2 text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <BrandLogo alt={t("site.name")} className="h-8" />
          <span className="text-body-lg font-black truncate">{t("site.name")}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleSwitcher compact />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("nav.closeMenu")}
            className="inline-flex size-11 items-center justify-center rounded-pill text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-6" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label={t("nav.mainNav")}
      >
        <Accordion type="single" collapsible>
          <AccordionItem value="services" className="border-b-0">
            <AccordionTrigger
              className={`${rowBase} min-h-11 px-4 py-0 text-start hover:bg-surface-tertiary hover:no-underline [&>svg]:size-4 [&>svg]:self-center [&>svg]:translate-y-0`}
            >
              <span>{t("nav.services")}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-2 pt-1">
              {groups.map((group) => {
                const Icon = iconForCatalog(group.icon);
                return (
                  <div key={group.slug} className="mb-3 last:mb-0">
                    <div className="flex min-h-9 items-center gap-2 pe-4 ps-8 text-caption font-bold text-accent">
                      <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                      <span className="truncate">{group.title}</span>
                    </div>

                    {group.categories.map((category) => (
                      <div key={category.slug}>
                        {group.categories.length > 1 && (
                          <p className="mb-0.5 mt-1.5 truncate pe-4 ps-12 text-tiny font-semibold uppercase tracking-wide text-content-tertiary">
                            {category.title}
                          </p>
                        )}
                        {category.services.map((service) => (
                          <Link
                            key={service.slug}
                            href={`/pricing#pricing-${group.slug}-${service.slug}`}
                            onClick={onClose}
                            className={`${rowBase} min-h-9 pe-4 ps-12 text-caption text-content-secondary hover:bg-surface-tertiary hover:text-accent`}
                          >
                            <span className="truncate">{service.title}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })}
              {groups.length === 0 && (
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className={`${rowBase} min-h-11 pe-4 ps-8 text-content-secondary hover:bg-surface-tertiary hover:text-accent`}
                >
                  <span className="truncate">{t("nav.pricing")}</span>
                </Link>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {anchorItems.map((item) => (
          <Link key={item.key} href={item.href} onClick={onClose} className={rowClass(false)}>
            <span className="truncate">{t(`nav.${item.key}`)}</span>
          </Link>
        ))}

        {routeItems.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={onClose}
            aria-current={isRouteActive(item.href) ? "page" : undefined}
            className={rowClass(isRouteActive(item.href))}
          >
            <span className="truncate">{t(`nav.${item.key}`)}</span>
          </Link>
        ))}
      </nav>

      <div className="m-3 shrink-0 rounded-card border border-border-primary bg-surface-tertiary/30 p-3">
        {user ? (
          <>
            <div className="mb-2 flex items-center gap-3 px-1">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-copper text-body-sm font-bold text-content-contrast"
                aria-hidden="true"
              >
                {user.fullName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0].toUpperCase())
                  .join("")}
              </span>
              <p className="truncate text-body-sm font-bold text-accent">{user.fullName}</p>
            </div>
            <Link
              href="/dashboard"
              onClick={onClose}
              className={`${rowBase} mb-2 min-h-11 justify-center rounded-control border border-border-primary bg-surface-secondary text-accent hover:bg-surface-primary`}
            >
              {t("nav.dashboard")}
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              disabled={loggingOut}
              aria-busy={loggingOut}
              className={`${rowBase} min-h-11 justify-center rounded-control border border-border-interactive bg-transparent text-accent hover:border-accent hover:bg-surface-tertiary disabled:opacity-60`}
            >
              <LogOut className="size-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            onClick={onClose}
            className={`${rowBase} min-h-11 justify-center rounded-pill bg-accent font-bold text-content-contrast hover:bg-accent-hover`}
          >
            {t("nav.login")}
          </Link>
        )}
      </div>
    </>
  );
}
