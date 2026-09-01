"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AuthUser } from "@/lib/auth/dal";
import {
  EMAIL_API_ROUTES,
  EMAIL_DASHBOARD_ROUTES,
  EMAIL_LIMITS,
  EMAIL_PERMISSIONS,
} from "@/lib/email/constants";
import type {
  AdminEmailProvider,
  ListEmailProvidersResult,
} from "@/lib/email/provider-service";
import { emailKindKey } from "./email-format";
import {
  EmailManagementFilters,
  type EmailManagementFilterOption,
} from "./EmailManagementFilters";
import {
  EmailManagementHeader,
  EmailManagementMobileAdd,
} from "./EmailManagementHeader";
import { EmailListEmpty, EmailListError } from "./EmailListStates";
import { EmailListShell } from "./EmailListShell";
import { EmailPagination } from "./EmailPagination";
import type { ProviderLabels } from "./EmailProviderListItems";
import {
  EmailProviderDesktopTable,
  EmailProviderMobileCards,
} from "./EmailProviderListViews";
import { EmailProviderTestDialog } from "./EmailProviderTestDialog";
import { EmailConfirmDialog } from "./EmailConfirmDialog";

type ProviderStatus = "all" | "active" | "inactive";

export function EmailProvidersContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListEmailProvidersResult;
}) {
  const t = useTranslations("emailAdmin");
  const locale = useLocale();
  const firstRun = useRef(true);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<ProviderStatus>("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminEmailProvider | null>(null);
  const [testTarget, setTestTarget] = useState<AdminEmailProvider | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canSend = user.permissions.includes(EMAIL_PERMISSIONS.send);
  const canWrite = user.permissions.includes(EMAIL_PERMISSIONS.write);
  const canManage = user.permissions.includes(EMAIL_PERMISSIONS.manage);

  const load = useCallback(
    async (nextPage: number, nextSearch: string, nextStatus: ProviderStatus) => {
      setLoading(true);
      setLoadFailed(false);
      const query = new URLSearchParams({
        page: String(nextPage),
        perPage: String(EMAIL_LIMITS.providerListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      try {
        const response = await fetch(`${EMAIL_API_ROUTES.providers}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("providers_load_failed");
        const payload = (await response.json()) as { data?: ListEmailProvidersResult };
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
      EMAIL_LIMITS.searchDebounceMs,
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
      data.total === EMAIL_LIMITS.emptyLength
        ? EMAIL_LIMITS.emptyLength
        : (data.page - EMAIL_LIMITS.pageMin) * data.perPage + EMAIL_LIMITS.pageMin,
    to: Math.min(data.page * data.perPage, data.total),
  };
  const hasFilters = Boolean(debouncedSearch) || status !== "all";
  const statusOptions: EmailManagementFilterOption[] = [
    { value: "all", label: t("providers.allStatuses") },
    { value: "active", label: t("providers.active") },
    { value: "inactive", label: t("providers.inactive") },
  ];
  const labelsFor = (provider: AdminEmailProvider): ProviderLabels => ({
    kind: t(`providerKinds.${emailKindKey(provider.kind)}` as never),
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
      const response = await fetch(`${EMAIL_API_ROUTES.providers}/${deleteTarget.id}`, {
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
    setPage(EMAIL_LIMITS.pageDefault);
  };
  const onStatusChange = (value: string) => {
    setStatus(value as ProviderStatus);
    setPage(EMAIL_LIMITS.pageDefault);
  };
  const onClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(EMAIL_LIMITS.pageDefault);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <EmailManagementHeader
        backHref={EMAIL_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("providers.heading")}
        total={data.total}
        resultsLabel={t("resultsLabel")}
        addHref={canWrite ? EMAIL_DASHBOARD_ROUTES.addProvider : undefined}
        addLabel={canWrite ? t("actions.addProvider") : undefined}
      />
      <EmailManagementFilters
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
      <EmailListShell
        total={data.total}
        resultsLabel={t("resultsLabel")}
        loading={loading}
        loadingLabel={t("actions.loading")}
        error={
          loadFailed ? (
            <EmailListError
              message={t("providers.error")}
              retryLabel={t("providers.retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={
          <EmailListEmpty
            message={hasFilters ? t("providers.emptySearch") : t("providers.empty")}
            filtering={hasFilters}
          />
        }
        desktop={
          <EmailProviderDesktopTable
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
          <EmailProviderMobileCards
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
          <EmailPagination
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
        <EmailManagementMobileAdd
          href={EMAIL_DASHBOARD_ROUTES.addProvider}
          label={t("actions.addProvider")}
        />
      )}
      <EmailConfirmDialog
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
      <EmailProviderTestDialog
        provider={testTarget}
        open={Boolean(testTarget)}
        onOpenChange={(open) => !open && setTestTarget(null)}
      />
    </div>
  );
}