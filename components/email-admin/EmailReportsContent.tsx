"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AuthUser } from "@/lib/auth/dal";
import { EMAIL_API_ROUTES, EMAIL_DASHBOARD_ROUTES, EMAIL_LIMITS } from "@/lib/email/constants";
import type { AdminEmailProvider } from "@/lib/email/provider-service";
import type { AdminEmailMessage, ListEmailMessagesResult } from "@/lib/email/report-service";
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
import { EmailConfirmDialog } from "./EmailConfirmDialog";
import { useMessageDelete } from "@/components/admin-list/use-message-delete";
import { MessageBulkBar } from "@/components/admin-list/MessageBulkBar";
import { MessagesTable } from "@/components/admin-list/MessagesTable";

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

  const refresh = useCallback(() => { void load(page, debouncedSearch, status, providerId); }, [load, page, debouncedSearch, status, providerId]);

  const {
    selectedIds,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleSelect,
    handleSelectAll,
    confirmDelete,
    bulkDelete,
  } = useMessageDelete<AdminEmailMessage>({
    apiBase: EMAIL_API_ROUTES.messages,
    successKey: t("actions.deleteSuccess"),
    errorKey: t("actions.deleteError"),
    refresh,
  });

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

  const messageLabels = {
    providerFallback: t("notAvailable"),
    noValue: t("notAvailable"),
    providerId: t("table.providerId"),
    created: t("table.created"),
    error: t("table.error"),
    delete: t("actions.delete"),
  };

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
      {selectedIds.size > 0 && (
        <MessageBulkBar
          busy={deleting}
          onDelete={() => void bulkDelete(
            t("bulk.resultDescription", { count: selectedIds.size }),
            t("bulk.resultPartialDescription", { count: 0, failed: 0 }),
          )}
          onSelectAll={() => handleSelectAll(data.items)}
          labels={{
            selected: t("bulk.selected", { count: selectedIds.size }),
            delete: t("bulk.delete"),
            selectAll: t("bulk.selectAll", { count: data.total }),
          }}
        />
      )}
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
          <MessagesTable
            items={data.items}
            selectedIds={selectedIds}
            selectAllChecked={data.items.length > 0 && selectedIds.size === data.items.length}
            onSelectAll={() => handleSelectAll(data.items)}
            columns={[
              { label: t("table.recipient"), width: "w-[16%]" },
              { label: t("table.provider"), width: "w-[16%]" },
              { label: t("table.status"), width: "w-[14%]" },
              { label: t("table.providerId"), width: "w-[18%]" },
              { label: t("table.created"), width: "w-[15%]" },
              { label: t("table.sent"), width: "w-[15%]" },
              { label: t("table.error") },
            ]}
            renderRow={(message, selected) => (
              <MessageRow
                key={message.id}
                message={message as AdminEmailMessage}
                locale={locale}
                labels={messageLabels}
                selected={selected}
                onSelect={handleSelect}
                onDelete={setDeleteTarget}
              />
            )}
          />
        }
        mobile={
          <div className="grid gap-2.5 p-3">
            {data.items.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                locale={locale}
                labels={messageLabels}
                selected={selectedIds.has(message.id)}
                onSelect={handleSelect}
                onDelete={setDeleteTarget}
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
      <EmailConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("actions.deleteConfirm")}
        description={t("bulk.confirmDescription")}
        confirmLabel={t("actions.delete")}
        cancelLabel={adminT("actions.cancel")}
        closeLabel={adminT("actions.cancel")}
        busy={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
