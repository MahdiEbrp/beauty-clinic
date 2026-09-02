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
  AdminSmsTemplate,
  ListSmsTemplatesResult,
} from "@/lib/sms/template-service";
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
import {
  SmsTemplateCard,
  SmsTemplateRow,
  type TemplateLabels,
} from "./SmsTemplateListItems";
import { SmsConfirmDialog } from "./SmsConfirmDialog";

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
  const canWrite = user.permissions.includes(SMS_PERMISSIONS.write);
  const canManage = user.permissions.includes(SMS_PERMISSIONS.manage);

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
        if (!response.ok) throw new Error("templates_load_failed");
        const payload = (await response.json()) as { data?: ListSmsTemplatesResult };
        if (!payload.data) throw new Error("templates_response_invalid");
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
    total: data.total,
  };
  const hasFilters = Boolean(debouncedSearch) || status !== "all";
  const statusOptions: SmsManagementFilterOption[] = [
    { value: "all", label: t("templates.allStatuses") },
    { value: "active", label: t("templates.active") },
    { value: "inactive", label: t("templates.inactive") },
  ];
  const labels: TemplateLabels = {
    type: t("templates.table.type"),
    noVariables: t("templates.noVariables"),
    edit: t("templates.edit"),
    delete: t("templates.delete"),
    menu: t("templates.table.actions"),
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${SMS_API_ROUTES.templates}/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("template_delete_failed");
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
      <SmsManagementHeader
        backHref={SMS_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("templates.heading")}
        total={data.total}
        resultsLabel={t("resultsLabel")}
        addHref={canWrite ? SMS_DASHBOARD_ROUTES.addTemplate : undefined}
        addLabel={canWrite ? t("actions.addTemplate") : undefined}
      />
      <SmsManagementFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(SMS_LIMITS.pageDefault);
        }}
        searchLabel={t("templates.search")}
        searchPlaceholder={t("templates.searchPlaceholder")}
        isLoading={loading}
        loadingLabel={t("actions.loading")}
        status={status}
        onStatusChange={(value) => {
          setStatus(value as TemplateStatus);
          setPage(SMS_LIMITS.pageDefault);
        }}
        statusLabel={t("templates.status")}
        statusOptions={statusOptions}
        clearLabel={t("clearFilters")}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setPage(SMS_LIMITS.pageDefault);
        }}
      />
      <SmsListShell
        total={data.total}
        resultsLabel={t("resultsLabel")}
        loading={loading}
        loadingLabel={t("actions.loading")}
        error={
          loadFailed ? (
            <SmsListError
              message={t("templates.error")}
              retryLabel={t("templates.retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={
          <SmsListEmpty
            message={hasFilters ? t("templates.emptySearch") : t("templates.empty")}
            filtering={hasFilters}
          />
        }
        desktop={
          <table className="w-full min-w-5xl table-fixed text-start">
            <thead>
              <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
                <th scope="col" className="w-[34%] px-4 py-4 text-start font-bold">
                  {t("templates.table.name")}
                </th>
                <th scope="col" className="w-[18%] px-4 py-4 text-start font-bold">
                  {t("templates.table.type")}
                </th>
                <th scope="col" className="w-[22%] px-4 py-4 text-start font-bold">
                  {t("templates.table.variables")}
                </th>
                <th scope="col" className="w-[12%] px-4 py-4 text-start font-bold">
                  {t("templates.table.status")}
                </th>
                <th scope="col" className="w-[14%] px-4 py-4 text-start font-bold">
                  {t("templates.table.updated")}
                </th>
                <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                  <span className="sr-only">{t("templates.table.actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {data.items.map((template) => (
                <SmsTemplateRow
                  key={template.id}
                  template={template}
                  locale={locale}
                  canWrite={canWrite}
                  canManage={canManage}
                  labels={labels}
                  onDelete={() => setDeleteTarget(template)}
                />
              ))}
            </tbody>
          </table>
        }
        mobile={
          <div className="grid gap-2.5 p-3">
            {data.items.map((template) => (
              <SmsTemplateCard
                key={template.id}
                template={template}
                locale={locale}
                canWrite={canWrite}
                canManage={canManage}
                labels={labels}
                onDelete={() => setDeleteTarget(template)}
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
        }
      />
      {canWrite && (
        <SmsManagementMobileAdd
          href={SMS_DASHBOARD_ROUTES.addTemplate}
          label={t("actions.addTemplate")}
        />
      )}
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
