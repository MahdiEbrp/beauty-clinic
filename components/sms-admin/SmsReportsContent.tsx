"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth/dal";
import {
  SMS_API_ROUTES,
  SMS_DASHBOARD_ROUTES,
  SMS_LIMITS,
} from "@/lib/sms/constants";
import type { AdminSmsProvider } from "@/lib/sms/provider-service";
import type { ListSmsMessagesResult } from "@/lib/sms/report-service";
import {
  SmsManagementFilterPill,
  SmsManagementFilters,
  type SmsManagementFilterOption,
} from "./SmsManagementFilters";
import { SmsManagementHeader } from "./SmsManagementHeader";
import { SmsListEmpty, SmsListError } from "./SmsListStates";
import { SmsListShell } from "./SmsListShell";
import { SmsPagination } from "./SmsPagination";
import { MessageCard, MessageRow } from "./SmsMessageListItems";

type MessageStatus = "all" | "queued" | "sending" | "sent" | "delivered" | "failed";

export function SmsReportsContent({
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
  const firstRun = useRef(true);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<MessageStatus>("all");
  const [providerId, setProviderId] = useState("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);


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
        if (!response.ok) throw new Error("reports_load_failed");
        const payload = (await response.json()) as { data?: ListSmsMessagesResult };
        if (!payload.data) throw new Error("reports_response_invalid");
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
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    void load(page, debouncedSearch, status, providerId);
  }, [debouncedSearch, load, page, providerId, status]);

  const refresh = () => load(page, debouncedSearch, status, providerId);
  const range = {
    from:
      data.total === SMS_LIMITS.emptyLength
        ? SMS_LIMITS.emptyLength
        : (data.page - SMS_LIMITS.pageMin) * data.perPage + SMS_LIMITS.pageMin,
    to: Math.min(data.page * data.perPage, data.total),
  };
  const hasFilters =
    Boolean(debouncedSearch) || status !== "all" || providerId !== "all";
  const statusOptions: SmsManagementFilterOption[] = [
    { value: "all", label: t("allStatuses") },
    { value: "queued", label: adminT("statuses.queued") },
    { value: "sending", label: adminT("statuses.sending") },
    { value: "sent", label: adminT("statuses.sent") },
    { value: "delivered", label: adminT("statuses.delivered") },
    { value: "failed", label: adminT("statuses.failed") },
  ];
  const providerOptions: SmsManagementFilterOption[] = [
    { value: "all", label: t("allProviders") },
    ...providers.map((provider) => ({ value: provider.id, label: provider.name })),
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsManagementHeader
        backHref={SMS_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("heading")}
        total={data.total}
        resultsLabel={adminT("resultsLabel")}
      />
      <SmsManagementFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(SMS_LIMITS.pageDefault);
        }}
        searchLabel={t("search")}
        searchPlaceholder={t("searchPlaceholder")}
        isLoading={loading}
        loadingLabel={adminT("actions.loading")}
        status={status}
        onStatusChange={(value) => {
          setStatus(value as MessageStatus);
          setPage(SMS_LIMITS.pageDefault);
        }}
        statusLabel={t("status")}
        statusOptions={statusOptions}
        clearLabel={adminT("clearFilters")}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setProviderId("all");
          setPage(SMS_LIMITS.pageDefault);
        }}
        extraFilters={
          <SmsManagementFilterPill
            label={t("provider")}
            active={providerId !== "all"}
            value={providerId}
            options={providerOptions}
            onChange={(value) => {
              setProviderId(value);
              setPage(SMS_LIMITS.pageDefault);
            }}
          />
        }
        hasExtraFilters={providerId !== "all"}
      />
      <SmsListShell
        total={data.total}
        resultsLabel={adminT("resultsLabel")}
        loading={loading}
        loadingLabel={adminT("actions.loading")}
        error={
          loadFailed ? (
            <SmsListError
              message={t("error")}
              retryLabel={t("retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={<SmsListEmpty message={t("empty")} filtering={hasFilters} />}
        desktop={
          <table className="w-full min-w-5xl table-fixed text-start">
            <thead>
              <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
                <th scope="col" className="w-[16%] px-4 py-4 text-start font-bold">
                  {t("table.recipient")}
                </th>
                <th scope="col" className="w-[16%] px-4 py-4 text-start font-bold">
                  {t("table.provider")}
                </th>
                <th scope="col" className="w-[14%] px-4 py-4 text-start font-bold">
                  {t("table.status")}
                </th>
                <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold">
                  {t("table.providerId")}
                </th>
                <th scope="col" className="w-[15%] px-4 py-4 text-start font-bold">
                  {t("table.created")}
                </th>
                <th scope="col" className="w-[15%] px-4 py-4 text-start font-bold">
                  {t("table.sent")}
                </th>
                <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold">
                  {t("table.error")}
                </th>
              </tr>
            </thead>
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
          </table>
        }
        mobile={
          <div className="grid gap-2.5 p-3">
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
        }
        pagination={
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
        }
      />
    </div>
  );
}
