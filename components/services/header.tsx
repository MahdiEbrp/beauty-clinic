"use client";

import { useTranslations } from "next-intl";
import { Sparkles, Plus } from "lucide-react";
import { useServices } from "./services-context";

export function ServicesHeader() {
  const t = useTranslations();
  const { data, summary, canWrite, openCreateService } = useServices();

  return (
    <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-copper-strong"
          aria-hidden="true"
        >
          <Sparkles className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t("servicesCatalog.heading")}
          </h1>
          <p className="truncate text-dash-caption text-content-tertiary">
            {t("servicesCatalog.summary", {
              groups: summary.groups.length,
              categories: summary.categories.length,
              services: summary.totalServices,
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden text-dash-caption font-bold text-content-tertiary md:inline">
          {data.total} {t("servicesCatalog.resultsLabel")}
        </span>
        {canWrite && (
          <button
            type="button"
            onClick={openCreateService}
            className="hidden min-h-11 shrink-0 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("servicesCatalog.add")}
          </button>
        )}
      </div>
    </header>
  );
}
