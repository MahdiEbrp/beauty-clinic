"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useGroups } from "./groups-context";

export function GroupsHeader() {
  const t = useTranslations();
  const { data, canWrite } = useGroups();

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/services"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
        <span>{t("servicesManage.back")}</span>
      </Link>
      <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("serviceGroups.heading")}
          </h1>
          <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
            {data.total} {t("serviceGroups.resultsLabel")}
          </span>
        </div>
        {canWrite && (
          <Link
            href="/dashboard/services/manage/groups/add"
            className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("serviceGroups.add")}
          </Link>
        )}
      </header>
    </div>
  );
}
