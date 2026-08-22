"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import SlotCalendar from "./SlotCalendar";
import ReservationsTable from "./ReservationsTable";

type Tab = "calendar" | "reservations";

export default function BookingsHub() {
  const t = useTranslations("bookingAdmin");
  const [tab, setTab] = useState<Tab>("calendar");

  const tabs: { key: Tab; label: string; icon: typeof CalendarDays }[] = [
    { key: "calendar", label: t("tabs.calendar"), icon: CalendarDays },
    { key: "reservations", label: t("tabs.reservations"), icon: Inbox },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-panel border border-border-primary bg-surface-secondary px-5 py-4 shadow-elevation-1 sm:px-6">
        <h1 className="text-dash-display font-bold text-accent">{t("title")}</h1>
        <p className="mt-1 text-dash-body-sm text-content-secondary">{t("description")}</p>
      </header>

      <div
        role="tablist"
        aria-label={t("tabs.label")}
        className="inline-flex items-center gap-1 rounded-pill border border-border-primary bg-surface-secondary p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              tab === item.key
                ? "bg-accent text-content-contrast shadow-elevation-1"
                : "text-content-secondary hover:text-accent",
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === "calendar" ? <SlotCalendar /> : <ReservationsTable />}
    </div>
  );
}
