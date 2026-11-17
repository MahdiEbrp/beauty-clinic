"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/src/i18n/navigation";
import { Clock, Plus } from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminListConfig,
  ListResult,
  RowActionItem,
} from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { SlotMobileCard, slotColumns } from "./slot-render";
import { Field } from "@/components/bookings/wizard-fields";
import { inputClass } from "@/components/bookings/wizard-fields";
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

export function SlotsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<SlotAdminRow>;
}) {
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

  const config: AdminListConfig<SlotAdminRow> = {
    namespace: "bookingSlots",
    routeBase: "/dashboard/slots",
    backHref: "/dashboard/bookings",
    addHref: "/dashboard/slots/add",
    listUrl: "/api/v1/bookings/slots/list",
    // No automatic "generate all" — slots are generated only via the
    // date-range form below, never automatically.
    headerAction: undefined,
    permissions: {
      read: "appointments.read",
      write: "appointments.write",
      manage: "appointments.manage",
    },
    statusOptions: [
      { value: "all", labelKey: "bookingSlots.statusAll" },
      { value: "active", labelKey: "bookingSlots.statuses.active" },
      { value: "inactive", labelKey: "bookingSlots.statuses.inactive" },
      { value: "expired", labelKey: "bookingSlots.statuses.expired" },
    ],
    columns: slotColumns(),
    renderMobileCard: (row) => <SlotMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => [
      {
        key: "edit",
        labelKey: "bookingSlots.actions.edit",
        onClick: () => router.push(`/dashboard/slots/${row.id}/edit`),
        icon: "edit",
      },
      row.isActive
        ? {
            key: "deactivate",
            labelKey: "bookingSlots.actions.deactivate",
            onClick: () => ctx.setConfirm({ kind: "row", action: "deactivate", row }),
            icon: "deactivate",
          }
        : {
            key: "activate",
            labelKey: "bookingSlots.actions.activate",
            onClick: () => ctx.setConfirm({ kind: "row", action: "activate", row }),
            icon: "activate",
          },
      {
        key: "delete",
        labelKey: "bookingSlots.actions.delete",
        onClick: () => ctx.setConfirm({ kind: "row", action: "delete", row }),
        icon: "delete",
        danger: true,
      },
    ],
    statusPatch: (action) =>
      action === "activate" ? { isActive: true } : { isActive: false },
    confirmPhrase: (action) => ({
      title:
        action === "delete"
          ? t("bookingSlots.actions.deleteConfirm")
          : t("bookingSlots.bulk.confirmTitle", {
              action:
                action === "activate"
                  ? t("bookingSlots.bulk.activate")
                  : t("bookingSlots.bulk.deactivate"),
            }),
      description: t("bookingSlots.bulk.confirmDescription"),
    }),
    renderBulkSelection: ({ ids, scope, onComplete }) => <SlotGroupsBulkEditor ids={ids} scope={scope} onComplete={onComplete} />,
    bulkActions: [
      { key: "activate", labelKey: "bookingSlots.bulk.activate" },
      { key: "deactivate", labelKey: "bookingSlots.bulk.deactivate" },
      { key: "delete", labelKey: "bookingSlots.bulk.delete", dangerous: true },
    ],
    executeBulk: async (action, ids, filters) => {
      const res = await fetch("/api/v1/bookings/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          scope: ids.length > 0 ? ("page" as const) : ("filtered" as const),
          ids,
          filters: { search: filters.search, status: filters.status },
        }),
      });
      if (!res.ok) throw new Error("bulk_failed");
      const payload = (await res.json()) as {
        data: { requested: number; succeeded: number; failures: Array<{ id: string; code: string }> };
      };
      return payload.data;
    },
    itemUrl: (row) => `/api/v1/bookings/slots/${row.id}`,
    deleteRow: async (row) => {
      const res = await fetch(`/api/v1/bookings/slots/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
    },
    patchRow: async (row, patch) => {
      const res = await fetch(`/api/v1/bookings/slots/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("patch_failed");
    },
    perPage: 10,
  };

  return (
    <div className="space-y-6">
      {/* Date-range generator card — always visible, including on mobile */}
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

      <AdminListView config={config} user={user} initialData={initialData} />
    </div>
  );
}


function SlotGroupsBulkEditor({ ids, scope, onComplete }: { ids: string[]; scope: "page" | "filtered"; onComplete: () => void }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const openEditor = async () => {
    setOpen(true);
    if (groups.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/v1/service-groups?page=1&perPage=100&status=all", { credentials: "include" });
      if (!res.ok) throw new Error("load");
      const payload = (await res.json()) as { data: { items: Array<{ id: string; name: string }> } };
      setGroups(payload.data.items);
    } catch {
      toast.error(t("bookingSlots.bulk.groupsLoadError"));
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/v1/bookings/slots/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "groups",
          scope,
          ids: scope === "page" ? ids : undefined,
          filters: scope === "filtered" ? { search: "", status: "all" } : undefined,
          groupIds: selected,
        }),
      });
      if (!res.ok) throw new Error("save");
      const payload = (await res.json()) as { data: { succeeded: number; failures: Array<unknown> } };
      if (payload.data.failures.length) toast.error(t("bookingSlots.bulk.groupsPartial", { succeeded: payload.data.succeeded, failed: payload.data.failures.length }));
      else toast.success(t("bookingSlots.bulk.groupsSuccess", { count: payload.data.succeeded }));
      setOpen(false);
      onComplete();
    } catch {
      toast.error(t("bookingSlots.toast.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => void openEditor()} className="min-h-10 rounded-pill border border-border-interactive px-4 text-dash-caption font-bold text-accent">
        {t("bookingSlots.bulk.editGroups")}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section role="dialog" aria-modal="true" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-panel border border-border-primary bg-surface-secondary p-5 shadow-elevation-3">
            <h2 className="text-dash-title font-bold text-content-primary">{t("bookingSlots.bulk.editGroups")}</h2>
            <p className="mt-2 text-dash-body-sm text-content-secondary">{t("bookingSlots.bulk.groupsDescription", { count: ids.length })}</p>
            {busy && groups.length === 0 ? <p className="py-6">{t("bookingSlots.loading")}</p> : (
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center gap-3 rounded-control border border-border-primary px-3 py-2 text-dash-body-sm">
                    <input type="checkbox" checked={selected.includes(group.id)} onChange={(event) => setSelected((old) => event.target.checked ? [...old, group.id] : old.filter((id) => id !== group.id))} />
                    {group.name}
                  </label>
                ))}
              </div>
            )}
            <p className="mt-3 text-dash-caption text-content-tertiary">{t("bookingSlots.bulk.groupsAllHint")}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setSelected([])} className="min-h-10 px-3 text-dash-caption">{t("bookingSlots.bulk.clearGroups")}</button>
              <button type="button" disabled={busy} onClick={() => setOpen(false)} className="min-h-10 px-3 text-dash-caption">{t("bookingSlots.dialog.cancel")}</button>
              <button type="button" disabled={busy || groups.length === 0} onClick={() => void save()} className="min-h-10 rounded-pill bg-accent px-4 text-dash-caption font-bold text-content-contrast">{t("bookingSlots.dialog.confirm")}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
