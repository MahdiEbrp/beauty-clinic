"use client";

import { useTranslations } from "next-intl";
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
  { value: "verified", labelKey: "paymentTransactions.statuses.verified" },
];

export function PaymentTransactionsListView({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListResult<PaymentTransactionAdmin>;
}) {
  const t = useTranslations();

  const config: AdminListConfig<PaymentTransactionAdmin> = {
    namespace: "paymentTransactions",
    routeBase: "/dashboard/payment/transactions",
    backHref: "/dashboard/payment",
    addHref: "",
    listUrl: PAYMENT_API_ROUTES.transactions,
    permissions: {
      read: "payment.read",
      write: "payment.history.readonly",
      manage: "payment.manage",
    },
    statusOptions: TX_STATUS_OPTIONS,
    defaultStatus: "verified",
    columns: transactionColumns(),
    renderMobileCard: (row) => <TransactionMobileCard row={row} />,
    rowActionButtons: (): RowActionItem[] => [],
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