"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarPlus, Clock, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/bookings/dates";
import { cn } from "@/lib/utils";
import { createSlots, deleteSlot, updateSlot, type SlotAdmin } from "./api";

type DaySlotPanelProps = {
  dateKey: string;
  slots: SlotAdmin[];
  onChanged: () => void;
};

const inputClass =
  "w-full bg-form-input-bg border border-form-input-border rounded-control px-3 py-2 text-dash-body-sm text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function DaySlotPanel({ dateKey, slots, onChanged }: DaySlotPanelProps) {
  const t = useTranslations("bookingAdmin.calendar.panel");
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");
  const [capacity, setCapacity] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSlot = async () => {
    setSaving(true);
    setError(null);
    try {
      await createSlots([
        {
          slotDate: dateKey,
          startTime: start,
          endTime: end,
          capacity: Math.max(1, Number(capacity) || 1),
        },
      ]);
      setStart(end);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors"));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (slot: SlotAdmin) => {
    try {
      await updateSlot(slot.id, { isActive: !slot.isActive });
      onChanged();
    } catch {
      setError(t("errors"));
    }
  };

  const remove = async (slot: SlotAdmin) => {
    try {
      await deleteSlot(slot.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors"));
    }
  };

  return (
    <section aria-label={t("label")} className="rounded-card border border-border-primary bg-surface-secondary p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-dash-title font-bold text-accent">{t("label")}</h3>
        <span className="text-dash-caption text-content-tertiary" dir="ltr">
          {dateKey}
        </span>
      </div>

      <div className="space-y-2">
        {slots.length === 0 ? (
          <div className="rounded-control border border-dashed border-border-interactive bg-surface-primary px-4 py-8 text-center text-dash-body-sm text-content-secondary">
            {t("empty")}
          </div>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-control border px-3 py-2",
                slot.isActive
                  ? "border-border-primary bg-surface-primary"
                  : "border-border-primary bg-surface-tertiary/50 opacity-70",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-control bg-surface-tertiary text-copper-strong">
                  <Clock className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-dash-body-sm font-bold text-accent" dir="ltr">
                    {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                  </p>
                  <p className="text-dash-caption text-content-tertiary">
                    {t("capacity", { booked: slot.bookedCount, total: slot.capacity })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void toggle(slot)}
                  aria-pressed={slot.isActive}
                  aria-label={slot.isActive ? t("deactivate") : t("activate")}
                  className={cn(
                    "min-h-11 rounded-pill px-3 text-dash-caption font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    slot.isActive
                      ? "bg-accent/10 text-accent hover:bg-accent/20"
                      : "bg-surface-tertiary text-content-tertiary hover:text-accent",
                  )}
                >
                  {slot.isActive ? t("active") : t("inactive")}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(slot)}
                  aria-label={t("remove")}
                  className="inline-flex size-11 items-center justify-center rounded-control text-error transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 border-t border-border-primary pt-4">
        <p className="mb-3 flex items-center gap-2 text-dash-body-sm font-bold text-accent">
          <CalendarPlus className="size-4" aria-hidden="true" />
          {t("add")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-dash-caption text-content-tertiary">{t("start")}</span>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-dash-caption text-content-tertiary">{t("end")}</span>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-dash-caption text-content-tertiary">{t("capacityLabel")}</span>
            <input
              type="number"
              min={1}
              max={500}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className={inputClass}
              inputMode="numeric"
            />
          </label>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-dash-body-sm text-error">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void addSlot()}
          disabled={saving}
          className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-copper px-6 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition-all hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {t("create")}
        </button>
      </div>
    </section>
  );
}
