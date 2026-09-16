"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import type { AuthUser } from "@/lib/auth/dal";
import type { MessageKey } from "@/src/i18n/message-key";
import { PAYMENT_API_ROUTES } from "@/lib/payment/constants";
import type { PaymentTransactionAdmin } from "@/lib/payment/admin-types";
import type {
  AdminListConfig,
  ListResult,
  RowActionItem,
} from "@/components/admin-list/types";
import { AdminListView } from "@/components/admin-list/list-view";
import { transactionColumns, TransactionMobileCard } from "./transaction-render";

const TX_STATUS_OPTIONS: Array<{ value: string; labelKey: MessageKey }> = [
  { value: "all", labelKey: "paymentTransactions.statusAll" },
  { value: "pending", labelKey: "paymentTransactions.statuses.pending" },
  { value: "requested", labelKey: "paymentTransactions.statuses.requested" },
  { value: "verified", labelKey: "paymentTransactions.statuses.verified" },
  { value: "failed", labelKey: "paymentTransactions.statuses.failed" },
  { value: "refunded", labelKey: "paymentTransactions.statuses.refunded" },
  { value: "cancelled", labelKey: "paymentTransactions.statuses.cancelled" },
];

export function PaymentTransactionsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<PaymentTransactionAdmin>;
}) {
  const router = useRouter();
  const t = useTranslations();

  const config: AdminListConfig<PaymentTransactionAdmin> = {
    namespace: "paymentTransactions",
    routeBase: "/dashboard/payment/transactions",
    backHref: "/dashboard/payment",
    addHref: "/dashboard/payment/transactions/add",
    listUrl: PAYMENT_API_ROUTES.transactions,
    permissions: {
      read: "payment.read",
      write: "payment.send",
      manage: "payment.manage",
    },
    statusOptions: TX_STATUS_OPTIONS,
    columns: transactionColumns(),
    renderMobileCard: (row) => <TransactionMobileCard row={row} />,
    rowActionButtons: (row): RowActionItem[] => [
      {
        key: "edit",
        labelKey: "paymentAdmin.actions.edit",
        onClick: () => router.push(`/dashboard/payment/transactions/${row.id}/edit`),
        icon: "edit",
      },
    ],
    statusPatch: () => ({}),
    confirmPhrase: (action) => ({
      title: "",
      description: t("paymentTransactions.confirmDescription", { action }),
    }),
    bulkActions: [],
    executeBulk: () => Promise.resolve({ requested: 0, succeeded: 0, failures: [] }),
    itemUrl: (row) => `${PAYMENT_API_ROUTES.transactions}/${row.id}`,
    deleteRow: () => Promise.reject(new Error("transactions_cannot_delete")),
    patchRow: () => Promise.reject(new Error("transactions_cannot_patch")),
    perPage: 20,
  };

  return <AdminListView config={config} user={user} initialData={initialData} />;
}