"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Column } from "@/components/admin-list/types";
import type { PaymentProviderAdmin } from "@/lib/payment/admin-types";
import { msgKey } from "@/src/i18n/message-key";
import { ProviderStatusMenu } from "./provider-status-menu";
import { ProviderHealthCell, ProviderHealthBadge } from "./provider-health";

export function providerColumns(): Column<PaymentProviderAdmin>[] {
  return [
    {
      key: "provider",
      labelKey: "paymentAdmin.table.provider",
      render: (row) => <ProviderCell row={row} />,
    },
    {
      key: "health",
      labelKey: "paymentAdmin.table.health",
      responsive: "desktop",
      render: (row) => <ProviderHealthCell row={row} />,
    },
    {
      key: "status",
      labelKey: "paymentAdmin.table.status",
      render: (row) => <ProviderStatusMenu row={row} />,
    },
  ];
}

function ProviderCell({ row }: { row: PaymentProviderAdmin }) {
  const t = useTranslations();
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-accent">{row.name}</span>
        {row.isDefault && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-copper/30 bg-copper/10 px-2 py-0.5 text-dash-caption font-bold text-copper-strong">
            <ShieldCheck className="size-3" aria-hidden="true" />
            {t(msgKey("paymentAdmin.status.default"))}
          </span>
        )}
      </div>
      <span className="text-dash-caption text-content-tertiary">
        {t(msgKey(`paymentAdmin.providerKinds.${row.kind}`))}
        {" · •••• "}
        {row.merchantLast4 || "—"}
      </span>
    </div>
  );
}

export function PaymentProviderMobileCard({
  row,
}: {
  row: PaymentProviderAdmin;
}) {
  const t = useTranslations();
  return (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-bold text-accent">{row.name}</span>
        <ProviderStatusMenu row={row} />
      </div>
      <p className="text-dash-caption text-content-secondary">
        {t(msgKey(`paymentAdmin.providerKinds.${row.kind}`))}
        {" · •••• "}
        {row.merchantLast4 || "—"}
        {row.isDefault
          ? ` · ${t(msgKey("paymentAdmin.status.default"))}`
          : ""}
      </p>
      <div className="flex items-center gap-2">
        <ProviderHealthBadge healthStatus={row.healthStatus} />
      </div>
    </div>
  );
}