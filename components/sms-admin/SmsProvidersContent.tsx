"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AuthUser } from "@/lib/auth/dal";
import {
  SMS_API_ROUTES,
  SMS_DASHBOARD_ROUTES,
  SMS_LIMITS,
  SMS_PERMISSIONS,
} from "@/lib/sms/constants";
import type {
  AdminSmsProvider,
  ListSmsProvidersResult,
} from "@/lib/sms/provider-service";
import {
  SmsManagementFilters,
  type SmsManagementFilterOption,
} from "./SmsManagementFilters";
import {
  SmsManagementHeader,
  SmsManagementMobileAdd,
} from "./SmsManagementHeader";
import { SmsListEmpty, SmsListError } from "./SmsListStates";
import { SmsListShell } from "./SmsListShell";
import { SmsPagination } from "./SmsPagination";
import type { ProviderLabels } from "./SmsProviderListItems";
import {
  SmsProviderDesktopTable,
  SmsProviderMobileCards,
} from "./SmsProviderListViews";
import { SmsProviderTestDialog } from "./SmsProviderTestDialog";
import { SmsConfirmDialog } from "./SmsConfirmDialog";

type ProviderStatus = "all" | "active" | "inactive";

export function SmsProvidersContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListSmsProvidersResult;
}) {
  const t = useTranslations("smsAdmin");
  const locale = useLocale();
  const firstRun = useRef(true);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProviderStatus>("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSmsProvider | null>(null);
  const [testTarget, setTestTarget] = useState<AdminSmsProvider | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canSend = user.permissions.includes(SMS_PERMISSIONS.send);
  const canWrite = user.permissions.includes(SMS_PERMISSIONS.write);
  const canManage = user.permissions.includes(SMS_PERMISSIONS.manage);

  const load = useCallback(
    async (nextPage: number, nextSearch: string, nextStatus: ProviderStatus) => {
      setLoading(true);
      setLoadFailed(false);
      const query = new URLSearchParams({
        page: String(nextPage),
        perPage: String(SMS_LIMITS.providerListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      try {
        const response = await fetch(`${SMS_API_ROUTES.providers}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("providers_load_failed");
        const payload = (await response.json()) as { data?: ListSmsProvidersResult };
        if (!payload.data) throw new Error("providers_response_invalid");
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
    void load(page, debouncedSearch, status);
  }, [debouncedSearch, load, page, status]);

  const refresh = () => load(page, debouncedSearch, status);
  const range = {
    from:
      data.total === SMS_LIMITS.emptyLength
        ? SMS_LIMITS.emptyLength
        : (data.page - SMS_LIMITS.pageMin) * data.perPage + SMS_LIMITS.pageMin,
    to: Math.min(data.page * data.perPage, data.total),
  };
  const hasFilters = Boolean(debouncedSearch) || status !== "all";
  const statusOptions: SmsManagementFilterOption[] = [
    { value: "all", label: t("providers.allStatuses") },
    { value: "active", label: t("providers.active") },
    { value: "inactive", label: t("providers.inactive") },
  ];
  const labelsFor = (provider: AdminSmsProvider): ProviderLabels => ({
    kind: t(`providerKinds.${provider.kind === "sms_ir" ? "smsIr" : provider.kind}` as never),
    default: t("providers.default"),
    notConfigured: t("providers.notConfigured"),
    never: t("providers.never"),
    edit: t("providers.edit"),
    test: t("providers.test"),
    delete: t("providers.delete"),
    menu: t("providers.table.actions"),
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${SMS_API_ROUTES.providers}/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("provider_delete_failed");
      setDeleteTarget(null);
      toast.success(t("providers.deleteSuccess"));
      await refresh();
    } catch {
      toast.error(t("providers.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(SMS_LIMITS.pageDefault);
  };
  const onStatusChange = (value: string) => {
    setStatus(value as ProviderStatus);
    setPage(SMS_LIMITS.pageDefault);
  };
  const onClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(SMS_LIMITS.pageDefault);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsManagementHeader
        backHref={SMS_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("providers.heading")}
        total={data.total}
        resultsLabel={t("resultsLabel")}
        addHref={canWrite ? SMS_DASHBOARD_ROUTES.addProvider : undefined}
        addLabel={canWrite ? t("actions.addProvider") : undefined}
      />
      <SmsManagementFilters
        search={search}
        onSearchChange={onSearchChange}
        searchLabel={t("providers.search")}
        searchPlaceholder={t("providers.searchPlaceholder")}
        isLoading={loading}
        loadingLabel={t("actions.loading")}
        status={status}
        onStatusChange={onStatusChange}
        statusLabel={t("providers.status")}
        statusOptions={statusOptions}
        clearLabel={t("clearFilters")}
        onClear={onClearFilters}
      />
      <SmsListShell
        total={data.total}
        resultsLabel={t("resultsLabel")}
        loading={loading}
        loadingLabel={t("actions.loading")}
        error={
          loadFailed ? (
            <SmsListError
              message={t("providers.error")}
              retryLabel={t("providers.retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={
          <SmsListEmpty
            message={hasFilters ? t("providers.emptySearch") : t("providers.empty")}
            filtering={hasFilters}
          />
        }
        desktop={
          <SmsProviderDesktopTable
            items={data.items}
            locale={locale}
            canSend={canSend}
            canWrite={canWrite}
            canManage={canManage}
            labelsFor={labelsFor}
            onTest={setTestTarget}
            onDelete={setDeleteTarget}
          />
        }
        mobile={
          <SmsProviderMobileCards
            items={data.items}
            locale={locale}
            canSend={canSend}
            canWrite={canWrite}
            canManage={canManage}
            labelsFor={labelsFor}
            onTest={setTestTarget}
            onDelete={setDeleteTarget}
          />
        }
        pagination={
          <SmsPagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            labels={{
              showing: t("providers.pagination.showing", range),
              previous: t("providers.pagination.previous"),
              next: t("providers.pagination.next"),
              page: t("providers.pagination.page", {
                page: data.page,
                totalPages: data.totalPages,
              }),
            }}
            onPageChange={setPage}
          />
        }
      />
      {canWrite && (
        <SmsManagementMobileAdd
          href={SMS_DASHBOARD_ROUTES.addProvider}
          label={t("actions.addProvider")}
        />
      )}
      <SmsConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("providers.deleteTitle")}
        description={t("providers.deleteDescription")}
        confirmLabel={t("providers.deleteConfirm")}
        cancelLabel={t("actions.cancel")}
        closeLabel={t("actions.cancel")}
        busy={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
      <SmsProviderTestDialog
        provider={testTarget}
        open={Boolean(testTarget)}
        onOpenChange={(open) => !open && setTestTarget(null)}
      />
    </div>
  );
}
