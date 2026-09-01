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
  AdminEmailTemplate,
  ListEmailTemplatesResult,
} from "@/lib/email/template-service";
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
import {
  EmailTemplateCard,
  EmailTemplateRow,
  type TemplateLabels,
} from "./EmailTemplateListItems";
import { EmailConfirmDialog } from "./EmailConfirmDialog";

type TemplateStatus = "all" | "active" | "inactive";

export function EmailTemplatesContent({
  user,
  initialData,
}: {
  user: AuthUser;
  initialData: ListEmailTemplatesResult;
}) {
  const t = useTranslations("emailAdmin");
  const tf = useTranslations("emailTemplateForm");
  const locale = useLocale();
  const firstRun = useRef(true);
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TemplateStatus>("all");
  const [page, setPage] = useState(initialData.page);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminEmailTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canWrite = user.permissions.includes(EMAIL_PERMISSIONS.write);
  const canManage = user.permissions.includes(EMAIL_PERMISSIONS.manage);

  const load = useCallback(
    async (nextPage: number, nextSearch: string, nextStatus: TemplateStatus) => {
      setLoading(true);
      setLoadFailed(false);
      const query = new URLSearchParams({
        page: String(nextPage),
        perPage: String(EMAIL_LIMITS.templateListPerPageDefault),
        status: nextStatus,
      });
      if (nextSearch) query.set("search", nextSearch);
      try {
        const response = await fetch(`${EMAIL_API_ROUTES.templates}?${query.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("templates_load_failed");
        const payload = (await response.json()) as { data?: ListEmailTemplatesResult };
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
    { value: "all", label: t("templates.allStatuses") },
    { value: "active", label: t("templates.active") },
    { value: "inactive", label: t("templates.inactive") },
  ];
  const labels: TemplateLabels = {
    noVariables: t("templates.noVariables"),
    edit: t("templates.edit"),
    delete: t("templates.delete"),
    menu: t("templates.table.actions"),
    type: (value) => tf(`types.${value}` as never),
    format: (value) => tf(`formatOptions.${value}` as never),
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${EMAIL_API_ROUTES.templates}/${deleteTarget.id}`, {
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
      <EmailManagementHeader
        backHref={EMAIL_DASHBOARD_ROUTES.root}
        backLabel={t("back")}
        heading={t("templates.heading")}
        total={data.total}
        resultsLabel={t("resultsLabel")}
        addHref={canWrite ? EMAIL_DASHBOARD_ROUTES.addTemplate : undefined}
        addLabel={canWrite ? t("actions.addTemplate") : undefined}
      />
      <EmailManagementFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(EMAIL_LIMITS.pageDefault);
        }}
        searchLabel={t("templates.search")}
        searchPlaceholder={t("templates.searchPlaceholder")}
        isLoading={loading}
        loadingLabel={t("actions.loading")}
        status={status}
        onStatusChange={(value) => {
          setStatus(value as TemplateStatus);
          setPage(EMAIL_LIMITS.pageDefault);
        }}
        statusLabel={t("templates.status")}
        statusOptions={statusOptions}
        clearLabel={t("clearFilters")}
        onClear={() => {
          setSearch("");
          setStatus("all");
          setPage(EMAIL_LIMITS.pageDefault);
        }}
      />
      <EmailListShell
        total={data.total}
        resultsLabel={t("resultsLabel")}
        loading={loading}
        loadingLabel={t("actions.loading")}
        error={
          loadFailed ? (
            <EmailListError
              message={t("templates.error")}
              retryLabel={t("templates.retry")}
              onRetry={() => void refresh()}
            />
          ) : undefined
        }
        empty={
          <EmailListEmpty
            message={hasFilters ? t("templates.emptySearch") : t("templates.empty")}
            filtering={hasFilters}
          />
        }
        desktop={
          <table className="w-full min-w-5xl table-fixed text-start">
            <thead>
              <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
                <th scope="col" className="w-[30%] px-4 py-4 text-start font-bold">
                  {t("templates.table.name")}
                </th>
                <th scope="col" className="w-[12%] px-4 py-4 text-start font-bold">
                  {t("templates.table.type")}
                </th>
                <th scope="col" className="w-[12%] px-4 py-4 text-start font-bold">
                  {t("templates.table.format")}
                </th>
                <th scope="col" className="w-[16%] px-4 py-4 text-start font-bold">
                  {t("templates.table.variables")}
                </th>
                <th scope="col" className="w-[12%] px-4 py-4 text-start font-bold">
                  {t("templates.table.status")}
                </th>
                <th scope="col" className="w-[12%] px-4 py-4 text-start font-bold">
                  {t("templates.table.updated")}
                </th>
                <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                  <span className="sr-only">{t("templates.table.actions")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {data.items.map((template) => (
                <EmailTemplateRow
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
              <EmailTemplateCard
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
          <EmailPagination
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
        <EmailManagementMobileAdd
          href={EMAIL_DASHBOARD_ROUTES.addTemplate}
          label={t("actions.addTemplate")}
        />
      )}
      <EmailConfirmDialog
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