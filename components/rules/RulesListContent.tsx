"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { Plus, Search, Trash2, Pencil, Loader2 } from "lucide-react";

import type { AuthUser } from "@/lib/auth/dal";
import type { ListRulesResult } from "@/lib/services/rules-types";

interface Props {
  user: AuthUser;
  initialData: ListRulesResult;
}

type StatusFilter = "all" | "active" | "inactive";

const DEFAULT_PAGE_SIZE = 10;

async function fetchRules(params: {
  page: number;
  perPage: number;
  search: string;
  status: StatusFilter;
}): Promise<ListRulesResult> {
  const qs = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
    search: params.search,
    status: params.status,
  }).toString();
  const res = await fetch(`/api/v1/rules?${qs}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(err?.error?.message ?? "load_failed");
  }
  const payload = (await res.json()) as ListRulesResult;
  return payload;
}

export default function RulesListContent({ user, initialData }: Props) {
  const t = useTranslations("dashboardRules");

  const [data, setData] = useState<ListRulesResult>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const firstRun = useRef(true);

  const canWrite =
    user.permissions.includes("rules.write") ||
    user.permissions.includes("rules.manage");
  const canDelete = user.permissions.includes("rules.manage");

  const load = useCallback(
    async (params: { page: number; search: string; status: StatusFilter }) => {
      setIsLoading(true);
      setHasLoadFailed(false);
      try {
        const fresh = await fetchRules({
          page: params.page,
          perPage: DEFAULT_PAGE_SIZE,
          search: params.search,
          status: params.status,
        });
        setData(fresh);
      } catch {
        setHasLoadFailed(true);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    void load({ page, search: debouncedSearch, status });
  }, [page, debouncedSearch, status, load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    const res = await fetch(`/api/v1/rules/${id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert(t("deleteError"));
      return;
    }
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((r) => r.id !== id),
      total: Math.max(0, prev.total - 1),
    }));
    if (data.items.length === 1 && page > 1) setPage(page - 1);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-accent">{t("heading")}</h1>
          <p className="text-body-sm text-content-secondary mt-1">
            {t("description")}
          </p>
        </div>
        {canWrite && (
          <Link
            href="/dashboard/rules/add"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-4 py-2.5 text-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-5" />
            {t("addRule.title")}
          </Link>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-content-tertiary"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t("fields.slug.placeholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-control border border-border-primary bg-surface-secondary ps-10 pe-3 py-2 text-body-sm text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          aria-label={t("status")}
          className="min-w-40 rounded-control border border-border-primary bg-surface-secondary px-3 py-2 text-body-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">{t("status")}: All</option>
          <option value="active">{t("active")}</option>
          <option value="inactive">{t("inactive")}</option>
        </select>
      </div>

      {hasLoadFailed && (
        <p className="text-body-sm text-destructive" role="alert">
          {t("loadFailed")}
        </p>
      )}

      <div className="overflow-x-auto rounded-card border border-border-primary bg-surface-secondary">
        <table className="w-full min-w-[700px] border-collapse text-left text-body-sm">
          <thead className="bg-surface-tertiary/30">
            <tr>
              <th className="px-4 py-3 text-content-tertiary font-semibold">
                {t("fields.name.label")}
              </th>
              <th className="px-4 py-3 text-content-tertiary font-semibold">
                {t("fields.slug.label")}
              </th>
              <th className="px-4 py-3 text-content-tertiary font-semibold">
                {t("fields.icon.label")}
              </th>
              <th className="px-4 py-3 text-content-tertiary font-semibold">
                {t("columns.order")}
              </th>
              <th className="px-4 py-3 text-content-tertiary font-semibold">
                {t("fields.isActive.label")}
              </th>
              <th className="px-4 py-3 text-content-tertiary font-semibold text-center">
                {t("columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-content-tertiary" />
                </td>
              </tr>
            ) : data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-content-tertiary">
                  {t("empty.title")}
                </td>
              </tr>
            ) : (
              data.items.map((rule) => (
                <tr key={rule.id} className="border-t border-border-primary">
                  <td className="px-4 py-3 font-medium text-accent">
                    {rule.translations.fa.name ||
                      rule.translations.en.name ||
                      rule.slug}
                  </td>
                  <td className="px-4 py-3 text-content-secondary">
                    {rule.slug}
                  </td>
                  <td className="px-4 py-3 text-content-secondary">
                    {rule.icon || "—"}
                  </td>
                  <td className="px-4 py-3 text-content-secondary">
                    {rule.displayOrder}
                  </td>
                  <td className="px-4 py-3">
                    {rule.isActive ? t("active") : t("inactive")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {canWrite && (
                        <Link
                          href={`/dashboard/rules/${rule.id}/edit`}
                          className="rounded p-1 text-content-secondary hover:bg-surface-tertiary hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                          aria-label={t("edit")}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(rule.id)}
                          className="rounded p-1 text-content-secondary hover:bg-surface-tertiary hover:text-destructive focus-visible:outline-2 focus-visible:outline-accent"
                          aria-label={t("delete")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-body-sm text-content-secondary">
        <span>
          {data.page} / {data.totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded border border-border-primary px-3 py-1 disabled:opacity-50"
          >
            {t("pagination.prev")}
          </button>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded border border-border-primary px-3 py-1 disabled:opacity-50"
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
    </section>
  );
}
