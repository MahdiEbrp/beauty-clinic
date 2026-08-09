"use client";

import { useTranslations, useFormatter } from "next-intl";
import { ImageIcon, Loader2, MessageSquareText } from "lucide-react";
import type { AdminService } from "@/lib/services/types";
import { formatPrice, priceClass, statusClass, usePriceTypeLabel } from "./helpers";
import { ServiceRowActions } from "./row-actions";
import { ServiceRowSkeleton } from "./skeletons";
import { useServices } from "./services-context";

function DesktopRow({ row }: { row: AdminService }) {
  const t = useTranslations();
  const format = useFormatter();
  const priceTypeLabel = usePriceTypeLabel();
  const { canWrite, canManage, busyId, openEditService, requestDelete } =
    useServices();

  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-tertiary text-copper-strong"
            aria-hidden="true"
          >
            {row.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL
              <img
                src={row.coverImage}
                alt=""
                className="size-12 rounded-control object-cover"
                loading="lazy"
              />
            ) : (
              <ImageIcon className="size-5" strokeWidth={1.5} />
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-dash-body font-semibold text-accent">
              <span className="truncate">{row.title}</span>
              {row.isFeatured && (
                <span className="shrink-0 inline-flex items-center rounded-pill bg-copper/10 px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
                  {t("servicesCatalog.featuredShort")}
                </span>
              )}
            </p>
            <p className="truncate text-dash-caption text-content-tertiary" dir="ltr">
              {row.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-5 lg:table-cell">
        <p className="truncate text-dash-body-sm text-content-secondary">
          {row.categoryName}
          {row.groupName ? (
            <>
              {" · "}
              <span className="text-content-tertiary">{row.groupName}</span>
            </>
          ) : null}
        </p>
      </td>
      <td className="px-4 py-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-dash-caption font-bold whitespace-nowrap ${priceClass(row.priceType)}`}
          title={priceTypeLabel(row.priceType)}
        >
          {formatPrice(row.price, row.priceType, t, (value) =>
            format.number(value),
          )}
        </span>
      </td>
      <td className="hidden px-4 py-5 xl:table-cell">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap">
          {row.durationMin !== null
            ? t("servicesCatalog.duration", { minutes: row.durationMin })
            : t("servicesCatalog.noDuration")}
        </p>
      </td>
      <td className="hidden px-4 py-5 lg:table-cell">
        <div className="flex items-center gap-3 text-dash-caption text-content-tertiary">
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="size-3.5" aria-hidden="true" />
            {row.images.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            {row.faqs.length}
          </span>
        </div>
      </td>
      <td className="px-4 py-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-dash-caption font-bold whitespace-nowrap ${statusClass[row.isActive ? "active" : "inactive"]}`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`servicesCatalog.statuses.${row.isActive ? "active" : "inactive"}`)}
        </span>
      </td>
      {(canWrite || canManage) && (
        <td className="w-16 px-2 py-5">
          <div className="flex items-center justify-end gap-2">
            {busyId === row.id && (
              <Loader2 className="size-4 animate-spin text-accent" aria-hidden="true" />
            )}
            <ServiceRowActions
              row={row}
              onEdit={() => openEditService(row)}
              onDelete={() => requestDelete({ kind: "service", item: row })}
            />
          </div>
        </td>
      )}
    </tr>
  );
}

export function ServicesDesktopTable() {
  const t = useTranslations();
  const { data, canWrite, canManage, isSyncing } = useServices();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-150 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
            <th scope="col" className="w-[34%] px-4 py-4 text-start font-bold">
              {t("servicesCatalog.columns.service")}
            </th>
            <th scope="col" className="hidden w-[20%] px-4 py-4 text-start font-bold lg:table-cell">
              {t("servicesCatalog.columns.category")}
            </th>
            <th scope="col" className="w-[20%] px-4 py-4 text-start font-bold">
              {t("servicesCatalog.columns.price")}
            </th>
            <th scope="col" className="hidden w-[14%] px-4 py-4 text-start font-bold xl:table-cell">
              {t("servicesCatalog.columns.duration")}
            </th>
            <th scope="col" className="hidden w-[12%] px-4 py-4 text-start font-bold lg:table-cell">
              {t("servicesCatalog.columns.media")}
            </th>
            <th scope="col" className="w-[14%] px-4 py-4 text-start font-bold">
              {t("servicesCatalog.columns.status")}
            </th>
            {(canWrite || canManage) && (
              <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                {t("servicesCatalog.columns.actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-primary">
          {data.items.map((row) =>
            isSyncing(row.id) ? (
              <tr key={row.id} className="border-b border-border-primary">
                <td colSpan={canWrite || canManage ? 7 : 6} className="px-4 py-5">
                  <ServiceRowSkeleton />
                </td>
              </tr>
            ) : (
              <DesktopRow key={row.id} row={row} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
