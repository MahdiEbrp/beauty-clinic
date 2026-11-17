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
import type { SlotAdminRow } from "@/lib/bookings/slots-admin";
import { SlotGenerationForm } from "./slot-generation-form";
import { SlotGroupsBulkEditor } from "./slot-groups-bulk-editor";
import { SlotMobileCard, slotColumns } from "./slot-render";

export function SlotsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<SlotAdminRow>;
}) {
  const router = useRouter();
  const t = useTranslations();
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
    renderBulkSelection: ({ ids, scope, filters, onComplete }) => <SlotGroupsBulkEditor ids={ids} scope={scope} filters={filters} onComplete={onComplete} />,
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
      <SlotGenerationForm />

      <AdminListView config={config} user={user} initialData={initialData} />
    </div>
  );
}
