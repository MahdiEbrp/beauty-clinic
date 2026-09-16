"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { Column } from "@/components/admin-list/types";
import type { PaymentTransactionAdmin } from "@/lib/payment/admin-types";
import type { PaymentTransactionStatus } from "@/src/db/schema";
import { msgKey } from "@/src/i18n/message-key";
import { formatPaymentDate } from "./payment-format";

export function transactionColumns(): Column<PaymentTransactionAdmin>[] {
  return [
    {
      key: "groupRef",
      labelKey: "paymentTransactions.table.groupRef",
      render: (row) => <TransactionCell row={row} />,
    },
    {
      key: "amount",
      labelKey: "paymentTransactions.table.amount",
      responsive: "desktop",
      render: (row) => <AmountCell row={row} />,
    },
    {
      key: "status",
      labelKey: "paymentTransactions.table.status",
      render: (row) => <TransactionStatusBadge status={row.status} />,
    },
    {
      key: "date",
      labelKey: "paymentTransactions.table.date",
      responsive: "desktop",
      render: (row) => <DateCell row={row} />,
    },
  ];
}

const STATUS_STYLES: Record<PaymentTransactionStatus, string> = {
  verified: "bg-success/10 text-success",
  pending: "bg-surface-tertiary text-content-secondary",
  requested: "bg-surface-tertiary text-content-secondary",
  failed: "bg-error/10 text-error",
  refunded: "bg-warning/10 text-warning",
  cancelled: "bg-surface-tertiary text-content-secondary",
};

export function TransactionStatusBadge({ status }: { status: PaymentTransactionStatus }) {
  const t = useTranslations();
  return (
    <span className={`inline-flex w-fit items-center rounded-pill px-2 py-0.5 text-dash-caption font-bold ${STATUS_STYLES[status] ?? "bg-surface-tertiary text-content-secondary"}`}>
      {t(msgKey(`paymentTransactions.statuses.${status}`))}
    </span>
  );
}

function TransactionCell({ row }: { row: PaymentTransactionAdmin }) {
  const t = useTranslations();
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-semibold text-content-primary" dir="ltr">{row.bookingGroupRef}</span>
      <span className="truncate text-dash-caption text-content-tertiary">
        {row.providerName ? row.providerName : t(msgKey("paymentTransactions.providerNone"))}
      </span>
    </div>
  );
}

function AmountCell({ row }: { row: PaymentTransactionAdmin }) {
  const format = useFormatter();
  return (
    <span className="whitespace-nowrap font-medium text-content-primary">
      {format.number(Number(row.amount))} {row.currency || "تومان"}
    </span>
  );
}

function DateCell({ row }: { row: PaymentTransactionAdmin }) {
  const locale = useLocale();
  return <span className="whitespace-nowrap text-dash-caption text-content-secondary">{formatPaymentDate(row.createdAt, locale)}</span>;
}

export function TransactionMobileCard({ row }: { row: PaymentTransactionAdmin }) {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-content-primary" dir="ltr">{row.bookingGroupRef}</span>
        <TransactionStatusBadge status={row.status} />
      </div>
      <p className="text-dash-body-sm font-medium text-content-primary">
        {format.number(Number(row.amount))} {row.currency || "تومان"}
      </p>
      <p className="text-dash-caption text-content-secondary">
        {row.providerName ? row.providerName : t(msgKey("paymentTransactions.providerNone"))}
        {" · "}
        {formatPaymentDate(row.createdAt, locale)}
      </p>
    </div>
  );
}