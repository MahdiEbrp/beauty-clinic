"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useCareGuides } from "./care-guides-context";

export function CareGuidesHeader() {
  const t = useTranslations();
  const { data, canWrite } = useCareGuides();

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/care"
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
        <span>{t("careManage.describe")}</span>
      </Link>
      <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("careGuides.heading")}
          </h1>
          <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
            {data.total} {t("careGuides.resultsLabel")}
          </span>
        </div>
        {canWrite && (
          <Link
            href="/dashboard/care/manage/guides/add"
            className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("careGuides.add")}
          </Link>
        )}
      </header>
    </div>
  );
}
