"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { fetchMyBookings } from "../api";
import type { BookingGroup } from "../types";
import { formatDate, weekdayName, type CalendarKind } from "@/lib/bookings/dates";

type PatientHistoryProps = {
  phone: string;
  /** The group being created — hidden from the history list. */
  groupRef: string;
};

const STATUS_KEYS = {
  pending: "myBookings.status.pending",
  confirmed: "myBookings.status.confirmed",
  paid: "myBookings.status.paid",
  cancelled: "myBookings.status.cancelled",
} as const;

function toLabel(item: BookingGroup["items"][number], locale: "fa" | "en"): string {
  const kind: CalendarKind = locale === "fa" ? "jalali" : "gregorian";
  if (!item.slotDate) return "";
  const d = new Date(`${item.slotDate}T${item.startTime ?? "00:00:00"}`);
  const weekday = weekdayName(d, locale);
  const date = formatDate(d, kind);
  const time = (item.startTime ?? "").slice(0, 5);
  return `${weekday} ${date}${time ? ` · ${time}` : ""}`;
}

function upcoming(group: BookingGroup): boolean {
  const soonest = group.items.reduce<string | null>((acc, it) => {
    if (!it.slotDate) return acc;
    return acc === null || it.slotDate < acc ? it.slotDate : acc;
  }, null);
  if (!soonest) return false;
  const today = new Date();
  const d = new Date(`${soonest}T00:00:00`);
  d.setHours(23, 59, 59, 999);
  return d.getTime() >= today.getTime();
}

/** Previous & upcoming clinic visits for the same phone (Option A recap). */
export default function PatientHistory({ phone, groupRef }: PatientHistoryProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const [groups, setGroups] = useState<BookingGroup[] | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchMyBookings(phone)
      .then((rows) => alive && setGroups(rows.filter((g) => g.groupRef !== groupRef)))
      .catch(() => alive && setGroups([]));
    return () => {
      alive = false;
    };
  }, [phone, groupRef]);

  if (groups === null) {
    return (
      <div className="space-y-2 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1">
        <div className="h-4 w-40 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-10 animate-pulse rounded-control bg-surface-tertiary" />
        <div className="h-10 animate-pulse rounded-control bg-surface-tertiary" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-border-interactive bg-surface-secondary p-5 text-center text-xs font-semibold text-content-tertiary">
        {t("review.historyEmpty")}
      </div>
    );
  }

  const upcomingList = groups.filter(upcoming).slice(0, 3);
  const pastList = groups.filter((g) => !upcoming(g)).slice(0, 3);

  return (
    <div className="space-y-3 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-content-primary">
        <CalendarDays className="size-4 text-copper" aria-hidden="true" />
        {t("review.historyTitle")}
      </h3>

      {upcomingList.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-copper-strong">
            {t("review.historyUpcoming")}
          </div>
          <ul role="list" className="space-y-1.5">
            {upcomingList.map((g) => (
              <li
                key={g.groupRef}
                className="flex items-center justify-between gap-2 rounded-control border border-border-primary bg-surface-primary p-2.5 text-xs"
              >
                <span dir="ltr" className="font-mono text-[10px] font-bold text-copper-deep">
                  {g.groupRef}
                </span>
                <span className="min-w-0 flex-1 truncate text-end text-content-secondary">
                  {toLabel(g.items[0], locale)}
                </span>
                <span className="shrink-0 rounded-pill bg-copper/15 px-2 py-0.5 text-[10px] font-bold text-copper-strong">
                  {t(STATUS_KEYS[g.status as keyof typeof STATUS_KEYS] ?? STATUS_KEYS.pending)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pastList.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[10px] font-black uppercase tracking-wider text-content-tertiary">
            {t("review.historyPast")}
          </div>
          <ul role="list" className="space-y-1.5">
            {pastList.map((g) => (
              <li
                key={g.groupRef}
                className="flex items-center justify-between gap-2 rounded-control border border-border-primary bg-surface-primary p-2.5 text-xs opacity-80"
              >
                <span dir="ltr" className="font-mono text-[10px] font-bold text-content-secondary">
                  {g.groupRef}
                </span>
                <span className="min-w-0 flex-1 truncate text-end text-content-tertiary">
                  {toLabel(g.items[0], locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[10px] leading-relaxed text-content-tertiary">{t("review.historyNote")}</p>
    </div>
  );
}
