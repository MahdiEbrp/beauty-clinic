"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Menu, Search, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import type { AuthUser } from "@/lib/auth/dal";
import type { SidebarNavItem } from "./SidebarSections";
import {
  SidebarNavSection,
  SidebarUserSection,
} from "./SidebarSections";
import LocaleSwitcher from "../LocaleSwitcher";
import { ProfileControl } from "./ProfileControl";

const MENU_ID = "dashboard-sidebar-menu";

export function MobileHeader({
  menuOpen,
  onToggleMenu,
  user,
  loggingOut,
  onLogout,
  navItems,
  isActive,
}: {
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
  user: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
  navItems: SidebarNavItem[];
  isActive: (href: string) => boolean;
}) {
  const t = useTranslations();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggleMenu(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, onToggleMenu]);

  const searchResults = navItems.filter((item) => {
    const label = t(`dashboard.sidebar.${item.key}`);
    const query = searchTerm.trim().toLocaleLowerCase();
    return !query || label.toLocaleLowerCase().includes(query);
  });

  const searchResultsPanel = (
    <div className="rounded-card border border-border-primary bg-surface-secondary p-2">
      <p className="px-3 pb-2 pt-1 text-dash-caption text-content-tertiary">
        {t("dashboard.topbar.searchResults")}
      </p>
      {searchResults.length > 0 ? (
        searchResults.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => {
              setSearchOpen(false);
              setSearchTerm("");
            }}
            className="flex min-h-11 items-center gap-3 rounded-control px-3 text-dash-body-sm font-semibold text-content-secondary no-underline transition hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <item.icon className="size-4" aria-hidden="true" />
            <span>{t(`dashboard.sidebar.${item.key}`)}</span>
          </Link>
        ))
      ) : (
        <p className="px-3 py-3 text-dash-caption text-content-tertiary">
          {t("dashboard.topbar.noSearchResults")}
        </p>
      )}
    </div>
  );

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 h-16 bg-surface-secondary/90 backdrop-blur-md border-b border-border-primary">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-accent no-underline min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <BrandLogo alt={t("site.shortName")} className="h-7" />
          <span className="text-dash-body font-black">
            {t("site.shortName")}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ProfileControl
            user={user}
            loggingOut={loggingOut}
            onLogout={onLogout}
          />
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t("dashboard.topbar.search")}
            className="inline-flex size-10 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => onToggleMenu(!menuOpen)}
            aria-label={
              menuOpen
                ? t("dashboard.sidebar.closeMenu")
                : t("dashboard.sidebar.openMenu")
            }
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            className="inline-flex size-10 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-60 bg-surface-primary p-4 sm:p-6">
          <div ref={searchRef} className="relative mx-auto max-w-xl">
            <div className="flex h-12 items-center gap-3 rounded-control border border-border-interactive bg-surface-secondary px-4">
              <Search
                className="size-5 text-content-tertiary"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("dashboard.topbar.searchPlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-dash-body text-accent outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label={t("dashboard.sidebar.closeMenu")}
                className="text-content-tertiary hover:text-accent"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative mt-3 min-h-24">
              {searchResultsPanel}
            </div>
          </div>
        </div>
      )}

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-[visibility] duration-200 ${
          menuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-accent-hover/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => onToggleMenu(false)}
          aria-hidden="true"
        />
        <div
          id={MENU_ID}
          className={`absolute top-0 bottom-0 inset-s-0 flex w-72 max-w-[85%] flex-col bg-surface-secondary shadow-elevation-4 transition-transform duration-200 ease-out ${
            menuOpen
              ? "translate-x-0"
              : "ltr:-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between min-h-16 px-5 border-b border-border-primary shrink-0">
            <Link
              href="/"
              onClick={() => onToggleMenu(false)}
              className="flex items-center gap-2 text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <BrandLogo alt={t("site.name")} className="h-8" />
              <span className="text-dash-title font-black truncate">
                {t("site.name")}
              </span>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <LocaleSwitcher compact />
              <button
                type="button"
                onClick={() => onToggleMenu(false)}
                aria-label={t("dashboard.sidebar.closeMenu")}
                className="inline-flex items-center justify-center w-11 h-11 rounded-pill text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X
                  className="w-6 h-6"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
          <SidebarNavSection
            items={navItems}
            isCollapsed={false}
            onNavigate={() => onToggleMenu(false)}
            isActive={isActive}
            t={t}
          />
          <SidebarUserSection
            user={user}
            isCollapsed={false}
            loggingOut={loggingOut}
            onLogout={onLogout}
            t={t}
          />
        </div>
      </div>
    </>
  );
}
