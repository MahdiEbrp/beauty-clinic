"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth/dal";
import {
  SMS_API_ROUTES,
  SMS_LIMITS,
  SMS_PERMISSIONS,
} from "@/lib/sms/constants";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import type {
  ListSmsMessagesResult,
} from "@/lib/sms/report-service";
import {
  SmsBackLink,
  SmsSelect,
  SmsSubnav,
  type SmsSelectOption,
} from "./common";
import { inputClass } from "@/components/create-group/ui";
import { SmsListEmpty, SmsListError, SmsListSkeleton, listRange } from "./SmsListStates";
import { SmsPagination } from "./SmsPagination";
import { MessageCard, MessageRow } from "./SmsMessageListItems";

type MessageStatus = "all" | "queued" | "sending" | "sent" | "delivered" | "failed";

export function SmsReportsContent({
  user,
  initialData,
  providers,
}: {
  user: AuthUser;
  initialData: ListSmsMessagesResult;
  providers: AdminSmsProvider[];
}) {
  const t = useTranslations("smsReports");
  const adminT = useTranslations("smsAdmin");
  const locale = useLocale();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<MessageStatus>("all");
  const [providerId, setProviderId] = useState("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const canSend = user.permissions.includes(SMS_PERMISSIONS.send);
  const canWrite = user.permissions.includes(SMS_PERMISSIONS.write);

  const load = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextStatus: MessageStatus,
      nextProviderId: string,
    ) => {
      setLoading(true);
      setLoadFailed(false);
      const query = new URLSearchParams({
        page: String(nextPage),
        perPage: String(SMS_LIMITS.messageListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      if (nextProviderId !== "all") query.set("providerId", nextProviderId);
      try {
        const response = await fetch(`${SMS_API_ROUTES.messages}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("request_failed");
        const payload = (await response.json()) as { data?: ListSmsMessagesResult };
        if (!payload.data) throw new Error("invalid_response");
        setData(payload.data);
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SMS_LIMITS.searchDebounceMs,
    );
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (
      page === initialData.page &&
      !debouncedSearch &&
      status === "all" &&
      providerId === "all"
    ) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize filtered data with the API
    void load(page, debouncedSearch, status, providerId);
  }, [debouncedSearch, initialData.page, load, page, providerId, status]);

  const refresh = () => load(page, debouncedSearch, status, providerId);
  const range = listRange(data.page, data.perPage, data.total);
  const hasFilters = Boolean(debouncedSearch) || status !== "all" || providerId !== "all";
  const statusOptions: SmsSelectOption[] = [
    { value: "all", label: t("allStatuses") },
    { value: "queued", label: adminT("statuses.queued") },
    { value: "sending", label: adminT("statuses.sending") },
    { value: "sent", label: adminT("statuses.sent") },
    { value: "delivered", label: adminT("statuses.delivered") },
    { value: "failed", label: adminT("statuses.failed") },
  ];
  const providerOptions: SmsSelectOption[] = [
    { value: "all", label: t("allProviders") },
    ...providers.map((provider) => ({ value: provider.id, label: provider.name })),
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsSubnav canSend={canSend} canWrite={canWrite} />
      <header className="space-y-3">
        <SmsBackLink />
        <h1 className="text-dash-display font-black tracking-tight text-accent">{t("heading")}</h1>
        <p className="max-w-2xl text-dash-body leading-7 text-content-secondary">{t("description")}</p>
      </header>

      <section className="grid gap-4 rounded-panel border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 sm:grid-cols-[1fr_14rem_14rem] sm:p-6">
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-report-search">
          {t("search")}
          <span className="relative">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" aria-hidden="true" />
            <input
              id="sms-report-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(SMS_LIMITS.pageDefault);
              }}
              placeholder={t("searchPlaceholder")}
              className={`${inputClass(false)} ps-10`}
            />
          </span>
        </label>
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-report-status">
          {t("status")}
          <SmsSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value as MessageStatus);
              setPage(SMS_LIMITS.pageDefault);
            }}
            options={statusOptions}
            placeholder={t("allStatuses")}
            ariaLabel={t("status")}
          />
        </label>
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-report-provider">
          {t("provider")}
          <SmsSelect
            value={providerId}
            onValueChange={(value) => {
              setProviderId(value);
              setPage(SMS_LIMITS.pageDefault);
            }}
            options={providerOptions}
            placeholder={t("allProviders")}
            ariaLabel={t("provider")}
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[64rem] text-start text-dash-body-sm">
            <thead className="bg-surface-tertiary/40 text-dash-caption text-content-tertiary">
              <tr>
                <th className="px-5 py-4 font-bold">{t("table.recipient")}</th>
                <th className="px-5 py-4 font-bold">{t("table.provider")}</th>
                <th className="px-5 py-4 font-bold">{t("table.status")}</th>
                <th className="px-5 py-4 font-bold">{t("table.providerId")}</th>
                <th className="px-5 py-4 font-bold">{t("table.created")}</th>
                <th className="px-5 py-4 font-bold">{t("table.sent")}</th>
                <th className="px-5 py-4 font-bold">{t("table.error")}</th>
              </tr>
            </thead>
            {!loading && !loadFailed && data.items.length > SMS_LIMITS.emptyLength && (
              <tbody className="divide-y divide-border-primary">
                {data.items.map((message) => (
                  <MessageRow
                    key={message.id}
                    message={message}
                    locale={locale}
                    labels={{
                      providerFallback: t("notAvailable"),
                      noValue: t("notAvailable"),
                      providerId: t("table.providerId"),
                      created: t("table.created"),
                      error: t("table.error"),
                    }}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="md:hidden">
          {data.items.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              locale={locale}
              labels={{
                providerFallback: t("notAvailable"),
                noValue: t("notAvailable"),
                providerId: t("table.providerId"),
                created: t("table.created"),
                error: t("table.error"),
              }}
            />
          ))}
        </div>
        {loading && <SmsListSkeleton />}
        {!loading && loadFailed && (
          <SmsListError message={t("error")} retryLabel={t("retry")} onRetry={() => void refresh()} />
        )}
        {!loading && !loadFailed && data.items.length === SMS_LIMITS.emptyLength && (
          <SmsListEmpty message={hasFilters ? t("empty") : t("empty")} />
        )}
        <SmsPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          labels={{
            showing: t("pagination.showing", range),
            previous: t("pagination.previous"),
            next: t("pagination.next"),
            page: t("pagination.page", {
              page: data.page,
              totalPages: data.totalPages,
            }),
          }}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
