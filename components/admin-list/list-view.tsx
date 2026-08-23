"use client";

import type { AuthUser } from "@/lib/auth/dal";
import type { AdminListConfig, ListResult } from "./types";
import { AdminListProvider } from "./context";
import { AdminListHeader } from "./header";
import { AdminListFilters } from "./filters";
import { AdminListSelectFilteredRow } from "./selection";
import { AdminListSelectionBar } from "./selection";
import { AdminListDesktopTable } from "./desktop-table";
import { AdminListMobileCards } from "./mobile-cards";
import { AdminListPagination } from "./pagination";
import { AdminListEmptyState } from "./empty-state";
import { AdminListErrorState } from "./error-state";
import { AdminListSkeleton } from "./skeletons";
import { AdminListConfirmDialog } from "./confirm-dialog";
import { AdminListBulkResultDialog } from "./bulk-result-dialog";
import { AdminListMobileAdd } from "./mobile-add";
import { useAdminListContext } from "./context";

export function AdminListView<T extends { id: string }>({
  config,
  user,
  initialData,
}: {
  config: AdminListConfig<T>;
  user: AuthUser;
  initialData: ListResult<T>;
}) {
  return (
    <AdminListProvider config={config} user={user} initialData={initialData}>
      <AdminListHeader />
      <div className="mt-4 space-y-4">
        <AdminListFilters />
        <AdminListSelectFilteredRow />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <AdminListSelectionBar />
          <Content<T> />
          <AdminListPagination />
        </div>
      </div>
      <AdminListConfirmDialog />
      <AdminListBulkResultDialog />
      <AdminListMobileAdd />
    </AdminListProvider>
  );
}

function Content<T extends { id: string }>() {
  const ctx = useAdminListContext<T>();
  const { isLoading, hasLoadFailed, data } = ctx;
  if (isLoading) return <AdminListSkeleton />;
  if (hasLoadFailed) return <AdminListErrorState />;
  if (data.items.length === 0) return <AdminListEmptyState />;
  return (
    <>
      <div className="hidden md:block">
        <AdminListDesktopTable />
      </div>
      <div className="md:hidden">
        <AdminListMobileCards />
      </div>
    </>
  );
}
