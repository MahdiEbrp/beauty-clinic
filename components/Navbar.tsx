"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu } from "lucide-react";

import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { getNavItems, getRouteNavItems } from "@/data/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { PublicNavCatalog } from "@/lib/services/types";

import LocaleSwitcher from "./LocaleSwitcher";
import NavbarAuth from "@/components/navigation/NavbarAuth";
import ServicesMegaMenu from "@/components/navigation/ServicesMegaMenu";
import MobileDrawerContent, {
  type DrawerLink,
} from "@/components/navigation/MobileDrawerContent";
import BrandLogo from "@/components/BrandLogo";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const desktopLinkClass =
  "text-body-sm font-semibold no-underline transition-colors min-h-11 flex items-center whitespace-nowrap rounded-control px-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Navbar({
  user,
  catalog,
}: {
  user: AuthUser | null;
  catalog?: PublicNavCatalog | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const prevLocaleRef = useRef(locale);

  const isHomePage = pathname === "/" || pathname === `/${locale}`;
  const getAnchorHref = (anchor: string) =>
    isHomePage ? anchor : `/${anchor}`;

  const anchorLinks: DrawerLink[] = getNavItems()
    .filter((item) => item.key !== "services")
    .map((item) => ({
      key: item.key,
      href: getAnchorHref(item.href),
    }));

  const routeLinks: DrawerLink[] = getRouteNavItems().map((item) => ({
    key: item.key,
    href: item.href,
  }));

  const isRouteActive = (href: string) => pathname === href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      setMenuOpen(false);
    }
  }, [locale]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.replace("/login");
        router.refresh();
      }
    } catch {
      // Ignore
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      className={`fixed top-4 inset-x-4 z-50 rounded-pill transition-all duration-300 ${scrolled
        ? "bg-surface-secondary/95 backdrop-blur-xl border border-border-primary shadow-elevation-2"
        : "bg-surface-secondary/70 backdrop-blur-md border border-border-primary/40 shadow-elevation-1"
        }`}
    >
      <nav
        className="flex items-center gap-2 px-4 h-15 w-full lg:max-w-content mx-auto relative"
        aria-label={t("nav.mainNav")}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-control text-xl font-black text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <BrandLogo
            alt={t("site.name")}
            className="h-8 w-auto shrink-0"
          />

          <span className="hidden min-w-0 flex-1 truncate md:block">
            {t("site.name")}
          </span>
        </Link>

        <NavigationMenu
          className="hidden min-w-0 flex-1 justify-center lg:flex"
          delayDuration={100}
        >
          <NavigationMenuList className="gap-1">
            <ServicesMegaMenu catalog={catalog ?? null} />

            {anchorLinks.map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={`${desktopLinkClass} text-content-secondary hover:text-accent`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            {routeLinks.map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    aria-current={
                      isRouteActive(item.href) ? "page" : undefined
                    }
                    className={`${desktopLinkClass} ${isRouteActive(item.href)
                      ? "text-accent"
                      : "text-content-secondary hover:text-accent"
                      }`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>

          <div className="pointer-events-none fixed inset-x-0 top-19 z-50 hidden justify-center lg:flex">
            <NavigationMenuViewport className="pointer-events-auto hidden lg:block data-[state=closed]:invisible" />
          </div>
        </NavigationMenu>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LocaleSwitcher />
          <NavbarAuth
            user={user}
            onLogout={() => void handleLogout()}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 lg:hidden">
          <LocaleSwitcher compact />

          {user && (
            <Link
              href="/dashboard"
              aria-label={t("nav.dashboard")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-pill bg-copper text-caption font-bold text-content-contrast"
                aria-hidden="true"
              >
                {initials(user.fullName)}
              </span>
            </Link>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-transparent bg-transparent text-accent transition-all duration-300 hover:bg-surface-tertiary hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Menu
                  className="h-6 w-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  {t("nav.openMenu")}
                </span>
              </button>
            </SheetTrigger>

            <SheetContent
              showCloseButton={false}
              className="inset-e-auto inset-s-0 w-72 max-w-[85%] border-s-0 border-e p-0 gap-0 data-[state=open]:animate-drawer-in rtl:data-[state=open]:animate-drawer-in-rtl"
            >
              <MobileDrawerContent
                user={user}
                catalog={catalog ?? null}
                anchorItems={anchorLinks}
                routeItems={routeLinks}
                isRouteActive={isRouteActive}
                onClose={() => setMenuOpen(false)}
                loggingOut={loggingOut}
                onLogout={() => void handleLogout()}
              />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}