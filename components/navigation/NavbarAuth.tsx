"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { LogOut } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join("");
}

export default function NavbarAuth({ user, onLogout }: { user: AuthUser | null; onLogout: () => void }) {
  const t = useTranslations();
  if (!user) {
    return <Link href="/login" className="inline-flex items-center gap-1.5 px-4 py-2 min-h-11 bg-accent text-content-contrast rounded-pill font-bold text-body-sm transition-all duration-300 hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95">{t("nav.login")}</Link>;
  }
  return (
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="inline-flex items-center gap-2.5 ps-2 pe-4 py-1.5 min-h-11 bg-surface-tertiary hover:bg-surface-primary border border-border-primary rounded-pill text-body-sm font-semibold text-accent no-underline transition-all duration-200 hover:border-border-interactive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <span className="w-8 h-8 shrink-0 rounded-pill bg-copper text-content-contrast flex items-center justify-center text-caption font-bold" aria-hidden="true">{initials(user.fullName)}</span>
        <span className="max-w-32 truncate">{user.fullName}</span>
      </Link>
      <button type="button" onClick={onLogout} aria-label={t("nav.logout")} title={t("nav.logout")} className="inline-flex items-center justify-center w-11 h-11 bg-transparent border border-border-interactive text-accent rounded-pill transition-all duration-200 hover:bg-surface-tertiary hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <LogOut className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{t("nav.logout")}</span>
      </button>
    </div>
  );
}
