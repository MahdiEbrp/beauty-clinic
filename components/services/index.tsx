"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { ServicesResult } from "./use-services-list";
import { ServicesProvider, useServices } from "./services-context";
import { ServicesHeader } from "./header";
import { ServicesFilters } from "./filters";
import { ServicesSelectionBar, ServicesSelectFilteredRow } from "./selection";
import { ServicesDesktopTable } from "./desktop-table";
import { ServicesMobileCards } from "./mobile-cards";
import { ServicesPagination } from "./pagination";
import { ServicesConfirmDialog } from "./delete-dialog";
import { ServicesBulkResultDialog } from "./bulk-result-dialog";
import { Plus } from "lucide-react";

function ServicesMobileAdd() {
  const t = useTranslations();
  const { canWrite } = useServices();
  if (!canWrite) return null;
  return (
    <Link
      href="/dashboard/services/manage/services/add"
      className="fixed inset-x-4 bottom-20 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-3 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
      {t("serviceServices.add")}
    </Link>
  );
}

export function ServicesContent({
  user,
  initialData,
  currency,
  categoryId,
  categoryName,
}: { user: AuthUser; initialData: ServicesResult; currency: string; categoryId?: string; categoryName?: string }) {
  const t = useTranslations();
  return (
    <ServicesProvider user={user} initialData={initialData} currency={currency} categoryId={categoryId}>
      <ServicesHeader />
      {categoryName ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-control border border-accent/20 bg-accent/5 px-4 py-3">
          <p className="text-dash-body-sm font-semibold text-content-primary">{categoryName}</p>
          <Link href="/dashboard/services/manage/services" className="text-dash-caption font-bold text-accent underline underline-offset-4">{t("serviceServices.clearFilters")}</Link>
        </div>
      ) : null}
      <div className="mt-4 space-y-4">
        <ServicesFilters />
        <ServicesSelectFilteredRow />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <ServicesSelectionBar />
          <div className="hidden md:block">
            <ServicesDesktopTable />
          </div>
          <div className="md:hidden">
            <ServicesMobileCards />
          </div>
          <ServicesPagination />
        </div>
      </div>
      <ServicesConfirmDialog />
      <ServicesBulkResultDialog />
      <ServicesMobileAdd />
    </ServicesProvider>
  );
}
