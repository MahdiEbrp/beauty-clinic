"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { Link } from "@/src/i18n/navigation";

import { CalendarDays, Clock, Plus } from "lucide-react";

import { Field } from "@/components/bookings/wizard-fields";
import { inputClass } from "@/components/bookings/wizard-fields";
import { DatePickerField } from "@/components/date-time-picker/date-picker-field";
import { TimePickerField } from "@/components/date-time-picker/time-picker-field";
import { GroupMultiSelect, type GroupOption } from "@/components/bookings/group-multi-select";

const WEEKDAYS = [
  { key: "Saturday", label: "bookingSlots.weekdays.saturday" },
  { key: "Sunday", label: "bookingSlots.weekdays.sunday" },
  { key: "Monday", label: "bookingSlots.weekdays.monday" },
  { key: "Tuesday", label: "bookingSlots.weekdays.tuesday" },
  { key: "Wednesday", label: "bookingSlots.weekdays.wednesday" },
  { key: "Thursday", label: "bookingSlots.weekdays.thursday" },
  { key: "Friday", label: "bookingSlots.weekdays.friday" },
] as const;

export default function BulkGenerateSlotsPage() {
  const t = useTranslations("bookingSlots");
  const tRoot = useTranslations();
  const locale = useLocale() as "fa" | "en";
  const router = useRouter();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [opens, setOpens] = useState("09:00");
  const [closes, setCloses] = useState("17:00");
  const [intervalMin, setIntervalMin] = useState("30");
  const [durationMin, setDurationMin] = useState("30");
  const [capacity, setCapacity] = useState("1");
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/service-groups?perPage=100&status=active", {
          credentials: "include",
        });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          data: { items: Array<{ id: string; name: string }> };
        };
        if (active) {
          setGroups(payload.data.items.map((item) => ({ id: item.id, title: item.name })));
        }
      } catch {
        // group list is optional
      } finally {
        if (active) setGroupsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

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

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setSubmitting(true);
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
          groupIds: groupIds.length > 0 ? groupIds : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const result = (await res.json()) as { data: { length: number } };
      const count = result.data?.length ?? 0;
      toast.success(tRoot("bookingSlots.toast.generated", { count }));
      router.push("/dashboard/slots");
      router.refresh();
    } catch {
      toast.error(tRoot("bookingSlots.toast.generateError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/slots"
        className="inline-flex min-h-11 items-center gap-1.5 self-start text-dash-body-sm font-semibold text-content-secondary no-underline transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <CalendarDays className="size-4 rtl-mirror" aria-hidden="true" />
        {tRoot("bookingAdmin.back")}
      </Link>

      <header className="space-y-3">
        <h1 className="text-dash-display font-bold tracking-tight text-accent">
          {t("bulkGenerate.title")}
        </h1>
        <p className="max-w-2xl text-dash-body text-content-secondary">
          {t("bulkGenerate.description")}
        </p>
      </header>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div className="rounded-panel border border-surface-variant/50 bg-surface-secondary p-5 shadow-elevation-2 sm:p-6">
          {/* Date range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("bulkGenerate.fields.fromDate.label")}>
              <DatePickerField
                value={fromDate}
                onChange={setFromDate}
                locale={locale === "fa" ? "fa" : "en"}
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label={t("bulkGenerate.fields.toDate.label")}>
              <DatePickerField
                value={toDate}
                onChange={setToDate}
                locale={locale === "fa" ? "fa" : "en"}
              />
            </Field>
          </div>

          {/* Weekdays */}
          <Field label={t("bulkGenerate.fields.days.label")}>
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
                    {tRoot(day.label)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-dash-caption text-content-tertiary">
              {t("bulkGenerate.fields.days.hint")}
            </p>
          </Field>

          {/* Time window */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("bulkGenerate.fields.opens.label")}>
              <TimePickerField value={opens} onChange={setOpens} />
            </Field>
            <Field label={t("bulkGenerate.fields.closes.label")}>
              <TimePickerField value={closes} onChange={setCloses} />
            </Field>
          </div>

          {/* Interval, duration, capacity */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("bulkGenerate.fields.interval.label")} hint={t("bulkGenerate.fields.interval.hint")}>
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
            <Field label={t("bulkGenerate.fields.duration.label")} hint={t("bulkGenerate.fields.duration.hint")}>
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
            <Field label={t("bulkGenerate.fields.capacity.label")} hint={t("bulkGenerate.fields.capacity.hint")}>
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

          {/* Groups */}
          <Field label={t("bulkGenerate.fields.groups.label")}>
            <GroupMultiSelect
              options={groups}
              selected={groupIds}
              onChange={setGroupIds}
              loading={groupsLoading}
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void router.push("/dashboard/slots")}
            disabled={submitting}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {tRoot("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting || !formValid}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-5 py-2.5 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-4" aria-hidden="true" />
            {submitting ? t("bulkGenerate.actions.generating") : t("bulkGenerate.actions.generate")}
          </button>
        </div>
      </form>
    </div>
  );
}
