"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import {
  Wind,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import LocaleSwitcher from "./LocaleSwitcher";

const MENU_ID = "dashboard-sidebar-menu";
const COLLAPSED_KEY = "dashboard.sidebar.collapsed";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function DashboardShell({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const canViewUsers = user.permissions.includes("users.read");

  const navItems = [
    { key: "overview", href: "/dashboard", icon: LayoutDashboard },
    ...(canViewUsers ? [{ key: "users", href: "/dashboard/users", icon: Users }] : []),
  ];

  useEffect(() => {
    // Restore the persisted collapsed preference after mount — reading
    // localStorage during render would mismatch the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setCollapsed(typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1");
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // Storage unavailable (private mode) — the preference just won't persist.
    }
  }, [collapsed]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("logout_failed");
      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const navLinkClass = (href: string) =>
    `group flex items-center gap-3 min-h-11 rounded-control text-body-sm font-semibold no-underline transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      collapsed ? "justify-center px-0 mx-1" : "px-4"
    } ${
      isActive(href)
        ? "border-s-2 border-accent bg-accent-subtle text-accent shadow-elevation-1"
        : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
    }`;

  const navSection = (
    <nav
      className="flex-1 overflow-y-auto px-3 py-4"
      aria-label={t("dashboard.sidebar.navLabel")}
    >
      {!collapsed && (
        <p className="px-4 pb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-content-tertiary">
          {t("dashboard.sidebar.navigation")}
        </p>
      )}
      <div className="space-y-1">
        {navItems.map((item) => {
          const label = t(`dashboard.sidebar.${item.key}`);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              aria-label={collapsed ? label : undefined}
              title={collapsed ? label : undefined}
              className={navLinkClass(item.href)}
            >
              <item.icon className="w-5 h-5 shrink-0" strokeWidth={2} aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-border-primary pt-5">
        {!collapsed && (
          <p className="px-4 pb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-content-tertiary">
            {t("dashboard.sidebar.workspace")}
          </p>
        )}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className={`group flex items-center gap-3 min-h-11 rounded-control text-body-sm font-semibold no-underline transition-all duration-200 text-content-secondary hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            collapsed ? "justify-center px-0 mx-1" : "px-4"
          }`}
          aria-label={collapsed ? t("dashboard.sidebar.viewSite") : undefined}
          title={collapsed ? t("dashboard.sidebar.viewSite") : undefined}
        >
          <ExternalLink
            className="w-5 h-5 shrink-0 rtl-mirror"
            strokeWidth={2}
            aria-hidden="true"
          />
          {!collapsed && <span className="truncate">{t("dashboard.sidebar.viewSite")}</span>}
        </Link>
      </div>
    </nav>
  );

  const userSection = (
    <div className="m-3 shrink-0 rounded-card border border-border-primary bg-surface-tertiary/30 p-3 pt-4">
      {!collapsed && (
        <p className="px-2 pb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-content-tertiary">
          {t("dashboard.sidebar.account")}
        </p>
      )}
      <div
        className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <span
          className="w-10 h-10 shrink-0 rounded-pill bg-copper text-content-contrast flex items-center justify-center text-body-sm font-bold"
          aria-hidden="true"
        >
          {initials(user.fullName)}
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-body-sm font-bold text-accent truncate">{user.fullName}</p>
            <p className="text-caption text-content-tertiary truncate" dir="ltr">
              {user.email}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        aria-label={collapsed ? t("dashboard.sidebar.logout") : undefined}
        title={collapsed ? t("dashboard.sidebar.logout") : undefined}
          className={`mt-2 flex items-center gap-2 w-full min-h-11 px-4 py-2 rounded-control text-body-sm font-bold text-accent border border-border-interactive bg-transparent transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        {loggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin rtl-mirror" strokeWidth={2} aria-hidden="true" />
            {!collapsed && <span>{t("dashboard.sidebar.loggingOut")}</span>}
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            {!collapsed && <span>{t("dashboard.sidebar.logout")}</span>}
          </>
        )}
      </button>
    </div>
  );

  const brandLink = (
    <Link
      href="/"
      className={`flex items-center gap-2 min-h-16 border-b border-border-primary text-accent no-underline transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        collapsed ? "justify-center px-0" : "px-5"
      }`}
      aria-label={collapsed ? t("site.name") : undefined}
      title={collapsed ? t("site.name") : undefined}
    >
      <Wind className="w-6 h-6 text-copper shrink-0" strokeWidth={2} aria-hidden="true" />
      {!collapsed && <span className="text-lg font-black truncate">{t("site.name")}</span>}
    </Link>
  );

  const desktopSidebar = (
    <aside
      className={`hidden lg:flex fixed top-0 bottom-0 inset-s-0 z-40 flex-col bg-surface-secondary border-e border-border-primary transition-[width] duration-300 ease-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {brandLink}
      {navSection}
      {userSection}
    </aside>
  );

  const desktopToolbar = (
    <div className="hidden h-16 items-center justify-end gap-2 border-b border-border-primary bg-surface-primary/90 px-8 backdrop-blur-md lg:flex xl:px-10">
      <LocaleSwitcher />
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? t("dashboard.sidebar.expand") : t("dashboard.sidebar.collapse")}
        title={collapsed ? t("dashboard.sidebar.expand") : t("dashboard.sidebar.collapse")}
        className="inline-flex size-11 items-center justify-center rounded-pill border border-border-interactive bg-transparent text-accent transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {collapsed ? (
          <Menu className="size-5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <X className="size-5" strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );

  const mobileHeader = (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 h-16 bg-surface-secondary/90 backdrop-blur-md border-b border-border-primary">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-accent no-underline min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Wind className="w-6 h-6 text-copper shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="text-lg font-black truncate">{t("site.name")}</span>
      </Link>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/"
          aria-label={t("dashboard.sidebar.viewSite")}
          title={t("dashboard.sidebar.viewSite")}
          className="inline-flex items-center justify-center w-11 h-11 rounded-pill text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ExternalLink className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
        </Link>
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? t("dashboard.sidebar.closeMenu") : t("dashboard.sidebar.openMenu")}
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          className="inline-flex items-center justify-center w-11 h-11 rounded-pill text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {menuOpen ? (
            <X className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );

  const mobileDrawer = menuOpen && (
    <div className="lg:hidden fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-accent-hover/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id={MENU_ID}
        className="absolute top-0 bottom-0 inset-s-0 w-72 max-w-[85%] bg-surface-secondary shadow-elevation-4 flex flex-col ltr:animate-drawer-in rtl:animate-drawer-in-rtl"
      >
        <div className="flex items-center justify-between min-h-16 px-5 border-b border-border-primary shrink-0">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Wind className="w-6 h-6 text-copper" strokeWidth={2} aria-hidden="true" />
            <span className="text-lg font-black truncate">{t("site.name")}</span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <LocaleSwitcher compact />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t("dashboard.sidebar.closeMenu")}
              className="inline-flex items-center justify-center w-11 h-11 rounded-pill text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
        {navSection}
        {userSection}
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-surface-primary">
      {desktopSidebar}
      {mobileHeader}
      {mobileDrawer}

      {/* Content */}
      <main
        id="main"
        className={`transition-[padding] duration-300 ease-out ${collapsed ? "lg:ps-20" : "lg:ps-64"}`}
      >
        {desktopToolbar}
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
