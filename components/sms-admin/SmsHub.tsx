"use client";

import { Activity, ArrowUpLeft, CheckCircle2, MessageSquareText, Send, Settings2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";

import type { AuthUser } from "@/lib/auth/dal";
import type { SmsOverview } from "@/lib/sms/report-service";
import {
  formatSmsDate,
  providerKindKey,
  SmsBackLink,
  SmsStatusBadge,
  SmsSubnav,
} from "./common";

export function SmsHub({
  user,
  overview,
}: {
  user: AuthUser;
  overview: SmsOverview;
}) {
  const t = useTranslations("smsAdmin");
  const locale = useLocale();
  const canSend = user.permissions.includes("sms.send");
  const canWrite = user.permissions.includes("sms.write");
  const activeProvider =
    overview.providers.find((provider) => provider.isDefault && provider.isActive) ??
    overview.providers.find((provider) => provider.isActive);
  const stats = [
    { key: "total", value: overview.stats.total, icon: MessageSquareText },
    { key: "sent", value: overview.stats.sent, icon: Send },
    { key: "delivered", value: overview.stats.delivered, icon: CheckCircle2 },
    { key: "failed", value: overview.stats.failed, icon: Activity },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsSubnav canSend={canSend} canWrite={canWrite} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <SmsBackLink />
          <p className="pt-2 text-dash-caption font-bold uppercase tracking-[0.16em] text-copper-strong">
            {t("eyebrow")}
          </p>
          <h1 className="text-dash-display font-black tracking-tight text-accent">
            {t("heading")}
          </h1>
          <p className="max-w-2xl text-dash-body leading-7 text-content-secondary">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Link
              href="/dashboard/sms/send"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast no-underline shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Send className="size-4" aria-hidden="true" />
              {t("actions.send")}
            </Link>
          )}
          {canWrite && (
            <Link
              href="/dashboard/sms/providers"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive bg-surface-secondary px-4 text-dash-body-sm font-bold text-accent no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Settings2 className="size-4" aria-hidden="true" />
              {t("actions.addProvider")}
            </Link>
          )}
        </div>
      </div>

      <section
        aria-labelledby="sms-connection-heading"
        className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2"
      >
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-card bg-copper/15 text-copper-strong">
              <Activity className="size-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-dash-caption font-bold uppercase tracking-[0.14em] text-copper-strong">
                {t("connection.eyebrow")}
              </p>
              <h2
                id="sms-connection-heading"
                className="mt-1 text-dash-heading font-black text-accent"
              >
                {activeProvider
                  ? `${activeProvider.name} · ${t(`providerKinds.${providerKindKey(activeProvider.kind)}` as never)}`
                  : t("connection.noProvider")}
              </h2>
              <p className="mt-1 text-dash-body-sm text-content-secondary">
                {t("connection.description")}
              </p>
            </div>
          </div>
          {activeProvider ? (
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <SmsStatusBadge status={activeProvider.healthStatus} />
              {activeProvider.isDefault && (
                <span className="rounded-pill border border-copper/30 bg-copper/10 px-2.5 py-1 text-dash-caption font-bold text-copper-strong">
                  {t("connection.default")}
                </span>
              )}
              {canWrite && (
                <Link
                  href="/dashboard/sms/providers"
                  className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border-interactive px-3 text-dash-body-sm font-bold text-accent no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {t("actions.edit")}
                  <ArrowUpLeft className="size-4 rtl-mirror" aria-hidden="true" />
                </Link>
              )}
            </div>
          ) : (
            canWrite && (
              <Link
                href="/dashboard/sms/providers/add"
                className="inline-flex min-h-11 items-center justify-center rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast no-underline transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t("actions.addProvider")}
              </Link>
            )
          )}
        </div>
        {activeProvider && (
          <div className="grid gap-3 border-t border-border-primary bg-surface-tertiary/30 p-5 text-dash-caption text-content-secondary sm:grid-cols-3 sm:p-6">
            <div>
              <span className="block text-content-tertiary">{t("connection.endpoint")}</span>
              <span dir="ltr" className="mt-1 block truncate font-mono text-content-primary">
                {activeProvider.apiUrl}
              </span>
            </div>
            <div>
              <span className="block text-content-tertiary">{t("connection.tokenConfigured")}</span>
              <span className="mt-1 block font-bold text-content-primary">
                {activeProvider.tokenLast4
                  ? `•••• ${activeProvider.tokenLast4}`
                  : t("notAvailable")}
              </span>
            </div>
            <div>
              <span className="block text-content-tertiary">{t("connection.lastCheck")}</span>
              <time className="mt-1 block font-bold text-content-primary">
                {activeProvider.lastHealthCheckedAt
                  ? formatSmsDate(activeProvider.lastHealthCheckedAt, locale)
                  : t("connection.never")}
              </time>
            </div>
          </div>
        )}
      </section>

      <section aria-label={t("stats.total")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="rounded-card border border-border-primary bg-surface-secondary p-5 shadow-elevation-1"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-dash-caption font-bold text-content-tertiary">
                {t(`stats.${stat.key}` as never)}
              </span>
              <stat.icon className="size-5 text-copper-strong" aria-hidden="true" />
            </div>
            <p className="mt-4 text-dash-display font-black tracking-tight text-accent">
              {stat.value}
            </p>
            {stat.key === "delivered" && (
              <p className="mt-1 text-dash-caption text-content-secondary">
                {overview.stats.deliveryRate}% {t("stats.deliveryRate")}
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary px-5 py-4 sm:px-6">
          <h2 className="text-dash-heading font-black text-accent">{t("recent.heading")}</h2>
          <Link
            href="/dashboard/sms/messages"
            className="inline-flex min-h-11 items-center gap-2 rounded-pill px-3 text-dash-body-sm font-bold text-accent no-underline transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("actions.viewAll")}
            <ArrowUpLeft className="size-4 rtl-mirror" aria-hidden="true" />
          </Link>
        </div>
        {overview.recentMessages.length === 0 ? (
          <p className="p-8 text-center text-dash-body-sm text-content-secondary">
            {t("recent.empty")}
          </p>
        ) : (
          <div className="divide-y divide-border-primary">
            {overview.recentMessages.map((message) => (
              <div
                key={message.id}
                className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <p dir="ltr" className="font-mono text-dash-body-sm font-bold text-accent">
                    {message.recipientMasked}
                  </p>
                  <p className="mt-1 truncate text-dash-caption text-content-tertiary">
                    {message.providerName ?? t("notAvailable")}
                  </p>
                </div>
                <SmsStatusBadge status={message.status} />
                <time className="text-dash-caption text-content-tertiary">
                  {formatSmsDate(message.createdAt, locale)}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
