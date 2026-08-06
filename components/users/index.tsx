"use client";

import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListUsersResult } from "@/lib/users/service";
import { UsersProvider, useUsers } from "./users-context";
import { UsersHeader } from "./header";
import { UsersFilters } from "./filters";
import { UsersSelectionBar, UsersSelectFilteredRow } from "./selection";
import { UsersMobileCards } from "./mobile-cards";
import { UsersDesktopTable } from "./desktop-table";
import { UsersEmptyState } from "./empty-state";
import { UsersPagination } from "./pagination";
import { UsersDialogs } from "./dialogs";

function UsersErrorBanner() {
  const t = useTranslations();
  const { hasLoadFailed, load, debouncedSearch, status, role, page } =
    useUsers();

  if (!hasLoadFailed) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 bg-error/10 border border-error/40 rounded-control p-4"
    >
      <p className="text-dash-body-sm text-error font-medium">
        {t("users.error")}
      </p>
      <button
        type="button"
        onClick={() => load({ search: debouncedSearch, status, role, page })}
        className="inline-flex items-center gap-2 px-4 py-2 min-h-9 rounded-pill text-dash-body-sm font-bold text-error border border-error/40 hover:bg-error/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>{t("users.retry")}</span>
      </button>
    </div>
  );
}

function UsersTableSection() {
  const t = useTranslations();
  const { data, from, to, statusSummary, isLoading } = useUsers();

  return (
    <section
      className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
      aria-label={t("users.heading")}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border-primary bg-surface-secondary px-4 py-4 md:bg-surface-tertiary/20 md:px-6">
        <div>
          <p className="text-dash-body-sm font-bold text-accent">
            {t("users.heading")}
          </p>
          <p className="mt-1 text-dash-caption text-content-tertiary">
            {from}–{to} / {data.total}
          </p>
        </div>
        <span className="border-s border-border-interactive ps-3 text-dash-caption font-bold text-content-secondary">
          {statusSummary}
        </span>
      </div>
      <UsersSelectionBar />
      <UsersSelectFilteredRow />
      <UsersMobileCards />
      <UsersDesktopTable />
      <UsersEmptyState />
      <UsersPagination />
      {isLoading && (
        <p className="sr-only" role="status">
          {t("users.loading")}
        </p>
      )}
    </section>
  );
}

function UsersView() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <UsersHeader />
      <UsersFilters />
      <UsersErrorBanner />
      <UsersTableSection />
      <UsersDialogs />
    </div>
  );
}

export default function UsersContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListUsersResult;
}) {
  return (
    <UsersProvider user={user} initialData={initialData}>
      <UsersView />
    </UsersProvider>
  );
}
