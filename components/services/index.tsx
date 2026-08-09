"use client";

import { useTranslations } from "next-intl";
import { Plus, RotateCcw } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListServicesResult, ServiceCatalogSummary } from "@/lib/services/types";
import { ServicesProvider, useServices } from "./services-context";
import { ServicesHeader } from "./header";
import { ServicesTabs } from "./tabs";
import { ServiceFilters } from "./service-filters";
import { ServicesDesktopTable } from "./service-table";
import { ServiceMobileCards } from "./service-mobile-cards";
import { ServicesEmptyState } from "./empty-state";
import { ServicesPagination } from "./pagination";
import { GroupsView } from "./groups-view";
import { CategoriesView } from "./categories-view";
import { ServiceDialog } from "./service-dialog";
import { GroupDialog } from "./group-dialog";
import { CategoryDialog } from "./category-dialog";
import { DeleteTargetDialog } from "./delete-dialog";

function ServicesErrorBanner() {
  const t = useTranslations();
  const {
    hasLoadFailed,
    load,
    debouncedSearch,
    status,
    featured,
    categoryId,
    page,
  } = useServices();

  if (!hasLoadFailed) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 bg-error/10 border border-error/40 rounded-control p-4"
    >
      <p className="text-dash-body-sm text-error font-medium">
        {t("servicesCatalog.error")}
      </p>
      <button
        type="button"
        onClick={() =>
          load({ search: debouncedSearch, status, featured, categoryId, page })
        }
        className="inline-flex items-center gap-2 px-4 py-2 min-h-9 rounded-pill text-dash-body-sm font-bold text-error border border-error/40 hover:bg-error/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>{t("servicesCatalog.retry")}</span>
      </button>
    </div>
  );
}

function ServicesTableSection() {
  const t = useTranslations();
  const { tab, isLoading } = useServices();

  return (
    <section
      className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
      aria-label={t("servicesCatalog.heading")}
    >
      {tab === "services" ? (
        <>
          <ServiceMobileCards />
          <ServicesDesktopTable />
          <ServicesEmptyState />
          <ServicesPagination />
          {isLoading && (
            <p className="sr-only" role="status">
              {t("servicesCatalog.loading")}
            </p>
          )}
        </>
      ) : tab === "groups" ? (
        <GroupsView />
      ) : (
        <CategoriesView />
      )}
    </section>
  );
}

function ServicesFab() {
  const t = useTranslations();
  const { openCreateService } = useServices();

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-4 end-4 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <button
          type="button"
          onClick={openCreateService}
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-4 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-5" aria-hidden="true" />
          <span>{t("servicesCatalog.addShort")}</span>
        </button>
      </div>
      <div aria-hidden="true" className="h-24 md:hidden" />
    </>
  );
}

function ServicesView() {
  const { tab, canWrite } = useServices();

  return (
    <div className="space-y-4 sm:space-y-6">
      <ServicesHeader />
      <ServicesTabs />
      <ServicesErrorBanner />
      {tab === "services" && <ServiceFilters />}
      <ServicesTableSection />
      <ServiceDialog />
      <GroupDialog />
      <CategoryDialog />
      <DeleteTargetDialog />
      {canWrite && <ServicesFab />}
    </div>
  );
}

export default function ServicesCatalogContent({
  user,
  initialData,
  summary,
}: {
  user: AuthUser;
  initialData: ListServicesResult;
  summary: ServiceCatalogSummary;
}) {
  return (
    <ServicesProvider user={user} initialData={initialData} summary={summary}>
      <ServicesView />
    </ServicesProvider>
  );
}
