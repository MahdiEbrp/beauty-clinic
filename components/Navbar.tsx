"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { Wind, Menu, X, User, LogOut } from "lucide-react";
import { getNavItems, getRouteNavItems } from "@/data/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import LocaleSwitcher from "./LocaleSwitcher";

const MENU_ID = "primary-mobile-menu";

export default function Navbar({ user }: { user: AuthUser | null }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const prevLocaleRef = useRef(locale);
  const navItems = getNavItems();
  const routeItems = getRouteNavItems();

  const isHomePage = pathname === "/" || pathname === `/${locale}`;

  const getAnchorHref = (anchor: string) => {
    return isHomePage ? anchor : `/${anchor}`;
  };

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

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
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
    }
  };

  const renderAuthLinks = () => {
    if (user) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-tertiary rounded-pill">
            <User className="w-5 h-5 text-copper" strokeWidth={2} aria-hidden="true" />
            <span className="text-body-sm font-semibold text-accent max-w-40 truncate">
              {user.fullName}
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-11 bg-accent text-content-contrast rounded-pill font-bold text-body-sm transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
          >
            <span>{t("nav.dashboard")}</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-11 bg-transparent border border-border-interactive text-accent rounded-pill font-bold text-body-sm transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <LogOut className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-11 bg-accent text-content-contrast rounded-pill font-bold text-body-sm transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
      >
        <span>{t("nav.login")}</span>
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-4 inset-x-4 z-50 rounded-pill shadow-elevation-1 transition-all duration-300 ${
        scrolled
          ? "bg-surface-secondary/80 backdrop-blur-xl border border-border-primary/50"
          : "bg-surface-secondary/60 backdrop-blur-md border border-border-primary/30"
      }`}
    >
      <nav
        ref={navRef}
        className="flex justify-between items-center px-4 h-15 max-w-content mx-auto relative"
        aria-label={t("nav.mainNav")}
      >
        <Link
          href="/"
          className="text-xl font-black flex items-center gap-2 text-accent no-underline whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Wind className="w-6 h-6 text-copper" strokeWidth={2} aria-hidden="true" />
          <span>{t("site.name")}</span>
        </Link>

        <ul className="hidden lg:flex gap-6 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item.key}>
              <Link
                href={getAnchorHref(item.href)}
                className="text-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent min-h-11 flex items-center whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          ))}
          {routeItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="text-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent min-h-11 flex items-center whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t(`nav.${item.key}`)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <LocaleSwitcher />
          {renderAuthLinks()}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <LocaleSwitcher />
          {renderAuthLinks()}
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex items-center justify-center w-11 h-11 bg-transparent border border-transparent text-accent rounded-pill transition-all duration-300 hover:bg-surface-tertiary hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
          >
            {menuOpen ? (
              <X className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div
            id={MENU_ID}
            className="lg:hidden absolute top-17.5 inset-x-0 bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-3 p-4 flex flex-col gap-2 items-center overflow-hidden animate-fade-in"
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={getAnchorHref(item.href)}
                className="p-3 min-h-11 flex items-center justify-center rounded-control text-accent no-underline hover:bg-surface-tertiary font-semibold text-body-sm w-full text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            {routeItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="p-3 min-h-11 flex items-center justify-center rounded-control text-accent no-underline hover:bg-surface-tertiary font-semibold text-body-sm w-full text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="w-full h-px bg-border-primary my-1" aria-hidden="true" />
            {user ? (
              <>
                <span className="w-full flex items-center justify-center gap-2 p-3 min-h-11 text-body-sm font-bold text-accent">
                  <User className="w-5 h-5 text-copper" strokeWidth={2} aria-hidden="true" />
                  <span className="truncate max-w-55">{user.fullName}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="p-3 min-h-11 flex items-center justify-center rounded-control text-accent no-underline hover:bg-surface-tertiary font-semibold text-body-sm w-full text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent bg-accent-subtle"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("nav.dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-3 min-h-11 flex items-center justify-center gap-2 rounded-control text-accent font-semibold text-body-sm w-full text-center border border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent hover:bg-surface-tertiary"
                >
                  <LogOut className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="p-3 min-h-11 flex items-center justify-center rounded-pill text-content-contrast no-underline bg-accent hover:bg-accent-hover font-bold text-body-sm w-full text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
