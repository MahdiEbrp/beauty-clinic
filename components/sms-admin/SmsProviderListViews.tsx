"use client";

import { useTranslations } from "next-intl";

import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import {
  SmsProviderCard,
  SmsProviderRow,
  type ProviderLabels,
} from "./SmsProviderListItems";

type ProviderListViewProps = {
  items: AdminSmsProvider[];
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  canManage: boolean;
  labelsFor: (provider: AdminSmsProvider) => ProviderLabels;
  onTest: (provider: AdminSmsProvider) => void;
  onDelete: (provider: AdminSmsProvider) => void;
};

export function SmsProviderDesktopTable({
  items,
  locale,
  canSend,
  canWrite,
  canManage,
  labelsFor,
  onTest,
  onDelete,
}: ProviderListViewProps) {
  const t = useTranslations("smsAdmin");
  return (
    <table className="w-full min-w-[64rem] table-fixed text-start">
      <thead>
        <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
          <th scope="col" className="w-[30%] px-4 py-4 text-start font-bold">
            {t("providers.table.name")}
          </th>
          <th scope="col" className="w-[24%] px-4 py-4 text-start font-bold">
            {t("providers.table.endpoint")}
          </th>
          <th scope="col" className="w-[15%] px-4 py-4 text-start font-bold">
            {t("providers.table.token")}
          </th>
          <th scope="col" className="w-[13%] px-4 py-4 text-start font-bold">
            {t("providers.table.status")}
          </th>
          <th scope="col" className="w-[14%] px-4 py-4 text-start font-bold">
            {t("providers.table.lastCheck")}
          </th>
          <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
            <span className="sr-only">{t("providers.table.actions")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary">
        {items.map((provider) => (
          <SmsProviderRow
            key={provider.id}
            provider={provider}
            locale={locale}
            canSend={canSend}
            canWrite={canWrite}
            canManage={canManage}
            labels={labelsFor(provider)}
            onTest={() => onTest(provider)}
            onDelete={() => onDelete(provider)}
          />
        ))}
      </tbody>
    </table>
  );
}

export function SmsProviderMobileCards({
  items,
  locale,
  canSend,
  canWrite,
  canManage,
  labelsFor,
  onTest,
  onDelete,
}: ProviderListViewProps) {
  return (
    <div className="grid gap-2.5 p-3">
      {items.map((provider) => (
        <SmsProviderCard
          key={provider.id}
          provider={provider}
          locale={locale}
          canSend={canSend}
          canWrite={canWrite}
          canManage={canManage}
          labels={labelsFor(provider)}
          onTest={() => onTest(provider)}
          onDelete={() => onDelete(provider)}
        />
      ))}
    </div>
  );
}
