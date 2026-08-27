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
  "text-body-sm font-semibold no-underline transition-colors min-h-11 flex items-center whitespace-nowrap rounded-control px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Public marketing navbar.
 *
 * Desktop (lg+): a Radix NavigationMenu row whose first item is the server-
 * cached Services mega menu; remaining items are the classic anchors/routes.
 * Mobile (<lg): the hamburger opens a start-side Sheet — a clone of the
 * dashboard MobileHeader drawer — containing the same links plus a Services
 * accordion. Catalog data arrives via props from the server layout; nothing
 * is fetched on the client.
 *
 * MEGA MENU POSITIONING: the <header> itself is `fixed top-4 inset-x-4` —
 * a floating pill with its own inset from the window edges, not a full-width
 * bar. The mega menu's viewport must be centered on the *window*, not on
 * this already-inset <nav>: centering it relative to the <nav> compounds
 * the header's own inset with the panel's offset, which is what pushed the
 * panel off-screen (worse in RTL, where the offset direction flips). Using
 * `fixed inset-x-0` (viewport-relative, ignoring ancestor position/inset)
 * instead of `absolute inset-x-0` (relative to the nearest positioned
 * ancestor, i.e. the inset header) makes the centering math independent of
 * where the pill itself sits, in both LTR and RTL.
 */
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
  const getAnchorHref = (anchor: string) => (isHomePage ? anchor : `/${anchor}`);

  const anchorLinks: DrawerLink[] = getNavItems()
    .filter((item) => item.key !== "services") // replaced by the mega menu / accordion
    .map((item) => ({ key: item.key, href: getAnchorHref(item.href) }));
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
        className="flex justify-between items-center gap-2 px-4 h-15 max-w-content mx-auto relative"
        aria-label={t("nav.mainNav")}
      >
        <Link
          href="/"
          className="text-xl font-black flex items-center gap-2 text-accent no-underline whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-w-0 shrink"
        >
          <BrandLogo alt={t("site.name")} className="h-8 shrink-0" />
          <span className="truncate">{t("site.name")}</span>
        </Link>

        {/* Desktop — NavigationMenu hosts the Services mega menu trigger/list. */}
        <NavigationMenu className="hidden lg:flex" delayDuration={100}>
          <NavigationMenuList className="gap-4">
            <ServicesMegaMenu catalog={catalog ?? null} />
            {anchorLinks.map((item) => (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink asChild>
                  <Link href={item.href} className={`${desktopLinkClass} text-content-secondary hover:text-accent`}>
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
                    aria-current={isRouteActive(item.href) ? "page" : undefined}
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

          {/*
            `fixed` (not `absolute`) + `inset-x-0` centers this wrapper on the
            *window*, ignoring the fact that its positioned ancestor
            (<header>) is itself inset by `top-4 inset-x-4`. `top-[4.75rem]`
            approximates "just under the pill header" (header top offset
            1rem + header height ~3.75rem); adjust if the header's height
            token changes. This is what actually keeps the panel centered
            and on-screen in both LTR and RTL — centering `absolute` on the
            <nav> re-introduces the header's own inset into the math and is
            what caused the edge bleed.
          */}
          <div className="pointer-events-none fixed inset-x-0 top-19 z-50 hidden justify-center lg:flex">
            <NavigationMenuViewport className="pointer-events-auto hidden lg:block data-[state=closed]:invisible" />
          </div>
        </NavigationMenu>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <LocaleSwitcher />
          <NavbarAuth user={user} onLogout={() => void handleLogout()} />
        </div>

        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <LocaleSwitcher compact />
          {user && (
            <Link
              href="/dashboard"
              aria-label={t("nav.dashboard")}
              className="inline-flex items-center justify-center w-11 h-11 rounded-pill no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent shrink-0"
            >
              <span
                className="w-8 h-8 rounded-pill bg-copper text-content-contrast flex items-center justify-center text-caption font-bold"
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
                className="inline-flex items-center justify-center w-11 h-11 bg-transparent border border-transparent text-accent rounded-pill transition-all duration-300 hover:bg-surface-tertiary hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent shrink-0"
              >
                <Menu className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">{t("nav.openMenu")}</span>
              </button>
            </SheetTrigger>
            <SheetContent
              showCloseButton={false}
              className="inset-e-auto inset-s-0 w-72 max-w-[85%] sm:max-w-[85%] border-s-0 border-e p-0 gap-0 data-[state=open]:animate-drawer-in rtl:data-[state=open]:animate-drawer-in-rtl"
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
