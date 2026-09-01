"use client";

import { useTranslations } from "next-intl";

import type { AdminEmailProvider } from "@/lib/email/provider-service";
import {
  EmailProviderCard,
  EmailProviderRow,
  type ProviderLabels,
} from "./EmailProviderListItems";

type ProviderListViewProps = {
  items: AdminEmailProvider[];
  locale: string;
  canSend: boolean;
  canWrite: boolean;
  canManage: boolean;
  labelsFor: (provider: AdminEmailProvider) => ProviderLabels;
  onTest: (provider: AdminEmailProvider) => void;
  onDelete: (provider: AdminEmailProvider) => void;
};

export function EmailProviderDesktopTable({
  items,
  locale,
  canSend,
  canWrite,
  canManage,
  labelsFor,
  onTest,
  onDelete,
}: ProviderListViewProps) {
  const t = useTranslations("emailAdmin");
  return (
    <table className="w-full min-w-[70rem] table-fixed text-start">
      <thead>
        <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
          <th scope="col" className="w-[22%] px-4 py-4 text-start font-bold">
            {t("providers.table.name")}
          </th>
          <th scope="col" className="w-[20%] px-4 py-4 text-start font-bold">
            {t("providers.table.host")}
          </th>
          <th scope="col" className="w-[16%] px-4 py-4 text-start font-bold">
            {t("providers.table.username")}
          </th>
          <th scope="col" className="w-[11%] px-4 py-4 text-start font-bold">
            {t("providers.table.status")}
          </th>
          <th scope="col" className="w-[9%] px-4 py-4 text-start font-bold">
            {t("providers.table.default")}
          </th>
          <th scope="col" className="w-[13%] px-4 py-4 text-start font-bold">
            {t("providers.table.lastCheck")}
          </th>
          <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
            <span className="sr-only">{t("providers.table.actions")}</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary">
        {items.map((provider) => (
          <EmailProviderRow
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

export function EmailProviderMobileCards({
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
        <EmailProviderCard
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