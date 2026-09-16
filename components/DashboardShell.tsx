"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Link,
  usePathname,
  useRouter,
} from "@/src/i18n/navigation";
import { CalendarCheck, CalendarClock, CalendarRange, Clock, CreditCard, Files, HeartPulse, LayoutDashboard, LayoutTemplate, Mail, MessageSquareText, Settings, Shield, Sparkles, Users } from "lucide-react";
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
   const canViewCare = user.permissions.includes("care-guides.read");
   const canViewSettings = user.permissions.includes("settings.read");
   const canViewSms = user.permissions.includes("sms.read");
   const canViewEmail = user.permissions.includes("email.read");
   const canViewPayment = user.permissions.includes("payment.read");
   const canViewBookings = user.permissions.includes("appointments.read");

  // Sidebar items ordered by estimated frequency of use (most-used first).
  const navItems: SidebarNavItem[] = [
    // Home/dashboard — the page every user lands on, so it stays at the top.
    { key: "overview", href: "/dashboard", icon: LayoutDashboard },
    // Appointments are the daily operational core.
    ...(canViewBookings ? [{ key: "bookings", href: "/dashboard/bookings", icon: CalendarClock }] : []),
    // Everyone's own reservations — the customer panel, scoped to the caller.
    { key: "myReservations", href: "/dashboard/my-reservations", icon: CalendarCheck },
    // Payments & client management are the next most frequent daily tasks.
    ...(canViewPayment ? [{ key: "payment", href: "/dashboard/payment", icon: CreditCard }] : []),
    ...(canViewUsers ? [{ key: "users", href: "/dashboard/users", icon: Users }] : []),
    // Client communication happens throughout the day.
    ...(canViewSms ? [{ key: "sms", href: "/dashboard/sms", icon: MessageSquareText }] : []),
    ...(canViewEmail ? [{ key: "email", href: "/dashboard/email", icon: Mail }] : []),
    // Availability management — frequent but less than bookings.
    ...(canViewBookings
      ? [
          { key: "slots", href: "/dashboard/slots", icon: CalendarRange },
          { key: "workingHours", href: "/dashboard/working-hours", icon: Clock },
        ]
      : []),
    // Catalog & content maintenance — occasional, needs to be kept current.
    ...(canViewServices ? [{ key: "services", href: "/dashboard/services", icon: Sparkles }] : []),
    ...(canViewCare ? [{ key: "care", href: "/dashboard/care", icon: HeartPulse }] : []),
    ...(canViewFiles ? [{ key: "files", href: "/dashboard/files", icon: Files }] : []),
    // Landing-page editing is grouped with services behind the same permission.
    ...(canViewServices ? [{ key: "landing", href: "/dashboard/landing", icon: LayoutTemplate }] : []),
    // Configuration & rare maintenance tasks.
    ...(canViewSettings ? [{ key: "settings", href: "/dashboard/settings", icon: Settings }] : []),
    ...(canViewRules ? [{ key: "rules", href: "/dashboard/rules", icon: Shield }] : []),
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
