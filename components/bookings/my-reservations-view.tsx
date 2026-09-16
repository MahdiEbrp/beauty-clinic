"use client";

import { useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminListConfig,
  ListResult,
  RowActionItem,
} from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import type { MyReservationAdmin } from "@/lib/bookings/admin-types";
import type { MessageKey } from "@/src/i18n/message-key";
import { myReservationColumns, MyReservationMobileCard } from "./my-reservation-render";

/** Where the customer-facing list lives and how it talks to the API. */
export const MY_RESERVATIONS_ROUTE = "/dashboard/my-reservations";
export const MY_RESERVATIONS_API = "/api/v1/me/bookings";

const STATUS_OPTIONS: Array<{ value: string; labelKey: MessageKey }> = [
  { value: "all", labelKey: "bookingReservations.statusAll" },
  { value: "pending", labelKey: "bookingReservations.statuses.pending" },
  { value: "paid", labelKey: "bookingReservations.statuses.paid" },
  { value: "waiting", labelKey: "bookingReservations.statuses.waiting" },
  { value: "done", labelKey: "bookingReservations.statuses.done" },
  { value: "refunded", labelKey: "bookingReservations.statuses.refunded" },
];

/**
 * The customer's own reservations — the admin reservations list, cloned: same
 * header, filters, table and pagination. The differences are deliberate: the
 * status column is read-only, the customer column shows the owner themselves,
 * and the only row action cancels that one service line (disabled once the
 * clinic's cancellation window for that line has passed).
 */
export function MyReservationsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<MyReservationAdmin>;
}) {
  const t = useTranslations();

  const config: AdminListConfig<MyReservationAdmin> = {
    namespace: "myReservations",
    routeBase: MY_RESERVATIONS_ROUTE,
    backHref: "/dashboard",
    backLabelKey: "myReservations.back",
    // Customers never add reservations here; an empty addHref hides every
    // "add" affordance in the shared list chrome.
    addHref: "",
    listUrl: MY_RESERVATIONS_API,
    // No staff permission grants access to this list — it is scoped to the
    // caller's own orders instead (see lib/bookings/mine.ts).
    permissions: { read: "", write: "", manage: "" },
    statusOptions: STATUS_OPTIONS,
    columns: myReservationColumns(),
    renderMobileCard: (row) => <MyReservationMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => [
      {
        key: "cancel",
        labelKey: "myReservations.actions.cancel",
        onClick: () => ctx.setConfirm({ kind: "row", action: "cancel", row }),
        icon: "cancel",
        danger: true,
        disabled: !row.canCancel,
      },
    ],
    statusPatch: () => ({}),
    confirmPhrase: (_action, row) => ({
      title: t("myReservations.cancelConfirm.title"),
      description: t("myReservations.cancelConfirm.description", {
        group: row.groupTitle,
        groupRef: row.groupRef,
      }),
    }),
    bulkActions: [],
    executeBulk: () => Promise.resolve({ requested: 0, succeeded: 0, failures: [] }),
    itemUrl: (row) => `${MY_RESERVATIONS_API}/${row.id}`,
    deleteRow: () => Promise.reject(new Error("bookings_are_not_deleted")),
    // The shared confirm flow routes every non-"delete" action through
    // `patchRow`; here that means "cancel this service line".
    patchRow: async (row) => {
      const response = await fetch(`${MY_RESERVATIONS_API}/${row.id}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("cancel_failed");
    },
    perPage: 10,
  };

  return <AdminListView config={config} user={user} initialData={initialData} />;
}
