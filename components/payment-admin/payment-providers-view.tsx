"use client";

import { useTranslations } from "next-intl";
import { msgKey } from "@/src/i18n/message-key";
import { useRouter } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type {
  AdminListConfig,
  ListResult,
  RowActionItem,
} from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import type { PaymentProviderAdmin } from "@/lib/payment/admin-types";
import {
  providerColumns,
  PaymentProviderMobileCard,
} from "./provider-render";

export function PaymentProvidersListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<PaymentProviderAdmin>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const config: AdminListConfig<PaymentProviderAdmin> = {
    namespace: "paymentAdmin",
    routeBase: "/dashboard/payment/providers",
    backHref: "/dashboard/payment",
    addHref: "/dashboard/payment/providers/add",
    listUrl: PAYMENT_API_ROUTES.providers,
    permissions: {
      read: "payment.read",
      write: "payment.write",
      manage: "payment.manage",
    },
    statusOptions: [
      { value: "all", labelKey: "paymentAdmin.statusAll" },
      { value: "active", labelKey: "paymentAdmin.statuses.active" },
      { value: "inactive", labelKey: "paymentAdmin.statuses.inactive" },
    ],
    columns: providerColumns(),
    renderMobileCard: (row) => <PaymentProviderMobileCard row={row} />,
    rowActionButtons: (row, ctx): RowActionItem[] => [
      {
        key: "edit",
        labelKey: "paymentAdmin.actions.edit",
        onClick: () =>
          router.push(`/dashboard/payment/providers/${row.id}/edit`),
        icon: "edit",
      },
      {
        key: "delete",
        labelKey: "paymentAdmin.actions.delete",
        onClick: () => ctx.setConfirm({ kind: "row", action: "delete", row }),
        icon: "delete",
        danger: true,
      },
    ],
    statusPatch: (action) => {
      if (action === "activate") return { isActive: true };
      if (action === "deactivate") return { isActive: false };
      return {};
    },
    confirmPhrase: (action, row) => {
      if (action === "delete") {
        return {
          title: t("paymentAdmin.actions.deleteConfirm"),
          description: t("paymentAdmin.bulk.confirmDescription"),
        };
      }
      const to = action === "activate" ? "active" : "inactive";
      const from = action === "activate" ? "inactive" : "active";
      const toLabel = t(msgKey(`paymentAdmin.statuses.${to}`));
      return {
        title: t(msgKey("paymentAdmin.statusConfirm.title"), {
          status: `${toLabel} "${row.name}"`,
        }),
        description: t(msgKey("paymentAdmin.statusConfirm.description"), {
          from: t(msgKey(`paymentAdmin.statuses.${from}`)),
          to: toLabel,
        }),
      };
    },
    bulkActions: [
      {
        key: "activate",
        labelKey: "paymentAdmin.bulk.activate",
      },
      {
        key: "deactivate",
        labelKey: "paymentAdmin.bulk.deactivate",
      },
      {
        key: "delete",
        labelKey: "paymentAdmin.bulk.delete",
        dangerous: true,
      },
    ],
    executeBulk: async (action, ids, filters, scope) => {
      const res = await fetch(`${PAYMENT_API_ROUTES.providers}/bulk`, {
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
      const payload = (await res.json()) as {
        data: {
          requested: number;
          succeeded: number;
          failures: Array<{ id: string; code: string }>;
        };
      };
      return payload.data;
    },
    itemUrl: (row) => `${PAYMENT_API_ROUTES.providers}/${row.id}`,
    deleteRow: async (row) => {
      const res = await fetch(`${PAYMENT_API_ROUTES.providers}/${row.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete_failed");
    },
    patchRow: async (row, patch) => {
      const res = await fetch(`${PAYMENT_API_ROUTES.providers}/${row.id}`, {
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