"use client";

import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import { useUsers } from "./users-context";

export function UsersHeader() {
  const t = useTranslations();
  const { data, canWrite, setAddOpen, setAddError } = useUsers();

  return (
    <header className="flex items-center justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary px-4 py-3 shadow-elevation-2 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-baseline gap-2.5">
        <h1 className="truncate text-dash-title font-bold tracking-tight text-accent">
          {t("users.heading")}
        </h1>
        <span className="shrink-0 text-dash-caption font-bold text-content-tertiary">
          {data.total} {t("users.resultsLabel")}
        </span>
      </div>
      {canWrite && (
        <button
          type="button"
          onClick={() => {
            setAddError(null);
            setAddOpen(true);
          }}
          className="hidden shrink-0 min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          {t("users.add")}
        </button>
      )}
    </header>
  );
}
