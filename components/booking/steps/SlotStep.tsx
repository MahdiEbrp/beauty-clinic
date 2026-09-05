"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { weekdayName, formatDate, type CalendarKind } from "@/lib/bookings/dates";
import {
  autoSchedule,
  buildDayOptions,
  doSlotsOverlap,
  findCartConflicts,
  slotDuration,
} from "@/lib/booking/scheduling";
import { getSlots, prefetchDays } from "../slots-cache";
import type { CartItem, SlotOption } from "../types";
import MonthCalendar from "./MonthCalendar";
import SlotGrid from "./SlotGrid";
import Itinerary from "./Itinerary";
import SmartScheduleBar from "./SmartScheduleBar";

type SlotStepProps = {
  cart: CartItem[];
  openingHours: readonly {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  }[];
  onAssign: (serviceId: string, slot: SlotOption | null) => void;
  onBack: () => void;
  onContinue: () => void;
};

/** Step 2 — pick a day on the fixed monthly calendar, then a time slot. */
export default function SlotStep({ cart, openingHours, onAssign, onBack, onContinue }: SlotStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale() as "fa" | "en";
  const calendar: CalendarKind = locale === "fa" ? "jalali" : "gregorian";

  const openDays = useMemo(() => buildDayOptions(openingHours, 45).filter((d) => d.isOpen), [openingHours]);

  const [activeId, setActiveId] = useState<string>(() => {
    const unscheduled = cart.find((c) => !c.slot);
    return unscheduled?.service.id ?? cart[0]?.service.id ?? "";
  });
  const [date, setDate] = useState<string | null>(null);
  const [fresh, setFresh] = useState<{ date: string; data: SlotOption[] } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeIndex = Math.max(0, cart.findIndex((c) => c.service.id === activeId));
  const active = cart[activeIndex];
  const activeDate = date ?? active?.slot?.slotDate ?? openDays[0]?.dateStr ?? null;

  const cached = useMemo(() => (activeDate ? getSlots(activeDate) : null), [activeDate]);

  useEffect(() => {
    if (!cached || !activeDate) return;
    const soon = openDays.slice(0, 4).map((d) => d.dateStr);
    prefetchDays(soon);
    let alive = true;
    void cached.fresh
      .then((data) => alive && setFresh({ date: activeDate, data }))
      .catch(() => alive && setFresh({ date: activeDate, data: [] }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cached, activeDate]);

  const slots = fresh && fresh.date === activeDate ? fresh.data : (cached?.data ?? null);
  const sortedSlots = useMemo(
    () => (slots ? [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)) : slots),
    [slots],
  );

  const conflicts = useMemo(() => findCartConflicts(cart), [cart]);

  const overlaps = (slot: SlotOption) => (line: CartItem) =>
    line.slot?.slotDate === activeDate &&
    (line.slot.id === slot.id ||
      doSlotsOverlap(line.slot.startTime, slotDuration(line.slot), slot.startTime, slotDuration(slot)));

  const isTaken = (slot: SlotOption) =>
    cart.some((line, index) => index !== activeIndex && overlaps(slot)(line));

  const reservedName = (slot: SlotOption): string | null => {
    const other = cart.find((line, index) => index !== activeIndex && overlaps(slot)(line));
    return other?.service.title ?? null;
  };

  const suggestedId = useMemo(() => {
    if (cart.length <= 1 || !activeDate || !active) return null;
    let lastEnd = 0;
    for (const o of cart) {
      if (o.service.id === active.service.id || o.slot?.slotDate !== activeDate || !o.slot) continue;
      const start = Number(o.slot.startTime.slice(0, 2)) * 60 + Number(o.slot.startTime.slice(3, 5));
      lastEnd = Math.max(lastEnd, start + slotDuration(o.slot));
    }
    if (lastEnd === 0) return null;
    for (const slot of slots ?? []) {
      if (!slot.available || isTaken(slot)) continue;
      const start = Number(slot.startTime.slice(0, 2)) * 60 + Number(slot.startTime.slice(3, 5));
      if (start >= lastEnd) return slot.id;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, activeIndex, activeDate, active, slots]);

  const bookedByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of cart) {
      if (!line.slot) continue;
      map.set(line.slot.slotDate, (map.get(line.slot.slotDate) ?? 0) + 1);
    }
    return map;
  }, [cart]);

  const allScheduled = cart.every((line) => line.slot);
  const isComplete = allScheduled && conflicts.length === 0;
  const slotId = active?.slot?.id ?? null;

  const smartSameDay = () => {
    const slotsByDate = new Map<string, SlotOption[]>();
    for (const day of openDays.slice(0, 6)) slotsByDate.set(day.dateStr, getSlots(day.dateStr).data ?? []);
    const scheduled = autoSchedule(cart, openDays.slice(0, 6), slotsByDate, activeDate ?? undefined);
    scheduled.forEach((line) => {
      if (line.slot && line.slot.id !== cart.find((c) => c.service.id === line.service.id)?.slot?.id) {
        onAssign(line.service.id, line.slot);
      }
    });
    setFeedback(t("schedule.feedbackSameDay", { n: cart.length }));
  };

  const smartMultiDay = () => {
    let dayIndex = 0;
    for (const line of cart) {
      const day = openDays[dayIndex] ?? openDays[openDays.length - 1];
      if (!day) break;
      const free = (getSlots(day.dateStr).data ?? []).find((s) => s.available);
      if (free) onAssign(line.service.id, free);
      dayIndex += 1;
    }
    setFeedback(t("schedule.feedbackMultiDay"));
  };

  const selectSlot = (slot: SlotOption) => {
    if (slotId === slot.id) onAssign(active.service.id, null);
    else onAssign(active.service.id, slot);
  };

  const activeDay = activeDate ? new Date(`${activeDate}T00:00:00`) : null;
  const slotsFor =
    activeDay && activeDate
      ? `${weekdayName(activeDay, locale)} · ${formatDate(activeDay, calendar)}`
      : "";

  return (
    <div className="w-full max-w-5xl space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-black text-content-contrast">
            {t("schedule.stepBadge")}
          </span>
          <h2 className="text-xl font-black tracking-tight text-content-primary">{t("schedule.title")}</h2>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-control border border-border-interactive bg-surface-primary px-3 py-1.5 text-xs font-bold text-content-primary shadow-elevation-1 transition-all hover:bg-surface-tertiary sm:self-center"
        >
          <ArrowRight className="size-3.5 rtl-mirror" aria-hidden="true" />
          {t("schedule.editServices")}
        </button>
      </div>

      {cart.length > 1 ? (
        <SmartScheduleBar
          cart={cart}
          activeId={activeId}
          feedback={feedback}
          onActivate={setActiveId}
          onSmartSameDay={smartSameDay}
          onSmartMultiDay={smartMultiDay}
          onDismissFeedback={() => setFeedback(null)}
        />
      ) : null}

      {/* Date — fixed monthly calendar */}
      <div className="space-y-3.5 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-control border border-border-interactive bg-surface-primary text-copper">
            <CalendarDays className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-black text-content-primary sm:text-base">{t("schedule.chooseDate")}</h3>
            <span className="text-[11px] font-medium text-content-secondary">
              {t("schedule.pickDayHint")}
            </span>
          </div>
        </div>

        <MonthCalendar
          openingHours={openingHours}
          activeDate={activeDate}
          bookedByDate={bookedByDate}
          onSelect={setDate}
        />
      </div>

      {/* Time — flat grid for the active day */}
      <div className="space-y-4 rounded-panel border border-border-primary bg-surface-secondary p-4 shadow-elevation-1 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-primary pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-control border border-border-interactive bg-surface-primary text-copper">
              <Clock className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-black text-content-primary sm:text-base">
                {cart.length > 1
                  ? t("schedule.chooseTimeFor", { name: active?.service.title })
                  : t("schedule.chooseTime")}
              </h3>
              <span className="text-[11px] font-medium text-content-secondary">{slotsFor}</span>
            </div>
          </div>
        </div>

        <SlotGrid
          slots={sortedSlots}
          loading={activeDate !== null && slots === null}
          selectedId={slotId}
          suggestedId={suggestedId}
          isTaken={isTaken}
          reservedName={reservedName}
          onSelect={selectSlot}
        />
      </div>

      {/* Itinerary */}
      <Itinerary cart={cart} conflicts={conflicts} isComplete={isComplete} onActivate={setActiveId} onContinue={onContinue} />

      <div aria-hidden="true" className="h-14 sm:h-20 lg:hidden" />
    </div>
  );
}
