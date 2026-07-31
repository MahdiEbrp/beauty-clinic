"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Wind, Menu, X } from "lucide-react";
import { getNavItems } from "@/data/navigation";
import LocaleSwitcher from "./LocaleSwitcher";

const MENU_ID = "primary-mobile-menu";

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navItems = getNavItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on locale switch, otherwise the panel survives the navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [locale]);

  // Escape to dismiss (returning focus to the toggle) and click-outside.
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

        <ul className="hidden lg:flex gap-8 list-none m-0 p-0">
          {navItems.map((item) => (
            <li key={item.key}>
              <a
                href={item.href}
                className="text-base font-semibold text-content-secondary no-underline transition-colors hover:text-accent min-h-11 flex items-center whitespace-nowrap rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t(`nav.${item.key}`)}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <LocaleSwitcher />
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <LocaleSwitcher />
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
            className="lg:hidden absolute top-[70px] inset-x-0 bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-3 p-4 flex flex-col gap-2 items-center overflow-hidden animate-fade-in"
          >
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="p-3 min-h-11 flex items-center justify-center rounded-control text-accent no-underline hover:bg-surface-tertiary font-semibold w-full text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
