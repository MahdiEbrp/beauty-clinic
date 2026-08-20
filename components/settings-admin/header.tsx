"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { ArrowLeft, Plus, Settings as SettingsIcon } from "lucide-react";
import { useSettings } from "./settings-context";
import type { AuthUser } from "@/lib/auth/dal";

export function SettingsHeader() {
  const t = useTranslations();
  const { data, canWrite } = useSettings();
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
        <span>{t("settingsAdmin.back")}</span>
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("settingsAdmin.heading")}
          </h1>
          <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
            {data.total} {t("settingsAdmin.resultsLabel")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings/social"
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <SettingsIcon className="size-4" aria-hidden="true" />
            {t("settingsAdmin.socialLinks")}
          </Link>
          {canWrite && (
            <Link
              href="/dashboard/settings/add"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("settingsAdmin.add")}
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}