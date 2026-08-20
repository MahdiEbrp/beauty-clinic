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
}: { user: AuthUser; initialData: ServicesResult; currency: string }) {
  return (
    <ServicesProvider user={user} initialData={initialData} currency={currency}>
      <ServicesHeader />
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
