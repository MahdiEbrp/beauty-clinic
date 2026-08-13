"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServiceCategoriesResult } from "@/lib/services/types";
import { CategoriesProvider, useCategories } from "./categories-context";
import { CategoriesHeader } from "./header";
import { CategoriesFilters } from "./filters";
import { CategoriesSelectionBar } from "./selection";
import { CategoriesDesktopTable } from "./desktop-table";
import { CategoriesMobileCards } from "./mobile-cards";
import { CategoriesPagination } from "./pagination";
import { CategoriesConfirmDialog } from "./delete-dialog";
import { CategoriesBulkResultDialog } from "./bulk-result-dialog";
import { Plus } from "lucide-react";

function CategoriesMobileAdd() {
  const t = useTranslations();
  const { canWrite } = useCategories();
  if (!canWrite) return null;
  return (
    <Link
      href="/dashboard/services/manage/categories/add"
      className="fixed inset-x-4 bottom-20 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-3 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
      {t("serviceCategories.add")}
    </Link>
  );
}

export function CategoriesContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListServiceCategoriesResult;
}) {
  return (
    <CategoriesProvider user={user} initialData={initialData}>
      <CategoriesHeader />
      <div className="mt-4 space-y-4">
        <CategoriesFilters />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <CategoriesSelectionBar />
          <div className="hidden md:block">
            <CategoriesDesktopTable />
          </div>
          <div className="md:hidden">
            <CategoriesMobileCards />
          </div>
          <CategoriesPagination />
        </div>
      </div>
      <CategoriesConfirmDialog />
      <CategoriesBulkResultDialog />
      <CategoriesMobileAdd />
    </CategoriesProvider>
  );
}
