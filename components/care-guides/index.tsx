"use client";

import { useTranslations } from "next-intl";
import { Plus, RotateCcw, SquareCheckBig } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListCareGuidesResult } from "@/lib/services/care-guides-types";
import { CareGuidesProvider, useCareGuides } from "./care-guides-context";
import { CareGuidesHeader } from "./header";
import { CareGuidesFilters } from "./filters";
import { CareGuidesSelectionBar, CareGuidesSelectFilteredRow } from "./selection";
import { CareGuidesMobileCards } from "./mobile-cards";
import { CareGuidesDesktopTable } from "./desktop-table";
import { CareGuidesEmptyState } from "./empty-state";
import { CareGuidesPagination } from "./pagination";
import { CareGuidesConfirmDialog } from "./delete-dialog";
import { CareGuidesBulkResultDialog } from "./bulk-result-dialog";

function CareGuidesErrorBanner() {
  const t = useTranslations();
  const { hasLoadFailed, load, debouncedSearch, status, page } = useCareGuides();

  if (!hasLoadFailed) return null;

  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 bg-error/10 border border-error/40 rounded-control p-4"
    >
      <p className="text-dash-body-sm text-error font-medium">
        {t("careGuides.error")}
      </p>
      <button
        type="button"
        onClick={() => void load({ search: debouncedSearch, status, page })}
        className="inline-flex items-center gap-2 px-4 py-2 min-h-9 rounded-pill text-dash-body-sm font-bold text-error border border-error/40 hover:bg-error/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
        <span>{t("careGuides.retry")}</span>
      </button>
    </div>
  );
}

function CareGuidesTableSection() {
  const t = useTranslations();
  const {
    canManage,
    data,
    selectionMode,
    toggleSelectionMode,
    isLoading,
  } = useCareGuides();

  return (
    <section
      className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
      aria-label={t("careGuides.heading")}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border-primary bg-surface-secondary px-4 py-2.5 md:px-6">
        <p className="text-dash-caption text-content-tertiary">
          {data.total} {t("careGuides.resultsLabel")}
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
            {selectionMode ? t("careGuides.done") : t("careGuides.select")}
          </button>
        )}
      </div>
      <CareGuidesSelectionBar />
      <CareGuidesSelectFilteredRow />
      <CareGuidesMobileCards />
      <CareGuidesDesktopTable />
      <CareGuidesEmptyState />
      <CareGuidesPagination />
      {isLoading && (
        <p className="sr-only" role="status">
          {t("careGuides.loading")}
        </p>
      )}
    </section>
  );
}

function CareGuidesAddFab() {
  const t = useTranslations();
  const { canWrite } = useCareGuides();

  if (!canWrite) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed bottom-4 inset-e-4 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/dashboard/care/manage/guides/add"
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-4 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus className="size-5" aria-hidden="true" />
          <span>{t("careGuides.addShort")}</span>
        </Link>
      </div>
      <div aria-hidden="true" className="h-24 md:hidden" />
    </>
  );
}

function CareGuidesView() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <CareGuidesHeader />
      <CareGuidesFilters />
      <CareGuidesErrorBanner />
      <CareGuidesTableSection />
      <CareGuidesConfirmDialog />
      <CareGuidesBulkResultDialog />
      <CareGuidesAddFab />
    </div>
  );
}

export default function CareGuidesContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListCareGuidesResult;
}) {
  return (
    <CareGuidesProvider user={user} initialData={initialData}>
      <CareGuidesView />
    </CareGuidesProvider>
  );
}
