"use client";

import { useTranslations, useFormatter } from "next-intl";
import { ImageIcon, Star, Loader2 } from "lucide-react";
import type { AdminService } from "@/lib/services/types";
import { formatPrice, priceClass, statusClass, usePriceTypeLabel } from "./helpers";
import { ServiceRowActions } from "./row-actions";
import { ServiceCardSkeleton } from "./skeletons";
import { useServices } from "./services-context";

function MobileCard({ row }: { row: AdminService }) {
  const t = useTranslations();
  const format = useFormatter();
  const priceTypeLabel = usePriceTypeLabel();
  const {
    canWrite,
    canManage,
    busyId,
    openEditService,
    requestDelete,
  } = useServices();

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-tertiary text-copper-strong"
          aria-hidden="true"
        >
          {row.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
            <img
              src={row.coverImage}
              alt=""
              className="size-10 rounded-control object-cover"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="size-4" strokeWidth={1.5} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-dash-body font-bold text-accent">
            <span className="truncate">{row.title}</span>
            {row.isFeatured && (
              <Star className="size-3.5 shrink-0 fill-copper text-copper" aria-hidden="true" />
            )}
          </p>
          <p className="truncate text-dash-caption text-content-tertiary">
            {row.categoryName}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${priceClass(row.priceType)}`}
              title={priceTypeLabel(row.priceType)}
            >
              {formatPrice(row.price, row.priceType, t, (value) =>
                format.number(value),
              )}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${statusClass[row.isActive ? "active" : "inactive"]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {t(`servicesCatalog.statuses.${row.isActive ? "active" : "inactive"}`)}
            </span>
          </div>
        </div>
        {(canWrite || canManage) && (
          <div className="shrink-0 self-center">
            {busyId === row.id ? (
              <Loader2 className="size-4 animate-spin text-accent" aria-hidden="true" />
            ) : (
              <ServiceRowActions
                row={row}
                onEdit={() => openEditService(row)}
                onDelete={() => requestDelete({ kind: "service", item: row })}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function ServiceMobileCards() {
  const { data, isSyncing } = useServices();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <ServiceCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
