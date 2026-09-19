"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminListConfig,
  ListResult,
  RowActionItem,
} from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import type { WorkingHoursListRow } from "@/lib/bookings/working-hours-admin";
import {
  WorkingHoursMobileCard,
  workingHoursColumns,
} from "./working-hours-render";

export function WorkingHoursListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<WorkingHoursListRow>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const config: AdminListConfig<WorkingHoursListRow> = {
    namespace: "workingHours",
    routeBase: "/dashboard/working-hours",
    backHref: "/dashboard/bookings",
    addHref: "/dashboard/working-hours/add",
    listUrl: "/api/v1/working-hours/list",
    permissions: {
      read: "appointments.read",
      write: "appointments.write",
      manage: "appointments.manage",
    },
    statusOptions: [
      { value: "all", labelKey: "workingHours.statusAll" },
      { value: "active", labelKey: "workingHours.statuses.active" },
      { value: "inactive", labelKey: "workingHours.statuses.inactive" },
    ],
    columns: workingHoursColumns(),
    renderMobileCard: (row) => <WorkingHoursMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => [
      {
        key: "edit",
        labelKey: "workingHours.actions.edit",
        onClick: () => router.push(`/dashboard/working-hours/${row.id}/edit`),
        icon: "edit",
      },
      {
        key: "slots",
        labelKey: "workingHours.actions.slots",
        onClick: () => router.push(`/dashboard/working-hours/${row.id}/slots`),
        icon: "slots",
      },
      row.isActive
        ? {
            key: "deactivate",
            labelKey: "workingHours.actions.deactivate",
            onClick: () => ctx.setConfirm({ kind: "row", action: "deactivate", row }),
            icon: "deactivate",
          }
        : {
            key: "activate",
            labelKey: "workingHours.actions.activate",
            onClick: () => ctx.setConfirm({ kind: "row", action: "activate", row }),
            icon: "activate",
          },
      {
        key: "delete",
        labelKey: "workingHours.actions.delete",
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
          ? t("workingHours.actions.deleteConfirm")
          : t("workingHours.bulk.confirmTitle", {
              action:
                action === "activate"
                  ? t("workingHours.bulk.activate")
                  : t("workingHours.bulk.deactivate"),
            }),
      description: t("workingHours.bulk.confirmDescription"),
    }),
    bulkActions: [
      { key: "activate", labelKey: "workingHours.bulk.activate" },
      { key: "deactivate", labelKey: "workingHours.bulk.deactivate" },
      { key: "delete", labelKey: "workingHours.bulk.delete", dangerous: true },
    ],
    executeBulk: async (action, ids, filters) => {
      const res = await fetch("/api/v1/working-hours/bulk", {
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
    itemUrl: (row) => `/api/v1/working-hours/${row.id}`,
    deleteRow: async (row) => {
      const res = await fetch(`/api/v1/working-hours/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
    },
    patchRow: async (row, patch) => {
      const res = await fetch(`/api/v1/working-hours/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("patch_failed");
    },
    perPage: 10,
  };

  return <AdminListView config={config} user={user} initialData={initialData} />;
}