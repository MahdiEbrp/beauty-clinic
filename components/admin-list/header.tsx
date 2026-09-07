"use client";

import { useTranslations } from "next-intl";
import { asTranslate } from "@/src/i18n/message-key";
import { ArrowLeft, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { useAdminListContext } from "./context";

export function AdminListHeader<T extends { id: string }>() {
  const t = asTranslate(useTranslations());
    const ctx = useAdminListContext<T>();
  const { data, canWrite, canManage, config, selectionMode, toggleSelectionMode } = ctx;
  const action = config.headerAction;
  return (
    <div className="space-y-3">
      <Link
        href={config.backHref}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
        <span>{t("bookingAdmin.back")}</span>
      </Link>
      <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
            {t(`${config.namespace}.heading`)}
          </h1>
          <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
            {data.total} {t(`${config.namespace}.resultsLabel`, { count: data.total })}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canManage && action && (
            <button
              type="button"
              onClick={() => void action.onClick()}
              disabled={action.busy}
              className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive bg-surface-tertiary px-4 py-2.5 text-dash-body-sm font-bold text-accent transition hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 sm:inline-flex"
            >
              {action.busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : action.icon === "refresh" ? (
                <RefreshCw className="size-4" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              <span>{t(action.labelKey)}</span>
            </button>
          )}
          {canWrite && config.addHref && (
            <Link
              href={config.addHref}
              className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{t(`${config.namespace}.add`)}</span>
            </Link>
          )}
          {canManage && (
            <button
              type="button"
              onClick={toggleSelectionMode}
              className={`shrink-0 rounded-pill border px-4 py-2 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selectionMode ? "border-accent bg-accent text-content-contrast" : "border-border-interactive bg-surface-tertiary text-accent hover:bg-surface-tertiary/60"}`}
            >
              {t("bookingAdmin.select")}
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
