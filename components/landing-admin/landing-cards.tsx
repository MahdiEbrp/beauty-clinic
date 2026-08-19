"use client";

import { useTranslations } from "next-intl";
import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import { rowMeta, rowTitle } from "./config";
import { statusClass, statusOf } from "./helpers";
import { LandingRowActions } from "./landing-row-actions";
import {
  LandingCollectionEmptyState,
  RowGlyph,
} from "./landing-table";
import { useLandingCollection } from "./landing-collection-context";

function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="size-10 shrink-0 animate-pulse rounded-pill bg-surface-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-2.5 w-1/3 animate-pulse rounded-control bg-surface-tertiary/70" />
      </div>
    </div>
  );
}

function CollectionCard({ row }: { row: AdminCollectionRow }) {
  const t = useTranslations();
  const { canWrite, isSyncing } = useLandingCollection();
  const state = statusOf(row);

  return (
    <article
      className={`flex items-start gap-3 rounded-card border border-border-primary bg-surface-secondary p-3.5 ${isSyncing(row.id) ? "opacity-60" : ""}`}
    >
      <RowGlyph row={row} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-dash-body font-semibold text-accent">
            {rowTitle(row)}
          </h3>
          <span
            className={`shrink-0 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${/* eslint-disable-line security/detect-object-injection -- typed status class lookup */ statusClass[state]}`}
          >
            {t(`landingAdmin.statuses.${state}`)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-dash-caption text-content-tertiary">
          {rowMeta(row) || row.key}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-dash-caption text-content-secondary">
          <span>
            {t("landingAdmin.table.order")}: {row.displayOrder}
          </span>
        </div>
      </div>
      {canWrite && (
        <div className="shrink-0">
          <LandingRowActions row={row} />
        </div>
      )}
    </article>
  );
}

export function LandingCollectionMobileCards() {
  const t = useTranslations();
  const { data, isLoading, hasLoadFailed } = useLandingCollection();

  return (
    <div className="space-y-3 p-3">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : hasLoadFailed ? (
        <div className="py-10 text-center text-dash-body text-content-secondary">
          {t("landingAdmin.errorTitle")}
        </div>
      ) : data.items.length === 0 ? (
        <LandingCollectionEmptyState />
      ) : (
        data.items.map((row) => (
          <CollectionCard key={row.id} row={row} />
        ))
      )}
    </div>
  );
}