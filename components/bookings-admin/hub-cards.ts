"use client";

import {
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  Inbox,
  LayoutList,
  Plus,
  UserRound,
} from "lucide-react";
import type { BookingsPerformance } from "@/lib/bookings/performance";

export interface HubCard {
  key: "reservations" | "slots";
  title: string;
  description: string;
  href: string;
  addHref: string;
  icon: typeof Inbox;
  badge: string;
  features: Array<{ icon: typeof Inbox; label: string }>;
}

export function buildHubCards(
  data: BookingsPerformance,
  t: (key: string, values?: Record<string, string | number>) => string,
  formatNumber: (value: number) => string,
): HubCard[] {
  return [
    {
      key: "reservations",
      title: t("hub.reservations.name"),
      description: t("hub.reservations.description"),
      href: "/dashboard/bookings/manage/reservations",
      addHref: "/dashboard/bookings/manage/reservations/add",
      icon: Inbox,
      badge: t("counts.active", { count: formatNumber(data.reservations.active) }),
      features: [
        { icon: UserRound, label: t("hub.reservations.featureCustomer") },
        { icon: CheckCircle2, label: t("hub.reservations.featureStatus") },
        { icon: CreditCard, label: t("hub.reservations.featurePayment") },
      ],
    },
    {
      key: "slots",
      title: t("hub.slots.name"),
      description: t("hub.slots.description"),
      href: "/dashboard/slots",
      addHref: "/dashboard/slots/add",
      icon: CalendarRange,
      badge: t("counts.active", { count: formatNumber(data.slots.active) }),
      features: [
        { icon: CalendarClock, label: t("hub.slots.featureTime") },
        { icon: LayoutList, label: t("hub.slots.featureCapacity") },
        { icon: Plus, label: t("hub.slots.featureService") },
      ],
    },
  ];
}
