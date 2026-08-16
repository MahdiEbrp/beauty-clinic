"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useRules } from "./rules-context";

export function RulesHeader() {
  const t = useTranslations();
  const { data, canWrite } = useRules();

  return (
    <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
          {t("dashboardRules.heading")}
        </h1>
        <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
          {data.total} {t("dashboardRules.resultsLabel")}
        </span>
      </div>
      {canWrite && (
        <Link
          href="/dashboard/rules/add"
          className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t("dashboardRules.add")}
        </Link>
      )}
    </header>
  );
}
