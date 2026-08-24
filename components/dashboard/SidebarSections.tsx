"use client";

import { ExternalLink, Loader2, LogOut } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { LucideIcon } from "lucide-react";
import { initials } from "@/lib/utils";
import { msgKey, type TranslateFn } from "@/src/i18n/message-key";

type Translate = TranslateFn;
export type SidebarNavItem = { key: string; href: string; icon: LucideIcon };

export function SidebarNavSection({
  items,
  isCollapsed,
  onNavigate,
  isActive,
  t,
}: {
  items: SidebarNavItem[];
  isCollapsed: boolean;
  onNavigate: () => void;
  isActive: (href: string) => boolean;
  t: Translate;
}) {
  const linkClass = (href: string) =>
    `group flex items-center gap-3 min-h-11 rounded-control text-dash-body-sm font-semibold no-underline transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isCollapsed ? "justify-center px-0 mx-1" : "px-4"} ${isActive(href) ? "border-s-2 border-accent bg-accent text-content-contrast shadow-elevation-1" : "text-content-secondary hover:bg-surface-tertiary hover:text-accent"}`;
  return (
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
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive(item.href) ? "page" : undefined}
            aria-label={
              isCollapsed
                ? t(msgKey(`dashboard.sidebar.${item.key}`))
                : undefined
            }
            title={
              isCollapsed
                ? t(msgKey(`dashboard.sidebar.${item.key}`))
                : undefined
            }
            className={linkClass(item.href)}
          >
            <item.icon
              className="size-6 shrink-0"
              strokeWidth={2}
              aria-hidden="true"
            />
            {!isCollapsed && (
              <span className="truncate">
                {t(msgKey(`dashboard.sidebar.${item.key}`))}
              </span>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-6 border-t border-border-primary pt-5">
        {!isCollapsed && (
          <p className="px-4 pb-3 text-dash-caption font-bold uppercase tracking-[0.16em] text-content-tertiary">
            {t("dashboard.sidebar.workspace")}
          </p>
        )}
        <Link
          href="/"
          onClick={onNavigate}
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center gap-3 min-h-11 rounded-control text-dash-body-sm font-semibold no-underline transition-all duration-200 text-content-secondary hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${isCollapsed ? "justify-center px-0 mx-1" : "px-4"}`}
          aria-label={isCollapsed ? t("dashboard.sidebar.viewSite") : undefined}
          title={isCollapsed ? t("dashboard.sidebar.viewSite") : undefined}
        >
          <ExternalLink
            className="w-5 h-5 shrink-0 rtl-mirror"
            strokeWidth={2}
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span className="truncate">{t("dashboard.sidebar.viewSite")}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export function SidebarUserSection({
  user,
  isCollapsed,
  loggingOut,
  onLogout,
  t,
}: {
  user: AuthUser;
  isCollapsed: boolean;
  loggingOut: boolean;
  onLogout: () => void;
  t: Translate;
}) {
  return (
    <div
      className={`shrink-0 rounded-card border border-border-primary bg-surface-tertiary/30 ${isCollapsed ? "mx-2 mb-3 flex flex-col items-center p-2" : "m-3 p-3 pt-4"}`}
    >
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
            <p className="text-dash-body-sm font-bold text-accent truncate">
              {user.fullName}
            </p>
            <p
              className="text-dash-caption text-content-tertiary truncate"
              dir="ltr"
            >
              {user.email}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        aria-label={isCollapsed ? t("dashboard.sidebar.logout") : undefined}
        title={isCollapsed ? t("dashboard.sidebar.logout") : undefined}
        className={`mt-2 flex items-center justify-center gap-2 text-dash-body-sm font-bold text-accent border border-border-interactive bg-transparent transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 ${isCollapsed ? "size-10 rounded-pill px-0" : "min-h-11 w-full rounded-control px-4 py-2"}`}
      >
        {loggingOut ? (
          <>
            <Loader2
              className="w-4 h-4 animate-spin rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
            {!isCollapsed && <span>{t("dashboard.sidebar.loggingOut")}</span>}
          </>
        ) : (
          <>
            <LogOut
              className="w-4 h-4 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
            {!isCollapsed && <span>{t("dashboard.sidebar.logout")}</span>}
          </>
        )}
      </button>
    </div>
  );
}
