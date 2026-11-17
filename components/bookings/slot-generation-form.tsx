"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { Clock, Plus } from "lucide-react";
import { Field, inputClass } from "./wizard-fields";
import { DatePickerField } from "@/components/date-time-picker/date-picker-field";
import { TimePickerField } from "@/components/date-time-picker/time-picker-field";

const WEEKDAYS = [
  { key: "Saturday", label: "bookingSlots.weekdays.saturday" },
  { key: "Sunday", label: "bookingSlots.weekdays.sunday" },
  { key: "Monday", label: "bookingSlots.weekdays.monday" },
  { key: "Tuesday", label: "bookingSlots.weekdays.tuesday" },
  { key: "Wednesday", label: "bookingSlots.weekdays.wednesday" },
  { key: "Thursday", label: "bookingSlots.weekdays.thursday" },
  { key: "Friday", label: "bookingSlots.weekdays.friday" },
] as const;

export function SlotGenerationForm() {
  const router = useRouter();
  const t = useTranslations();
  const [generating, setGenerating] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [opens, setOpens] = useState("09:00");
  const [closes, setCloses] = useState("17:00");
  const [intervalMin, setIntervalMin] = useState("30");
  const [durationMin, setDurationMin] = useState("30");
  const [capacity, setCapacity] = useState("1");

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const isDaySelected = (day: string) => selectedDays.includes(day);

  const formValid =
    /^\d{4}-\d{2}-\d{2}$/.test(fromDate) &&
    /^\d{4}-\d{2}-\d{2}$/.test(toDate) &&
    toDate >= fromDate &&
    selectedDays.length > 0 &&
    /^\d{2}:\d{2}$/.test(opens) &&
    /^\d{2}:\d{2}$/.test(closes) &&
    closes > opens &&
    Number(intervalMin) >= 5 &&
    Number(durationMin) >= 5 &&
    Number(intervalMin) >= Number(durationMin) &&
    Number(capacity) >= 1;

  const handleBulkGenerate = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/bookings/slots/generate-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fromDate,
          toDate,
          daysOfWeek: selectedDays,
          opens,
          closes,
          intervalMin: Number(intervalMin),
          durationMin: Number(durationMin),
          capacity: Number(capacity),
        }),
      });
      if (!res.ok) throw new Error("generate_failed");
      const result = (await res.json()) as { data: { length: number } };
      const count = result.data?.length ?? 0;
      toast.success(t("bookingSlots.toast.generated", { count }));
      router.refresh();
    } catch {
      toast.error(t("bookingSlots.toast.generateError"));
    } finally {
      setGenerating(false);
    }
  };

  return (
      <section className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-dash-title font-bold tracking-tight text-content-primary">
            {t("bookingSlots.bulkGenerate.title")}
          </h2>
        </div>
        <p className="max-w-2xl text-dash-body text-content-secondary mb-4">
          {t("bookingSlots.bulkGenerate.description")}
        </p>
        <form onSubmit={(event) => void handleBulkGenerate(event)} className="space-y-4">
          {/* Date range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("bookingSlots.bulkGenerate.fields.fromDate.label")}>
              <DatePickerField
                value={fromDate}
                onChange={setFromDate}
                locale="fa"
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label={t("bookingSlots.bulkGenerate.fields.toDate.label")}>
              <DatePickerField
                value={toDate}
                onChange={setToDate}
                locale="fa"
              />
            </Field>
          </div>

          {/* Weekdays */}
          <Field label={t("bookingSlots.bulkGenerate.fields.days.label")}>
            <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  role="checkbox"
                  aria-checked={isDaySelected(day.key)}
                  onClick={() => toggleDay(day.key)}
                  className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-control border px-2 py-3 text-center text-dash-body-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isDaySelected(day.key)
                      ? "bg-accent text-content-contrast border-accent"
                      : "border-border-primary bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <Clock className="size-4 shrink-0" aria-hidden="true" />
                  <span className="text-[10px] leading-tight">
                    {t(day.label)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-dash-caption text-content-tertiary">
              {t("bookingSlots.bulkGenerate.fields.days.hint")}
            </p>
          </Field>

          {/* Time window */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("bookingSlots.bulkGenerate.fields.opens.label")}>
              <TimePickerField value={opens} onChange={setOpens} />
            </Field>
            <Field label={t("bookingSlots.bulkGenerate.fields.closes.label")}>
              <TimePickerField value={closes} onChange={setCloses} />
            </Field>
          </div>

          {/* Interval, duration, capacity */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label={t("bookingSlots.bulkGenerate.fields.interval.label")}
              hint={t("bookingSlots.bulkGenerate.fields.interval.hint")}
            >
              <input
                type="number"
                min={5}
                max={1440}
                required
                value={intervalMin}
                onChange={(event) => setIntervalMin(event.target.value)}
                className={inputClass(Number(intervalMin) >= 5)}
              />
            </Field>
            <Field
              label={t("bookingSlots.bulkGenerate.fields.duration.label")}
              hint={t("bookingSlots.bulkGenerate.fields.duration.hint")}
            >
              <input
                type="number"
                min={5}
                max={1440}
                required
                value={durationMin}
                onChange={(event) => setDurationMin(event.target.value)}
                className={inputClass(Number(durationMin) >= 5)}
              />
            </Field>
            <Field
              label={t("bookingSlots.bulkGenerate.fields.capacity.label")}
              hint={t("bookingSlots.bulkGenerate.fields.capacity.hint")}
            >
              <input
                type="number"
                min={1}
                max={500}
                required
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className={inputClass(Number(capacity) >= 1)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <button
              type="submit"
              disabled={generating || !formValid}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Plus className="size-4" aria-hidden="true" />
              {generating
                ? t("bookingSlots.bulkGenerate.actions.generating")
                : t("bookingSlots.bulkGenerate.actions.generate")}
            </button>
          </div>
        </form>
      </section>
  );
}
