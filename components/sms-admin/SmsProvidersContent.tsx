"use client";

import { Plus } from "lucide-react";
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
import { Link } from "@/src/i18n/navigation";
import { inputClass } from "@/components/create-group/ui";
import {
  providerKindKey,
  SmsBackLink,
  SmsSelect,
  SmsSubnav,
  type SmsSelectOption,
} from "./common";
import { SmsConfirmDialog } from "./SmsConfirmDialog";
import { SmsListEmpty, SmsListError, SmsListSkeleton, listRange } from "./SmsListStates";
import { SmsPagination } from "./SmsPagination";
import { SmsProviderCard, SmsProviderRow, type ProviderLabels } from "./SmsProviderListItems";
import { SmsProviderTestDialog } from "./SmsProviderTestDialog";

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
        if (!response.ok) throw new Error();
        const payload = (await response.json()) as { data?: ListSmsProvidersResult };
        if (!payload.data) throw new Error();
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
  const range = listRange(data.page, data.perPage, data.total);
  const hasFilters = Boolean(debouncedSearch) || status !== "all";
  const statusOptions: SmsSelectOption[] = [
    { value: "all", label: t("providers.allStatuses") },
    { value: "active", label: t("providers.active") },
    { value: "inactive", label: t("providers.inactive") },
  ];
  const labelsFor = (provider: AdminSmsProvider): ProviderLabels => ({
    kind: t(`providerKinds.${providerKindKey(provider.kind)}` as never),
    endpoint: t("providers.table.endpoint"),
    default: t("providers.default"),
    configured: t("providers.configured"),
    notConfigured: t("providers.notConfigured"),
    never: t("providers.never"),
    edit: t("providers.edit"),
    test: t("providers.test"),
    delete: t("providers.delete"),
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${SMS_API_ROUTES.providers}/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setDeleteTarget(null);
      toast.success(t("providers.deleteSuccess"));
      await refresh();
    } catch {
      toast.error(t("providers.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SmsSubnav canSend={canSend} canWrite={canWrite} />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <SmsBackLink />
          <h1 className="text-dash-display font-black tracking-tight text-accent">
            {t("providers.heading")}
          </h1>
          <p className="max-w-2xl text-dash-body leading-7 text-content-secondary">
            {t("providers.description")}
          </p>
        </div>
        {canWrite && (
          <Link
            href={SMS_DASHBOARD_ROUTES.addProvider}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast no-underline shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("actions.addProvider")}
          </Link>
        )}
      </header>

      <section className="grid gap-4 rounded-panel border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 sm:grid-cols-[1fr_14rem] sm:p-6">
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-provider-search">
          {t("providers.search")}
          <input
            id="sms-provider-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(SMS_LIMITS.pageDefault);
            }}
            placeholder={t("providers.searchPlaceholder")}
            className={inputClass(false)}
          />
        </label>
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-provider-status">
          {t("providers.status")}
          <SmsSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value as ProviderStatus);
              setPage(SMS_LIMITS.pageDefault);
            }}
            options={statusOptions}
            placeholder={t("providers.allStatuses")}
            ariaLabel={t("providers.status")}
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[64rem] text-start text-dash-body-sm">
            <thead className="bg-surface-tertiary/40 text-dash-caption text-content-tertiary">
              <tr>
                <th className="px-5 py-4 font-bold">{t("providers.table.name")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.type")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.endpoint")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.token")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.status")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.lastCheck")}</th>
                <th className="px-5 py-4 font-bold">{t("providers.table.actions")}</th>
              </tr>
            </thead>
            {!loading && !loadFailed && data.items.length > SMS_LIMITS.emptyLength && (
              <tbody className="divide-y divide-border-primary">
                {data.items.map((provider) => (
                  <SmsProviderRow
                    key={provider.id}
                    provider={provider}
                    locale={locale}
                    canSend={canSend}
                    canWrite={canWrite}
                    labels={labelsFor(provider)}
                    onTest={() => setTestTarget(provider)}
                    onDelete={() => setDeleteTarget(provider)}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="md:hidden">
          {data.items.map((provider) => (
            <SmsProviderCard
              key={provider.id}
              provider={provider}
              locale={locale}
              canSend={canSend}
              canWrite={canWrite}
              labels={labelsFor(provider)}
              onTest={() => setTestTarget(provider)}
              onDelete={() => setDeleteTarget(provider)}
            />
          ))}
        </div>
        {loading && <SmsListSkeleton />}
        {!loading && loadFailed && (
          <SmsListError
            message={t("providers.error")}
            retryLabel={t("providers.retry")}
            onRetry={() => void refresh()}
          />
        )}
        {!loading && !loadFailed && data.items.length === SMS_LIMITS.emptyLength && (
          <SmsListEmpty message={hasFilters ? t("providers.emptySearch") : t("providers.empty")} />
        )}
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
      </section>

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
