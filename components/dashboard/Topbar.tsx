"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import {
  Bell,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
  Search,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type { SidebarNavItem } from "./SidebarSections";
import LocaleSwitcher from "../LocaleSwitcher";
import { ProfileControl } from "./ProfileControl";

export function Topbar({
  sidebarMode,
  onToggleSidebar,
  pathname,
  user,
  loggingOut,
  onLogout,
  navItems,
}: {
  sidebarMode: "expanded" | "collapsed";
  onToggleSidebar: () => void;
  pathname: string;
  user: AuthUser;
  loggingOut: boolean;
  onLogout: () => void;
  navItems: SidebarNavItem[];
}) {
  const t = useTranslations();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target))
        setNotificationsOpen(false);
      if (!searchRef.current?.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [notificationsOpen, searchOpen]);

  const searchResults = navItems.filter((item) => {
    const label = t(msgKey(`dashboard.sidebar.${item.key}`));
    const query = searchTerm.trim().toLocaleLowerCase();
    return !query || label.toLocaleLowerCase().includes(query);
  });

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border-primary bg-surface-secondary px-6 lg:flex xl:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={
            sidebarMode === "expanded"
              ? t("dashboard.sidebar.collapse")
              : t("dashboard.sidebar.expand")
          }
          title={
            sidebarMode === "expanded"
              ? t("dashboard.sidebar.collapse")
              : t("dashboard.sidebar.expand")
          }
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-control text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {sidebarMode === "expanded" ? (
            <PanelRightClose className="size-5" aria-hidden="true" />
          ) : (
            <PanelRightOpen className="size-5" aria-hidden="true" />
          )}
        </button>
        <span className="h-6 w-px bg-border-primary" aria-hidden="true" />
        <nav
          aria-label={t("dashboard.topbar.breadcrumbLabel")}
          className="flex min-w-0 items-center gap-2 text-dash-body-sm"
        >
          <span className="truncate text-content-tertiary">
            {t("dashboard.topbar.access")}
          </span>
          <ChevronLeft
            className="size-4 shrink-0 text-content-tertiary rtl-mirror"
            aria-hidden="true"
          />
          <span className="truncate font-bold text-content-primary">
            {pathname.startsWith("/dashboard/users")
              ? t("users.heading")
              : pathname.startsWith("/dashboard/files")
                ? t("files.heading")
                : t("dashboard.topbar.dashboard")}
          </span>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div ref={searchRef} className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-expanded={searchOpen}
            aria-haspopup="listbox"
            className="flex h-10 w-72 items-center gap-2 rounded-control border border-border-primary bg-surface-primary px-3 text-dash-body-sm text-content-tertiary transition hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-start">
              {t("dashboard.topbar.searchPlaceholder")}
            </span>
            <kbd className="rounded border border-border-primary px-1.5 py-0.5 text-dash-caption text-content-tertiary">
              ⌘K
            </kbd>
          </button>
          {searchOpen && (
            <div className="absolute inset-e-0 top-12 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-primary bg-surface-secondary p-2 shadow-elevation-3">
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
                    <span>{t(msgKey(`dashboard.sidebar.${item.key}`))}</span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-3 text-dash-caption text-content-tertiary">
                  {t("dashboard.topbar.noSearchResults")}
                </p>
              )}
            </div>
          )}
        </div>
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-expanded={notificationsOpen}
            aria-label={t("dashboard.topbar.notifications")}
            className="relative inline-flex size-10 items-center justify-center rounded-control text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Bell className="size-5" aria-hidden="true" />
          </button>
          {notificationsOpen && (
            <div className="absolute inset-e-0 top-12 z-50 w-56 rounded-card border border-border-primary bg-surface-secondary p-4 text-dash-caption text-content-secondary shadow-elevation-3">
              {t("dashboard.topbar.noNotifications")}
            </div>
          )}
        </div>
        <span className="h-6 w-px bg-border-primary" aria-hidden="true" />
        <LocaleSwitcher />
        <span className="h-6 w-px bg-border-primary" aria-hidden="true" />
        <ProfileControl
          user={user}
          loggingOut={loggingOut}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
