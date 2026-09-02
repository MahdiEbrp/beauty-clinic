"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth/dal";
import {
  EMAIL_API_ROUTES,
  EMAIL_DASHBOARD_ROUTES,
  EMAIL_LIMITS,
} from "@/lib/email/constants";
import type { AdminEmailProvider } from "@/lib/email/provider-service";
import type { ListEmailMessagesResult } from "@/lib/email/report-service";
import {
  EmailManagementFilterPill,
  EmailManagementFilters,
  type EmailManagementFilterOption,
} from "./EmailManagementFilters";
import { EmailManagementHeader } from "./EmailManagementHeader";
import { EmailListEmpty, EmailListError } from "./EmailListStates";
import { EmailListShell } from "./EmailListShell";
import { EmailPagination } from "./EmailPagination";
import { MessageCard, MessageRow } from "./EmailMessageListItems";

type MessageStatus = "all" | "queued" | "sending" | "sent" | "delivered" | "failed";

export function EmailReportsContent({
  initialData,
  providers,
}: {
  user: AuthUser;
  initialData: ListEmailMessagesResult;
  providers: AdminEmailProvider[];
}) {
  const t = useTranslations("emailReports");
  const adminT = useTranslations("emailAdmin");
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
        perPage: String(EMAIL_LIMITS.messageListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      if (nextProviderId !== "all") query.set("providerId", nextProviderId);
      try {
        const response = await fetch(`${EMAIL_API_ROUTES.messages}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("reports_load_failed");
        const payload = (await response.json()) as { data?: ListEmailMessagesResult };
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
      EMAIL_LIMITS.searchDebounceMs,
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
      data.total === EMAIL_LIMITS.emptyLength
        ? EMAIL_LIMITS.emptyLength
        : (data.page - EMAIL_LIMITS.pageMin) * data.perPage + EMAIL_LIMITS.pageMin,
    to: Math.min(data.page * data.perPage, data.total),
    total: data.total,
  };
  const hasFilters =
    Boolean(debouncedSearch) || status !== "all" || providerId !== "all";
  const statusOptions: EmailManagementFilterOption[] = [
    { value: "all", label: t("allStatuses") },
    { value: "queued", label: adminT("statuses.queued") },
    { value: "sending", label: adminT("statuses.sending") },
    { value: "sent", label: adminT("statuses.sent") },
    { value: "delivered", label: adminT("statuses.delivered") },
    { value: "failed", label: adminT("statuses.failed") },
  ];
  const providerOptions: EmailManagementFilterOption[] = [
    { value: "all", label: t("allProviders") },
    ...providers.map((provider) => ({ value: provider.id, label: provider.name })),
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <EmailManagementHeader
        backHref={EMAIL_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("heading")}
        total={data.total}
        resultsLabel={adminT("resultsLabel")}
      />
      <EmailManagementFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(EMAIL_LIMITS.pageDefault);
        }}
        searchLabel={t("search")}
        searchPlaceholder={t("searchPlaceholder")}
        isLoading={loading}
        loadingLabel={adminT("actions.loading")}
        status={status}
        onStatusChange={(value) => {
          setStatus(value as MessageStatus);
          setPage(EMAIL_LIMITS.pageDefault);
        }}
        statusLabel={t("status")}
        statusOptions={statusOptions}
        clearLabel={adminT("clearFilters")}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setProviderId("all");
          setPage(EMAIL_LIMITS.pageDefault);
        }}
        extraFilters={
          <EmailManagementFilterPill
            label={t("provider")}
            active={providerId !== "all"}
            value={providerId}
            options={providerOptions}
            onChange={(value) => {
              setProviderId(value);
              setPage(EMAIL_LIMITS.pageDefault);
            }}
          />
        }
        hasExtraFilters={providerId !== "all"}
      />
      <EmailListShell
        total={data.total}
        resultsLabel={adminT("resultsLabel")}
        loading={loading}
        loadingLabel={adminT("actions.loading")}
        error={
          loadFailed ? (
            <EmailListError
              message={t("error")}
              retryLabel={t("retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={<EmailListEmpty message={t("empty")} filtering={hasFilters} />}
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
          <EmailPagination
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
