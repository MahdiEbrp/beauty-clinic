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
  AdminSmsTemplate,
  ListSmsTemplatesResult,
} from "@/lib/sms/template-service";
import { Link } from "@/src/i18n/navigation";
import { inputClass } from "@/components/create-group/ui";
import {
  SmsBackLink,
  SmsSelect,
  SmsSubnav,
  type SmsSelectOption,
} from "./common";
import { SmsConfirmDialog } from "./SmsConfirmDialog";
import { SmsListEmpty, SmsListError, SmsListSkeleton, listRange } from "./SmsListStates";
import { SmsPagination } from "./SmsPagination";
import { SmsTemplateCard, SmsTemplateRow, type TemplateLabels } from "./SmsTemplateListItems";

type TemplateStatus = "all" | "active" | "inactive";

export function SmsTemplatesContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListSmsTemplatesResult;
}) {
  const t = useTranslations("smsAdmin");
  const locale = useLocale();
  const firstRun = useRef(true);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TemplateStatus>("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminSmsTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canSend = user.permissions.includes(SMS_PERMISSIONS.send);
  const canWrite = user.permissions.includes(SMS_PERMISSIONS.write);

  const load = useCallback(
    async (nextPage: number, nextSearch: string, nextStatus: TemplateStatus) => {
      setLoading(true);
      setLoadFailed(false);
      const query = new URLSearchParams({
        page: String(nextPage),
        perPage: String(SMS_LIMITS.templateListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      try {
        const response = await fetch(`${SMS_API_ROUTES.templates}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error();
        const payload = (await response.json()) as { data?: ListSmsTemplatesResult };
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
    { value: "all", label: t("templates.allStatuses") },
    { value: "active", label: t("templates.active") },
    { value: "inactive", label: t("templates.inactive") },
  ];
  const labels: TemplateLabels = {
    type: t("templates.table.type"),
    noVariables: t("templates.noVariables"),
    edit: t("templates.edit"),
    delete: t("templates.delete"),
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${SMS_API_ROUTES.templates}/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setDeleteTarget(null);
      toast.success(t("templates.deleteSuccess"));
      await refresh();
    } catch {
      toast.error(t("templates.deleteError"));
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
            {t("templates.heading")}
          </h1>
          <p className="max-w-2xl text-dash-body leading-7 text-content-secondary">
            {t("templates.description")}
          </p>
        </div>
        {canWrite && (
          <Link
            href={SMS_DASHBOARD_ROUTES.addTemplate}
            className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-accent px-4 text-dash-body-sm font-bold text-content-contrast no-underline shadow-elevation-1 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t("actions.addTemplate")}
          </Link>
        )}
      </header>

      <section className="grid gap-4 rounded-panel border border-border-primary bg-surface-secondary p-5 shadow-elevation-1 sm:grid-cols-[1fr_14rem] sm:p-6">
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-template-search">
          {t("templates.search")}
          <input
            id="sms-template-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(SMS_LIMITS.pageDefault);
            }}
            placeholder={t("templates.searchPlaceholder")}
            className={inputClass(false)}
          />
        </label>
        <label className="grid gap-1.5 text-dash-caption font-bold text-content-secondary" htmlFor="sms-template-status">
          {t("templates.status")}
          <SmsSelect
            value={status}
            onValueChange={(value) => {
              setStatus(value as TemplateStatus);
              setPage(SMS_LIMITS.pageDefault);
            }}
            options={statusOptions}
            placeholder={t("templates.allStatuses")}
            ariaLabel={t("templates.status")}
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[64rem] text-start text-dash-body-sm">
            <thead className="bg-surface-tertiary/40 text-dash-caption text-content-tertiary">
              <tr>
                <th className="px-5 py-4 font-bold">{t("templates.table.key")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.name")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.type")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.variables")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.status")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.updated")}</th>
                <th className="px-5 py-4 font-bold">{t("templates.table.actions")}</th>
              </tr>
            </thead>
            {!loading && !loadFailed && data.items.length > SMS_LIMITS.emptyLength && (
              <tbody className="divide-y divide-border-primary">
                {data.items.map((template) => (
                  <SmsTemplateRow
                    key={template.id}
                    template={template}
                    locale={locale}
                    canWrite={canWrite}
                    labels={labels}
                    onDelete={() => setDeleteTarget(template)}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
        <div className="md:hidden">
          {data.items.map((template) => (
            <SmsTemplateCard
              key={template.id}
              template={template}
              locale={locale}
              canWrite={canWrite}
              labels={labels}
              onDelete={() => setDeleteTarget(template)}
            />
          ))}
        </div>
        {loading && <SmsListSkeleton />}
        {!loading && loadFailed && (
          <SmsListError message={t("templates.error")} retryLabel={t("templates.retry")} onRetry={() => void refresh()} />
        )}
        {!loading && !loadFailed && data.items.length === SMS_LIMITS.emptyLength && (
          <SmsListEmpty message={hasFilters ? t("templates.emptySearch") : t("templates.empty")} />
        )}
        <SmsPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          labels={{
            showing: t("templates.pagination.showing", range),
            previous: t("templates.pagination.previous"),
            next: t("templates.pagination.next"),
            page: t("templates.pagination.page", {
              page: data.page,
              totalPages: data.totalPages,
            }),
          }}
          onPageChange={setPage}
        />
      </section>

      <SmsConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("templates.deleteTitle")}
        description={t("templates.deleteDescription")}
        confirmLabel={t("templates.deleteConfirm")}
        cancelLabel={t("actions.cancel")}
        closeLabel={t("actions.cancel")}
        busy={deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
