"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListResult, AdminListConfig, RowActionItem } from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { ReservationMobileCard, reservationColumns } from "./reservation-render";

export function ReservationsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<ReservationAdmin>;
}) {
    const router = useRouter();
  const t = useTranslations();

  const config: AdminListConfig<ReservationAdmin> = {
    namespace: "bookingReservations",
    routeBase: "/dashboard/bookings/manage/reservations",
    backHref: "/dashboard/bookings",
    addHref: "/dashboard/bookings/manage/reservations/add",
    listUrl: "/api/v1/bookings",
    permissions: {
      read: "appointments.read",
      write: "appointments.write",
      manage: "appointments.manage",
    },
    statusOptions: [
      { value: "all", labelKey: "bookingReservations.statusAll" },
      { value: "pending", labelKey: "bookingReservations.statuses.pending" },
      { value: "confirmed", labelKey: "bookingReservations.statuses.confirmed" },
      { value: "paid", labelKey: "bookingReservations.statuses.paid" },
      { value: "cancelled", labelKey: "bookingReservations.statuses.cancelled" },
    ],
    columns: reservationColumns(),
    renderMobileCard: (row) => <ReservationMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => {
      const buttons: RowActionItem[] = [
        {
          key: "edit",
          labelKey: "bookingReservations.actions.edit",
          onClick: () =>
            router.push(`/dashboard/bookings/manage/reservations/${row.id}/edit`),
          icon: "edit",
        },
      ];
      if (row.status === "pending") {
        buttons.push({
          key: "confirm",
          labelKey: "bookingReservations.actions.confirm",
          onClick: () => ctx.setConfirm({ kind: "row", action: "confirm", row }),
          icon: "confirm",
        });
      }
      if (row.status !== "cancelled") {
        buttons.push({
          key: "cancel",
          labelKey: "bookingReservations.actions.cancel",
          onClick: () => ctx.setConfirm({ kind: "row", action: "cancel", row }),
          icon: "cancel",
        });
      }
      buttons.push({
        key: "delete",
        labelKey: "bookingReservations.actions.delete",
        onClick: () => ctx.setConfirm({ kind: "row", action: "delete", row }),
        icon: "delete",
        danger: true,
      });
      return buttons;
    },
    statusPatch: (action) =>
      action === "confirm" ? { status: "confirmed" } : { status: "cancelled" },
        confirmPhrase: (action) => ({
      title:
        action === "delete"
          ? t("bookingReservations.actions.deleteConfirm")
          : t("bookingReservations.bulk.confirmTitle", {
              action:
                action === "confirm"
                  ? t("bookingReservations.bulk.confirm")
                  : t("bookingReservations.bulk.cancel"),
            }),
      description: t("bookingReservations.bulk.confirmDescription"),
    }),
    bulkActions: [
      { key: "confirm", labelKey: "bookingReservations.bulk.confirm" },
      { key: "cancel", labelKey: "bookingReservations.bulk.cancel" },
      { key: "delete", labelKey: "bookingReservations.bulk.delete", dangerous: true },
    ],
    executeBulk: async (action, ids, filters) => {
      const res = await fetch("/api/v1/bookings/bulk", {
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
      const payload = (await res.json()) as { data: { requested: number; succeeded: number; failures: Array<{ id: string; code: string }> } };
      return payload.data;
    },
    itemUrl: (row) => `/api/v1/bookings/${row.id}`,
    deleteRow: async (row) => {
      const res = await fetch(`/api/v1/bookings/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
    },
    patchRow: async (row, patch) => {
      const res = await fetch(`/api/v1/bookings/${row.id}`, {
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
