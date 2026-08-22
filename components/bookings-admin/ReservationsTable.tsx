"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarClock, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { formatNumber } from "@/lib/services/format";
import { cn } from "@/lib/utils";
import { listBookings, setBookingStatus, type BookingList } from "./api";

const STATUSES = ["pending", "confirmed", "paid", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const statusClass: Record<Status, string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-accent/10 text-accent",
  paid: "bg-success/15 text-success",
  cancelled: "bg-error/15 text-error",
};

export default function ReservationsTable() {
  const t = useTranslations("bookingAdmin.reservations");
  const [data, setData] = useState<BookingList | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let running = true;
    void listBookings({ page, perPage: 10, search, status })
      .then((result) => {
        if (running) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (running) {
          setData(null);
          setError(err instanceof Error ? err.message : t("error"));
        }
      })
      .finally(() => {
        if (running) setLoading(false);
      });
    return () => {
      running = false;
    };
  }, [page, search, status, t]);

  const changeStatus = async (id: string, next: Status) => {
    try {
      await setBookingStatus(id, next);
      setLoading(true);
      const result = await listBookings({ page, perPage: 10, search, status });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => setPage(1);
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder={t("placeholder")}
            className="w-full rounded-control border border-form-input-border bg-form-input-bg py-2 ps-10 pe-3 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as "all" | Status);
          }}
          className="min-h-11 rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <option value="all">{t("filterAll")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void listBookings({ page, perPage: 10, search, status })
              .then((result) => {
                setData(result);
                setError(null);
              })
              .catch((err) => setError(err instanceof Error ? err.message : t("error")))
              .finally(() => setLoading(false));
          }}
          aria-label={t("refresh")}
          className="inline-flex size-11 items-center justify-center rounded-control border border-border-interactive bg-surface-secondary text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <p role="alert" className="rounded-control border border-error/40 bg-error/5 px-4 py-3 text-dash-body-sm text-error">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1">
        {loading && !data ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-control bg-surface-tertiary" />
            ))}
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-pill bg-surface-tertiary text-copper">
              <CalendarClock className="size-6" aria-hidden="true" />
            </span>
            <p className="text-dash-body-sm text-content-secondary">{t("empty")}</p>
          </div>
        ) : data ? (
          <>
            <div className="hidden divide-y divide-border-primary md:block">
              {data.items.map((b) => (
                <div
                  key={b.id}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-3"
                >
                  <div className="col-span-4 min-w-0">
                    <p className="truncate text-dash-body-sm font-bold text-accent">
                      {b.fullName}
                    </p>
                    <p className="truncate text-dash-caption text-content-tertiary" dir="ltr">
                      {b.phone}
                    </p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="truncate text-dash-body-sm text-content-secondary">{b.serviceTitle}</p>
                    {b.slotStart ? (
                      <p className="text-dash-caption text-content-tertiary" dir="ltr">
                        {new Date(b.slotStart).toLocaleString("en-GB")}
                      </p>
                    ) : null}
                  </div>
                  <div className="col-span-2 text-dash-body-sm font-bold text-copper-deep">
                    {formatNumber(Number(b.totalAmount))} {b.currency}
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <span
                      className={cn(
                        "shrink-0 rounded-pill px-3 py-1 text-dash-caption font-bold",
                        statusClass[b.status],
                      )}
                    >
                      {t(`status.${b.status}`)}
                    </span>
                    <select
                      value={b.status}
                      onChange={(e) => { void changeStatus(b.id, e.target.value as Status); }}
                      aria-label={t("changeStatus")}
                      className="min-h-11 rounded-control border border-border-interactive bg-surface-primary px-2 text-dash-caption font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border-primary md:hidden">
              {data.items.map((b) => (
                <div key={b.id} className="space-y-2 px-4 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-dash-body font-bold text-accent">{b.fullName}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-pill px-2.5 py-1 text-dash-caption font-bold",
                        statusClass[b.status],
                      )}
                    >
                      {t(`status.${b.status}`)}
                    </span>
                  </div>
                  <p className="truncate text-dash-body-sm text-content-secondary">{b.serviceTitle}</p>
                  <p className="text-dash-caption text-content-tertiary" dir="ltr">{b.phone}</p>
                  <div className="flex items-center justify-between gap-2 border-t border-border-primary pt-2">
                    <span className="text-dash-body-sm font-bold text-copper-deep">
                      {formatNumber(Number(b.totalAmount))} {b.currency}
                    </span>
                    <select
                      value={b.status}
                      onChange={(e) => { void changeStatus(b.id, e.target.value as Status); }}
                      aria-label={t("changeStatus")}
                      className="min-h-11 rounded-control border border-border-interactive bg-surface-primary px-2 text-dash-caption font-semibold text-accent outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${s}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border-primary px-5 py-3">
              <p className="text-dash-caption text-content-tertiary">
                {t("total", { count: data.total })}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="min-h-11 rounded-control px-3 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
                >
                  {t("prev")}
                </button>
                <span className="px-2 text-dash-caption text-content-tertiary">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-11 rounded-control px-3 text-dash-body-sm font-bold text-accent transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {loading && data ? (
        <div className="flex items-center justify-center gap-2 text-dash-caption text-content-tertiary">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {t("loading")}
        </div>
      ) : null}
    </div>
  );
}
