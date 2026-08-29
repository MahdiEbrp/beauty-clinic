"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, LoaderCircle, X } from "lucide-react";
import { bookingErrorKey } from "@/lib/bookings/errors";
import { asTranslate } from "@/src/i18n/message-key";
import { cancelBookingGroup, fetchMyBookings } from "./api";
import type { BookingGroup } from "./types";

type MyBookingsModalProps = {
  minCancelHours: number;
  onClose: () => void;
};

const STATUS_KEYS = {
  pending: "myBookings.status.pending",
  confirmed: "myBookings.status.confirmed",
  paid: "myBookings.status.paid",
  cancelled: "myBookings.status.cancelled",
} as const;

/** My-bookings lookup (template parity): by phone, DB-backed, with cancel. */
export default function MyBookingsModal({ minCancelHours, onClose }: MyBookingsModalProps) {
  const t = useTranslations("booking");
  const looseT = asTranslate(t);
  const [phone, setPhone] = useState("");
  const [groups, setGroups] = useState<BookingGroup[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      setGroups(await fetchMyBookings(phone.trim()));
    } catch (err) {
      setError(looseT(`errors.${bookingErrorKey(err)}`));
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (groupRef: string) => {
    setCancelling(groupRef);
    setError(null);
    try {
      await cancelBookingGroup(groupRef, phone.trim());
      setGroups((prev) =>
        prev?.map((g) => (g.groupRef === groupRef ? { ...g, status: "cancelled" } : g)) ?? null,
      );
    } catch (err) {
      setError(looseT(`errors.${bookingErrorKey(err)}`));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("myBookings.title")}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-panel border border-border-primary bg-surface-primary p-6 shadow-elevation-3">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-body-lg font-bold text-accent">
            <ClipboardList className="size-5" aria-hidden="true" />
            {t("myBookings.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("myBookings.close")}
            className="flex size-10 items-center justify-center rounded-full text-content-tertiary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <form
          className="mb-5 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
        >
          <input
            type="tel"
            dir="ltr"
            inputMode="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("myBookings.phonePlaceholder")}
            aria-label={t("myBookings.phonePlaceholder")}
            className="min-h-11 flex-1 rounded-control border border-form-input-border bg-form-input-bg px-4 text-end text-body-sm text-accent outline-none transition-colors placeholder:text-start placeholder:text-content-tertiary hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <button
            type="submit"
            disabled={loading || phone.trim().length < 6}
            className="inline-flex min-h-11 items-center gap-2 rounded-control bg-accent px-5 text-body-sm font-bold text-content-contrast transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
            {t("myBookings.search")}
          </button>
        </form>

        {error ? (
          <p role="alert" className="mb-4 rounded-control border border-error/40 bg-error/5 px-4 py-3 text-body-sm text-error">
            {error}
          </p>
        ) : null}

        {groups !== null && groups.length === 0 ? (
          <p className="rounded-control border border-dashed border-border-interactive bg-surface-secondary px-4 py-10 text-center text-body-sm text-content-tertiary">
            {t("myBookings.empty")}
          </p>
        ) : null}

        <ul role="list" className="space-y-3">
          {(groups ?? []).map((group) => (
            <li key={group.groupRef} className="rounded-panel border border-border-primary bg-surface-secondary p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span dir="ltr" className="font-mono text-caption font-bold text-copper-deep">
                  {group.groupRef}
                </span>
                <span className="rounded-pill bg-copper/15 px-2.5 py-0.5 text-caption font-bold text-copper-strong">
                  {t(STATUS_KEYS[group.status as keyof typeof STATUS_KEYS] ?? STATUS_KEYS.pending)}
                </span>
              </div>
              <ul role="list" className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-body-sm">
                    <span className="min-w-0 truncate text-accent">
                      {item.serviceTitle} × {item.quantity}
                    </span>
                    <span dir="ltr" className="shrink-0 text-caption text-content-tertiary">
                      {item.slotDate} · {item.startTime?.slice(0, 5)}
                    </span>
                  </li>
                ))}
              </ul>
              {group.status === "pending" || group.status === "confirmed" ? (
                <button
                  type="button"
                  onClick={() => void cancel(group.groupRef)}
                  disabled={cancelling === group.groupRef}
                  className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-pill border border-error/40 px-4 text-body-sm font-bold text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
                >
                  {cancelling === group.groupRef ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {t("myBookings.cancel", { hours: minCancelHours })}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
