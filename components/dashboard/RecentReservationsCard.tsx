"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

import { Link } from "@/src/i18n/navigation";
import { formatPrice } from "@/components/admin-list/helpers";
import { formatOrderSummary } from "@/components/bookings/reservation-render";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { StatusPill } from "@/components/bookings/status-pill";

export function RecentReservationsCard({
  reservations,
}: {
  reservations: ReservationAdmin[];
}) {
  const t = useTranslations();
  const format = useFormatter();
  const locale = useLocale() === "en" ? "en" : "fa";

  return (
    <section className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-2 p-8 sm:p-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays
            className="size-6 shrink-0 text-copper"
            strokeWidth={2}
            aria-hidden="true"
          />
          <div>
            <h2 className="text-dash-title font-bold text-accent">
              {t("dashboard.recentReservations.heading")}
            </h2>
            <p className="text-dash-body-sm text-content-secondary">
              {t("dashboard.recentReservations.description")}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/bookings/manage/reservations"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border border-border-interactive bg-surface-tertiary px-4 text-dash-caption font-bold text-accent transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span>{t("dashboard.recentReservations.viewAll")}</span>
          <ArrowLeft className="size-4 rtl-mirror" aria-hidden="true" />
        </Link>
      </div>

      {reservations.length === 0 ? (
        <p className="rounded-control border border-dashed border-border-interactive bg-surface-tertiary px-4 py-10 text-center text-dash-body-sm text-content-tertiary">
          {t("dashboard.recentReservations.empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border-primary" role="list">
          {reservations.map((row) => (
            <li key={row.id} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="truncate text-dash-body font-bold text-accent">
                  {row.fullName}
                </p>
                <p className="truncate text-dash-body-sm text-content-secondary">
                  {formatOrderSummary(row, locale)}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <span className="inline-flex items-center gap-1.5 text-dash-caption text-content-tertiary">
                  {row.slotStart ? (
                    <>
                      <Clock className="size-3.5" aria-hidden="true" />
                      <time dateTime={row.slotStart}>
                        {format.dateTime(new Date(row.slotStart), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </>
                  ) : null}
                </span>
                <span dir="ltr" className="text-dash-caption font-bold text-copper-deep">
                  {formatPrice(row.totalAmount, row.currency)}
                </span>
                <StatusPill status={row.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
