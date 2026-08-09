"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, SquareCheckBig } from "lucide-react";
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
import { AddUserFab } from "./add-user-fab";

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
        onClick={() => void load({ search: debouncedSearch, status, role, page })}
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
  const { canManage, data, selectionMode, toggleSelectionMode, isLoading } =
    useUsers();

  return (
    <section
      className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
      aria-label={t("users.heading")}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border-primary bg-surface-secondary px-4 py-2.5 md:px-6">
        <p className="text-dash-caption text-content-tertiary">
          {t("users.syncStatus")}
        </p>
        {canManage && data.items.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectionMode}
            aria-pressed={selectionMode}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-pill border px-3 text-dash-caption font-bold transition-colors md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selectionMode
                ? "border-accent bg-accent text-content-contrast"
                : "border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"
            }`}
          >
            <SquareCheckBig className="size-4" aria-hidden="true" />
            {selectionMode ? t("users.done") : t("users.select")}
          </button>
        )}
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
    <div className="space-y-4 sm:space-y-6">
      <UsersHeader />
      <UsersFilters />
      <UsersErrorBanner />
      <UsersTableSection />
      <UsersDialogs />
      <AddUserFab />
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
