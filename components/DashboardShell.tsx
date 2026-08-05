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
  Search,
  Bell,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import LocaleSwitcher from "./LocaleSwitcher";

const MENU_ID = "dashboard-sidebar-menu";
const SIDEBAR_MODE_KEY = "dashboard.sidebar.mode";
type SidebarMode = "expanded" | "collapsed";

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
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("expanded");
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const collapsed = sidebarMode === "collapsed";

  const canViewUsers = user.permissions.includes("users.read");

  const navItems = [
    { key: "overview", href: "/dashboard", icon: LayoutDashboard },
    ...(canViewUsers ? [{ key: "users", href: "/dashboard/users", icon: Users }] : []),
  ];

  useEffect(() => {
    // Restore the persisted collapsed preference after mount — reading
    // localStorage during render would mismatch the server HTML.
    const stored = window.localStorage.getItem(SIDEBAR_MODE_KEY);
    // Keep the previous boolean preference compatible with the three-state model.
    const restoredMode: SidebarMode = stored === "1" || stored === "collapsed" ? "collapsed" : "expanded";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
    setSidebarMode(restoredMode);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_MODE_KEY, sidebarMode);
    } catch {
      // Storage unavailable (private mode) — the preference just won't persist.
    }
  }, [sidebarMode]);

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

  useEffect(() => {
    if (!profileOpen && !notificationsOpen && !searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
        setSearchOpen(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
      if (!notificationsRef.current?.contains(target)) setNotificationsOpen(false);
      if (!searchRef.current?.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [profileOpen, notificationsOpen, searchOpen]);

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

  const navLinkClass = (href: string, isCollapsed = collapsed) =>
    `group flex items-center gap-3 min-h-11 rounded-control text-dash-body-sm font-semibold no-underline transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isCollapsed ? "justify-center px-0 mx-1" : "px-4"
    } ${isActive(href)
      ? "border-s-2 border-accent bg-accent text-content-contrast shadow-elevation-1"
      : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"
    }`;

  const navSection = (isCollapsed = collapsed) => (
    <nav
      className="flex-1 overflow-y-auto px-3 py-4"
      aria-label={t("dashboard.sidebar.navLabel")}
    >
      {!isCollapsed && (
        <p className="px-4 pb-3 text-dash-caption font-bold uppercase tracking-[0.16em] text-content-tertiary">
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
              aria-label={isCollapsed ? label : undefined}
              title={isCollapsed ? label : undefined}
              className={navLinkClass(item.href, isCollapsed)}
            >
              <item.icon className="size-6 shrink-0" strokeWidth={2} aria-hidden="true" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 border-t border-border-primary pt-5">
        {!isCollapsed && (
          <p className="px-4 pb-3 text-dash-caption font-bold uppercase tracking-[0.16em] text-content-tertiary">
            {t("dashboard.sidebar.workspace")}
          </p>
        )}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center gap-3 min-h-11 rounded-control text-dash-body-sm font-semibold no-underline transition-all duration-200 text-content-secondary hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isCollapsed ? "justify-center px-0 mx-1" : "px-4"
            }`}
          aria-label={isCollapsed ? t("dashboard.sidebar.viewSite") : undefined}
          title={isCollapsed ? t("dashboard.sidebar.viewSite") : undefined}
        >
          <ExternalLink
            className="w-5 h-5 shrink-0 rtl-mirror"
            strokeWidth={2}
            aria-hidden="true"
          />
          {!isCollapsed && <span className="truncate">{t("dashboard.sidebar.viewSite")}</span>}
        </Link>
      </div>
    </nav>
  );

  const userSection = (isCollapsed = collapsed) => (
    <div className={`shrink-0 rounded-card border border-border-primary bg-surface-tertiary/30 ${isCollapsed ? "mx-2 mb-3 flex flex-col items-center p-2" : "m-3 p-3 pt-4"}`}>
      {!isCollapsed && (
        <p className="px-2 pb-3 text-dash-caption font-bold uppercase tracking-[0.16em] text-content-tertiary">
          {t("dashboard.sidebar.account")}
        </p>
      )}
      <div
        className={`flex items-center gap-3 ${isCollapsed ? "justify-center px-0 py-1" : "px-2 py-2"}`}
      >
        <span
          className="w-10 h-10 shrink-0 rounded-pill bg-copper text-content-contrast flex items-center justify-center text-dash-body-sm font-bold"
          aria-hidden="true"
        >
          {initials(user.fullName)}
        </span>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-dash-body-sm font-bold text-accent truncate">{user.fullName}</p>
            <p className="text-dash-caption text-content-tertiary truncate" dir="ltr">
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
        aria-label={isCollapsed ? t("dashboard.sidebar.logout") : undefined}
        title={isCollapsed ? t("dashboard.sidebar.logout") : undefined}
        className={`mt-2 flex items-center justify-center gap-2 text-dash-body-sm font-bold text-accent border border-border-interactive bg-transparent transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 ${isCollapsed ? "size-10 rounded-pill px-0" : "min-h-11 w-full rounded-control px-4 py-2"}`}
      >
        {loggingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin rtl-mirror" strokeWidth={2} aria-hidden="true" />
            {!isCollapsed && <span>{t("dashboard.sidebar.loggingOut")}</span>}
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            {!isCollapsed && <span>{t("dashboard.sidebar.logout")}</span>}
          </>
        )}
      </button>
    </div>
  );

  const brandLink = (
    <Link
      href="/"
      className={`flex items-center gap-2 min-h-16 border-b border-border-primary text-accent no-underline transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${collapsed ? "justify-center px-0" : "px-5"
        }`}
      aria-label={collapsed ? t("site.name") : undefined}
      title={collapsed ? t("site.name") : undefined}
    >
      <Wind className="w-6 h-6 text-copper shrink-0" strokeWidth={2} aria-hidden="true" />
      {!collapsed && <span className="text-dash-title font-black truncate">{t("site.name")}</span>}
    </Link>
  );

  const desktopSidebar = (
    <aside
      className={`hidden lg:flex fixed top-0 bottom-0 inset-s-0 z-40 flex-col border-e border-border-primary bg-surface-secondary transition-[width] duration-200 ease-out ${collapsed ? "w-18" : "w-70"}`}
    >
      {brandLink}
      {navSection()}
      {userSection()}
    </aside>
  );

  const toggleSidebar = () => {
    setSidebarMode((mode) => mode === "expanded" ? "collapsed" : "expanded");
  };

  const profileMenu = profileOpen && (
    <div className="absolute inset-e-0 top-12 z-50 w-64 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-primary bg-surface-secondary p-2 shadow-elevation-3">
      <div className="border-b border-border-primary px-3 pb-3 pt-2">
        <p className="truncate text-dash-body-sm font-bold text-accent">{user.fullName}</p>
        <p className="mt-1 truncate text-dash-caption text-content-tertiary" dir="ltr">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-control px-3 text-start text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
      >
        {loggingOut ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
        <span>{loggingOut ? t("dashboard.sidebar.loggingOut") : t("dashboard.sidebar.logout")}</span>
      </button>
    </div>
  );

  const profileControl = (
    <div ref={profileRef} className="relative">
      <button
        type="button"
        onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }}
        aria-expanded={profileOpen}
        aria-haspopup="menu"
        aria-label={t("dashboard.topbar.openProfile")}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border-primary bg-accent-subtle text-dash-caption font-bold text-accent shadow-elevation-1 transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {initials(user.fullName)}
      </button>
      {profileMenu}
    </div>
  );

  const searchResults = navItems.filter((item) => {
    const label = t(`dashboard.sidebar.${item.key}`);
    const query = searchTerm.trim().toLocaleLowerCase();
    return !query || label.toLocaleLowerCase().includes(query);
  });

  const searchResultsPanel = (
    <div className="absolute inset-e-0 top-12 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-card border border-border-primary bg-surface-secondary p-2 shadow-elevation-3">
      <p className="px-3 pb-2 pt-1 text-dash-caption text-content-tertiary">{t("dashboard.topbar.searchResults")}</p>
      {searchResults.length > 0 ? searchResults.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          onClick={() => { setSearchOpen(false); setSearchTerm(""); }}
          className="flex min-h-11 items-center gap-3 rounded-control px-3 text-dash-body-sm font-semibold text-content-secondary no-underline transition hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <item.icon className="size-4" aria-hidden="true" />
          <span>{t(`dashboard.sidebar.${item.key}`)}</span>
        </Link>
      )) : (
        <p className="px-3 py-3 text-dash-caption text-content-tertiary">{t("dashboard.topbar.noSearchResults")}</p>
      )}
    </div>
  );

  const desktopSearch = (
    <div ref={searchRef} className="relative hidden xl:block">
      <button
        type="button"
        onClick={() => { setSearchOpen((open) => !open); setProfileOpen(false); setNotificationsOpen(false); }}
        aria-expanded={searchOpen}
        aria-haspopup="listbox"
        className="flex h-10 w-72 items-center gap-2 rounded-control border border-border-primary bg-surface-primary px-3 text-dash-body-sm text-content-tertiary transition hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-start">{t("dashboard.topbar.searchPlaceholder")}</span>
        <kbd className="rounded border border-border-primary px-1.5 py-0.5 text-dash-caption text-content-tertiary">⌘K</kbd>
      </button>
      {searchOpen && searchResultsPanel}
    </div>
  );

  const desktopToolbar = (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border-primary bg-surface-secondary px-6 lg:flex xl:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarMode === "expanded" ? t("dashboard.sidebar.collapse") : t("dashboard.sidebar.expand")}
          title={sidebarMode === "expanded" ? t("dashboard.sidebar.collapse") : t("dashboard.sidebar.expand")}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-control text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {sidebarMode === "expanded" ? <PanelRightClose className="size-5" aria-hidden="true" /> : <PanelRightOpen className="size-5" aria-hidden="true" />}
        </button>
        <span className="h-6 w-px bg-border-primary" aria-hidden="true" />
        <nav aria-label={t("dashboard.topbar.breadcrumbLabel")} className="flex min-w-0 items-center gap-2 text-dash-body-sm">
          <span className="truncate text-content-tertiary">{t("dashboard.topbar.access")}</span>
          <ChevronLeft className="size-4 shrink-0 text-content-tertiary rtl-mirror" aria-hidden="true" />
          <span className="truncate font-bold text-content-primary">
            {pathname.startsWith("/dashboard/users") ? t("users.heading") : t("dashboard.topbar.dashboard")}
          </span>
        </nav>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {desktopSearch}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }}
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
        {profileControl}
      </div>
    </header>
  );

  const mobileProfileControl = profileControl;

  const mobileToolbar = (
    <div className="flex items-center gap-1">
      {mobileProfileControl}
      <button
        type="button"
        onClick={() => { setSearchOpen(true); setProfileOpen(false); }}
        aria-label={t("dashboard.topbar.search")}
        className="inline-flex size-10 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? t("dashboard.sidebar.closeMenu") : t("dashboard.sidebar.openMenu")}
        aria-expanded={menuOpen}
        aria-controls={MENU_ID}
        className="inline-flex size-10 items-center justify-center rounded-control text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>
      {searchOpen && (
        <div className="fixed inset-0 z-60 bg-surface-primary p-4 sm:p-6">
          <div ref={searchRef} className="relative mx-auto max-w-xl">
            <div className="flex h-12 items-center gap-3 rounded-control border border-border-interactive bg-surface-secondary px-4">
              <Search className="size-5 text-content-tertiary" aria-hidden="true" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("dashboard.topbar.searchPlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-dash-body text-accent outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label={t("dashboard.sidebar.closeMenu")} className="text-content-tertiary hover:text-accent">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative mt-3 min-h-24 rounded-card border border-border-primary bg-surface-secondary p-2">
              {searchResultsPanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const mobileHeader = (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-4 h-16 bg-surface-secondary/90 backdrop-blur-md border-b border-border-primary">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-accent no-underline min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Wind className="w-6 h-6 text-copper shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="text-dash-body font-black">{t("site.shortName")}</span>
      </Link>
      {mobileToolbar}
    </header>
  );

  const mobileDrawer = (
    <div className={`lg:hidden fixed inset-0 z-50 transition-[visibility] duration-200 ${menuOpen ? "visible" : "invisible pointer-events-none"}`} aria-hidden={!menuOpen}>
      <div
        className={`absolute inset-0 bg-accent-hover/50 backdrop-blur-sm transition-opacity duration-200 ease-out ${menuOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id={MENU_ID}
        className={`absolute top-0 bottom-0 inset-s-0 flex w-72 max-w-[85%] flex-col bg-surface-secondary shadow-elevation-4 transition-transform duration-200 ease-out ${menuOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"}`}
      >
        <div className="flex items-center justify-between min-h-16 px-5 border-b border-border-primary shrink-0">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-accent no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Wind className="w-6 h-6 text-copper" strokeWidth={2} aria-hidden="true" />
            <span className="text-dash-title font-black truncate">{t("site.name")}</span>
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
        {navSection(false)}
        {userSection(false)}
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
      className={`transition-[padding] duration-300 ease-out ${collapsed ? "lg:ps-18" : "lg:ps-70"}`}
      >
        {desktopToolbar}
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
