"use client";

import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useUsers } from "./users-context";

export function UsersHeader() {
  const t = useTranslations();
  const { data, canWrite, setAddOpen, setAddError } = useUsers();

  return (
    <header className="grid gap-5 rounded-panel border border-border-primary bg-surface-secondary p-6 shadow-elevation-2 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
      <div>
        <div className="mb-3 flex items-center gap-3 text-dash-caption font-bold uppercase tracking-[0.14em] text-copper-strong">
          <span className="size-2 rounded-full bg-copper" aria-hidden="true" />
          <span>{t("users.eyebrow")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-dash-display font-bold tracking-tight text-accent">
            {t("users.heading")}
          </h1>
          <span className="inline-flex items-center rounded-pill border border-border-primary bg-surface-tertiary px-3 py-1 text-dash-caption font-bold text-content-secondary">
            {data.total} {t("users.resultsLabel")}
          </span>
        </div>
        <p className="mt-2 max-w-2xl text-dash-body-sm text-content-secondary">
          {t("users.description")}
        </p>
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-border-primary pt-5 lg:border-s-2 lg:border-t-0 lg:ps-7 lg:pt-0">
        <div>
          <p className="text-dash-title font-bold text-accent">
            {data.items.filter((item) => item.isActive && !item.isBanned)
              .length}
          </p>
          <p className="text-dash-caption text-content-tertiary">
            {t("users.activeCount", {
              active: data.items.filter(
                (item) => item.isActive && !item.isBanned,
              ).length,
              total: data.items.length,
            })}
          </p>
        </div>
        <div className="text-end">
          <p className="text-dash-caption font-semibold text-copper-strong">
            {t("users.syncStatus")}
          </p>
          {canWrite && (
            <button
              type="button"
              onClick={() => {
                setAddError(null);
                setAddOpen(true);
              }}
              className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <UserPlus className="size-4" aria-hidden="true" />
              {t("users.add")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
