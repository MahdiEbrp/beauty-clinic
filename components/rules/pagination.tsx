"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useRules } from "./rules-context";

export function RulesPagination() {
  const t = useTranslations();
  const { data, page, setPage, from, to, totalPages, clearSelection } = useRules();
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-primary px-6 py-4">
      <p className="text-dash-body-sm text-content-tertiary">
        {t("dashboardRules.pagination.showing", { from, to, total: data.total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => {
            clearSelection();
            setPage((p) => Math.max(1, p - 1));
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-dash-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
          <span>{t("dashboardRules.pagination.previous")}</span>
        </button>
        <span className="text-dash-body-sm text-content-secondary px-2 whitespace-nowrap">
          {t("dashboardRules.pagination.pageInfo", { page, totalPages })}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => {
            clearSelection();
            setPage((p) => Math.min(totalPages, p + 1));
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-dash-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span>{t("dashboardRules.pagination.next")}</span>
          <ChevronRight className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
