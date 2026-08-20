"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Link,
  usePathname,
  useRouter,
} from "@/src/i18n/navigation";
import { LayoutDashboard, Sparkles, Users, Files, Shield, LayoutTemplate, Settings } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import type { AuthUser } from "@/lib/auth/dal";
import type { SidebarNavItem } from "@/components/dashboard/SidebarSections";
import {
  SidebarNavSection,
  SidebarUserSection,
} from "@/components/dashboard/SidebarSections";
import { Topbar } from "@/components/dashboard/Topbar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

const SIDEBAR_MODE_KEY = "dashboard.sidebar.mode";
type SidebarMode = "expanded" | "collapsed";

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

  const collapsed = sidebarMode === "collapsed";

  const canViewUsers = user.permissions.includes("users.read");
  const canViewFiles = user.permissions.includes("files.read");
  const canViewServices = user.permissions.includes("services.read");
  const canViewRules = user.permissions.includes("rules.read");
  const canViewSettings = user.permissions.includes("settings.read");

  const navItems: SidebarNavItem[] = [
    { key: "overview", href: "/dashboard", icon: LayoutDashboard },
    ...(canViewServices
      ? [
          { key: "services", href: "/dashboard/services", icon: Sparkles },
          { key: "landing", href: "/dashboard/landing", icon: LayoutTemplate },
        ]
      : []),
    ...(canViewRules
      ? [{ key: "rules", href: "/dashboard/rules", icon: Shield }]
      : []),
    ...(canViewUsers ? [{ key: "users", href: "/dashboard/users", icon: Users }] : []),
    ...(canViewFiles ? [{ key: "files", href: "/dashboard/files", icon: Files }] : []),
    ...(canViewSettings
      ? [{ key: "settings", href: "/dashboard/settings", icon: Settings }]
      : []),
  ];

  useEffect(() => {
    // Restore the persisted collapsed preference after mount — reading
    // localStorage during render would mismatch the server HTML.
    const stored = window.localStorage.getItem(SIDEBAR_MODE_KEY);
    // Keep the previous boolean preference compatible with the three-state model.
    const restoredMode: SidebarMode =
      stored === "1" || stored === "collapsed" ? "collapsed" : "expanded";
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
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const brandLink = (
    <Link
      href="/"
      className={`flex items-center gap-2 min-h-16 border-b border-border-primary text-accent no-underline transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        collapsed ? "justify-center px-0" : "px-5"
      }`}
      aria-label={collapsed ? t("site.name") : undefined}
      title={collapsed ? t("site.name") : undefined}
    >
      <BrandLogo alt={t("site.name")} className={collapsed ? "w-8 h-auto" : "h-8"} />
      {!collapsed && (
        <span className="text-dash-title font-black truncate">
          {t("site.name")}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-dvh bg-surface-tertiary">
      <aside
        className={`hidden lg:flex fixed top-0 bottom-0 inset-s-0 z-40 flex-col border-e border-border-primary bg-surface-secondary transition-[width] duration-200 ease-out ${
          collapsed ? "w-18" : "w-70"
        }`}
      >
        {brandLink}
        <SidebarNavSection
          items={navItems}
          isCollapsed={collapsed}
          onNavigate={() => setMenuOpen(false)}
          isActive={isActive}
          t={t}
        />
        <SidebarUserSection
          user={user}
          isCollapsed={collapsed}
          loggingOut={loggingOut}
          onLogout={() => void handleLogout()}
          t={t}
        />
      </aside>

      <MobileHeader
        menuOpen={menuOpen}
        onToggleMenu={setMenuOpen}
        user={user}
        loggingOut={loggingOut}
        onLogout={() => void handleLogout()}
        navItems={navItems}
        isActive={isActive}
      />

      {/* Content */}
      <main
        id="main"
        className={`transition-[padding] duration-300 ease-out ${
          collapsed ? "lg:ps-18" : "lg:ps-70"
        }`}
      >
        <Topbar
          sidebarMode={sidebarMode}
          onToggleSidebar={() =>
            setSidebarMode((mode) =>
              mode === "expanded" ? "collapsed" : "expanded",
            )
          }
          pathname={pathname}
          user={user}
          loggingOut={loggingOut}
          onLogout={() => void handleLogout()}
          navItems={navItems}
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
