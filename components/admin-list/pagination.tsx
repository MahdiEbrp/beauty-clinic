"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminListContext } from "./context";

export function AdminListPagination<T extends { id: string }>() {
  const t = useTranslations();
  const ctx = useAdminListContext<T>();
  const { config, page, setPage, totalPages, from, to, data } = ctx;
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    const target = Math.max(1, Math.min(totalPages, next));
    if (target !== page) {
      setPage(target);
    }
  };

  return (
    <nav
      aria-label={t(`${config.namespace}.pagination.pageInfo`, { page, totalPages })}
      className="flex items-center justify-between gap-2 border-t border-border-primary px-4 py-3 text-dash-body-sm sm:px-6"
    >
      <div className="text-dash-caption text-content-secondary">
        {t(`${config.namespace}.pagination.showing`, { from, to, total: data.total })}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-pill border border-border-interactive bg-surface-secondary px-3 text-accent transition hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronRight className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
          {t(`${config.namespace}.pagination.previous`)}
        </button>
        <span className="px-1 text-dash-caption text-content-tertiary">
          {t(`${config.namespace}.pagination.pageInfo`, { page, totalPages })}
        </span>
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex min-h-9 items-center justify-center gap-1 rounded-pill border border-border-interactive bg-surface-secondary px-3 text-accent transition hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t(`${config.namespace}.pagination.next`)}
          <ChevronLeft className="size-4 rtl-mirror rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
