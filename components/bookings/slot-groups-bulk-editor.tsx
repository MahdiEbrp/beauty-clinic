"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function SlotGroupsBulkEditor({ ids, scope, filters, onComplete }: { ids: string[]; scope: "page" | "filtered"; filters: { search: string; status: string }; onComplete: () => void }) {
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
          filters: scope === "filtered" ? filters : undefined,
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
