"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminCollectionRow,
  LandingListResult,
} from "@/lib/landing/admin/types";
import { LandingCollectionProvider, useLandingCollection } from "./landing-collection-context";
import { LandingCollectionHeader } from "./landing-header";
import { LandingCollectionFilters } from "./landing-filters";
import {
  LandingCollectionSelectFilteredRow,
  LandingCollectionSelectionBar,
} from "./landing-selection";
import {
  LandingCollectionDesktopTable,
} from "./landing-table";
import { LandingCollectionMobileCards } from "./landing-cards";
import { LandingCollectionPagination } from "./landing-pagination";
import { LandingConfirmDialog, LandingBulkResultDialog } from "./landing-dialogs";
import { addPathFor } from "./config";
import type { CollectionKey } from "./types";

function LandingMobileAdd() {
  const t = useTranslations();
  const { collection, canWrite } = useLandingCollection();
  if (!canWrite) return null;
  return (
    <Link
      href={addPathFor(collection)}
      className="fixed inset-x-4 bottom-20 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-accent px-4 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-3 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
    >
      <Plus className="size-5" aria-hidden="true" />
      {t("landingAdmin.add")}
    </Link>
  );
}

export function LandingCollectionContent({
  collection,
  user,
  initialData,
}: {
  collection: CollectionKey;
  user: AuthUser;
  initialData: LandingListResult<AdminCollectionRow>;
}) {
  return (
    <LandingCollectionProvider
      collection={collection}
      user={user}
      initialData={initialData}
    >
      <LandingCollectionHeader />
      <div className="mt-4 space-y-4">
        <LandingCollectionFilters />
        <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
          <LandingCollectionSelectionBar />
          <LandingCollectionSelectFilteredRow />
          <div className="hidden md:block">
            <LandingCollectionDesktopTable />
          </div>
          <div className="md:hidden">
            <LandingCollectionMobileCards />
          </div>
          <LandingCollectionPagination />
        </div>
      </div>
      <LandingConfirmDialog />
      <LandingBulkResultDialog />
      <LandingMobileAdd />
    </LandingCollectionProvider>
  );
}
