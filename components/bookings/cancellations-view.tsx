"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { msgKey } from "@/src/i18n/message-key";
import type { AuthUser } from "@/lib/auth/dal";
import type { ListResult, AdminListConfig, RowActionItem } from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import type { ReservationAdmin } from "@/lib/bookings/admin-types";
import { ReservationMobileCard, reservationColumns } from "./reservation-render";

/**
 * Cancellations list — a clone of the reservations admin screen, defaulting to
 * the `canceled` status. Paid cancellations expose a "refund" action that
 * marks the order `refund` (gated on paymentReference).
 */
export function CancellationsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<ReservationAdmin>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const config: AdminListConfig<ReservationAdmin> = {
    namespace: "bookingCancellations",
    routeBase: "/dashboard/bookings/manage/cancellations",
    backHref: "/dashboard/bookings",
    addHref: "",
    listUrl: "/api/v1/bookings",
    defaultStatus: "canceled",
    permissions: {
      read: "appointments.read",
      write: "appointments.write",
      manage: "appointments.manage",
    },
    statusOptions: [
      { value: "all", labelKey: "bookingCancellations.statusAll" },
      { value: "canceled", labelKey: "bookingReservations.statuses.canceled" },
      { value: "refund", labelKey: "bookingReservations.statuses.refund" },
    ],
    columns: reservationColumns(),
    renderMobileCard: (row) => <ReservationMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => {
      const buttons: RowActionItem[] = [];
      if (row.status === "canceled" && row.paymentReference) {
        buttons.push({
          key: "refund",
          labelKey: "bookingCancellations.actions.refund",
          onClick: () => ctx.setConfirm({ kind: "row", action: "refund", row }),
          icon: "payment",
        });
      }
      buttons.push({
        key: "edit",
        labelKey: "bookingCancellations.actions.edit",
        onClick: () =>
          router.push(`/dashboard/bookings/manage/reservations/${row.id}/edit`),
        icon: "edit",
      });
      buttons.push({
        key: "delete",
        labelKey: "bookingCancellations.actions.delete",
        onClick: () => ctx.setConfirm({ kind: "row", action: "delete", row }),
        icon: "delete",
        danger: true,
      });
      return buttons;
    },
    statusPatch: (action) =>
      action === "refund" ? { status: "refund" } : {},
    confirmPhrase: (action) => ({
      title:
        action === "delete"
          ? t(msgKey("bookingCancellations.actions.deleteConfirm"))
          : t(msgKey("bookingCancellations.actions.refundConfirm")),
      description:
        action === "delete"
          ? t(msgKey("bookingCancellations.actions.deleteConfirmDescription"))
          : t(msgKey("bookingCancellations.actions.refundConfirmDescription")),
    }),
    bulkActions: [],
    executeBulk: () => Promise.resolve({ requested: 0, succeeded: 0, failures: [] }),
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
  };

  return <AdminListView config={config} user={user} initialData={initialData} />;
}