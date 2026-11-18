"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
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
      { value: "paid", labelKey: "bookingReservations.statuses.paid" },
      { value: "waiting", labelKey: "bookingReservations.statuses.waiting" },
      { value: "done", labelKey: "bookingReservations.statuses.done" },
      { value: "refunded", labelKey: "bookingReservations.statuses.refunded" },
    ],
    columns: reservationColumns(),
    renderMobileCard: (row) => <ReservationMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => [
      {
        key: "edit",
        labelKey: "bookingReservations.actions.edit",
        onClick: () =>
          router.push(`/dashboard/bookings/manage/reservations/${row.id}/edit`),
        icon: "edit",
      },
      {
        key: "delete",
        labelKey: "bookingReservations.actions.delete",
        onClick: () => ctx.setConfirm({ kind: "row", action: "delete", row }),
        icon: "delete",
        danger: true,
      },
    ],
    statusPatch: (action) =>
      action.startsWith("status:") ? { status: action.slice(7) } : {},
    confirmPhrase: (action, row) => {
      if (!action.startsWith("status:")) {
        return {
          title: t("bookingReservations.actions.deleteConfirm"),
          description: t("bookingReservations.bulk.confirmDescription"),
        };
      }
      const next = action.slice(7);
      return {
        title: t(msgKey("bookingReservations.statusConfirm.title") , {
          status: t(msgKey(`bookingReservations.statuses.${next}`)),
        }),
        description: t(msgKey("bookingReservations.statusConfirm.description"), {
          from: t(msgKey(`bookingReservations.statuses.${row.status}`)),
          to: t(msgKey(`bookingReservations.statuses.${next}`)),
        }),
      };
    },
    bulkActions: [
      { key: "pay", labelKey: "bookingReservations.bulk.pay" },
      { key: "done", labelKey: "bookingReservations.bulk.done" },
      { key: "refund", labelKey: "bookingReservations.bulk.refund" },
      { key: "delete", labelKey: "bookingReservations.bulk.delete", dangerous: true },
    ],
    executeBulk: async (action, ids, filters, scope) => {
      const res = await fetch("/api/v1/bookings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          scope,
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
