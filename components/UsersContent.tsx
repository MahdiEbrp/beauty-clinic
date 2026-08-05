"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import {
  Search,
  SearchX,
  UserPlus,
  MoreVertical,
  X,
  Loader2,
  Ban,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminUser, ListUsersResult } from "@/lib/users/service";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StatusFilter = "all" | "active" | "inactive" | "banned";
type RoleFilter = "all" | "admin" | "doctor" | "receptionist" | "customer";
type ConfirmAction = "ban" | "deactivate";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function UsersContent({
  user: currentUser,
  initialData,
}: {
  user: AuthUser;
  initialData: ListUsersResult;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListUsersResult>(initialData);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ user: AdminUser; action: ConfirmAction } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", phone: "", password: "", roleKey: "customer" });
  const firstRun = useRef(true);

  const canManage = currentUser.permissions.includes("users.manage");
  const canWrite = currentUser.permissions.includes("users.write");

  const load = useCallback(
    async (params: { search: string; status: StatusFilter; role: RoleFilter; page: number }) => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const qs = new URLSearchParams({
          page: String(params.page),
          perPage: "10",
          status: params.status,
        });
        if (params.role !== "all") qs.set("role", params.role);
        if (params.search) qs.set("search", params.search);
        const response = await fetch(`/api/v1/users?${qs.toString()}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("load_failed");
        const payload = (await response.json()) as { data: ListUsersResult };
        setData(payload.data);
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce the search box.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Refetch on filter/pagination changes (skip the initial server render).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    load({ search: debouncedSearch, status, role, page });
  }, [debouncedSearch, status, role, page, load]);

  const runAction = async (
    target: AdminUser,
    patch: { isActive?: boolean; isBanned?: boolean; banReason?: string | null },
  ) => {
    setBusyId(target.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/v1/users/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const code = payload?.error?.code as string | undefined;
        if (code === "SELF_LOCKOUT") throw new Error("self_lockout");
        throw new Error("action_failed");
      }
      setConfirm(null);
      setBanReason("");
      await load({ search: debouncedSearch, status, role, page });
    } catch (error) {
      setActionError(
        t(
          error instanceof Error && error.message === "self_lockout"
            ? "users.errors.selfLockout"
            : "users.errors.action",
        ),
      );
    } finally {
      setBusyId(null);
    }
  };

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddBusy(true);
    setAddError(null);
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error("create_failed");
      setAddOpen(false);
      setNewUser({ fullName: "", email: "", phone: "", password: "", roleKey: "customer" });
      await load({ search: debouncedSearch, status, role, page: 1 });
      setPage(1);
    } catch {
      setAddError(t("users.errors.create"));
    } finally {
      setAddBusy(false);
    }
  };

  const roleLabel = (role: string) =>
    t.has(`users.roles.${role}`) ? t(`users.roles.${role}`) : role;

  const statusOf = (row: AdminUser): "active" | "inactive" | "banned" => {
    if (row.isBanned) return "banned";
    return row.isActive ? "active" : "inactive";
  };

  const statusClass: Record<"active" | "inactive" | "banned", string> = {
    active: "bg-success/10 text-success border-success/30",
    inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
    banned: "bg-error/10 text-error border-error/30",
  };

  const rowActions = (row: AdminUser) => {
    const state = statusOf(row);
    const isSelf = row.id === currentUser.id;
    if (isSelf) return null;

    const buttons: { key: string; labelKey: string; onClick: () => void; danger?: boolean }[] = [];
    if (state === "banned") {
      buttons.push({
        key: "unban",
        labelKey: "users.actions.unban",
        onClick: () => runAction(row, { isBanned: false }),
      });
    } else {
      buttons.push({
        key: state === "active" ? "deactivate" : "activate",
        labelKey: state === "active" ? "users.actions.deactivate" : "users.actions.activate",
        onClick: () =>
          state === "active"
            ? setConfirm({ user: row, action: "deactivate" })
            : runAction(row, { isActive: true }),
      });
      buttons.push({
        key: "ban",
        labelKey: "users.actions.ban",
        danger: true,
        onClick: () => setConfirm({ user: row, action: "ban" }),
      });
    }

    return (
      <details className="relative">
        <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-pill border border-border-interactive text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden" aria-label={t("users.actions.menu")}>
          <MoreVertical className="size-5" aria-hidden="true" />
        </summary>
        <div className="absolute end-0 top-12 z-20 grid min-w-44 gap-1 rounded-card border border-border-primary bg-surface-secondary p-2 shadow-elevation-3">
          {buttons.map((button) => (
            <button
              key={button.key}
              type="button"
              disabled={busyId === row.id}
              onClick={button.onClick}
              className={`flex min-h-11 items-center gap-2 rounded-control px-3 text-start text-caption font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${button.danger ? "text-error hover:bg-error/10" : "text-accent hover:bg-surface-tertiary"}`}
            >
              {button.key === "ban" && <Ban className="size-4" aria-hidden="true" />}
              {button.key === "unban" && <ShieldCheck className="size-4" aria-hidden="true" />}
              {button.key === "deactivate" && <UserX className="size-4" aria-hidden="true" />}
              {button.key === "activate" && <UserCheck className="size-4" aria-hidden="true" />}
              <span>{t(button.labelKey)}</span>
            </button>
          ))}
        </div>
      </details>
    );
  };

  const totalPages = data.totalPages;
  const from = data.total === 0 ? 0 : (page - 1) * data.perPage + 1;
  const to = Math.min(page * data.perPage, data.total);

  // Dialog only renders while `confirm` is set; this narrows the union so the
  // title/description don't need repeated `confirm?` guards.
  const dialog = confirm
    ? confirm.action === "ban"
      ? {
          title: t("users.banDialog.title", { name: confirm.user.fullName }),
          description: t("users.banDialog.description"),
        }
      : {
          title: t("users.deactivateDialog.title", { name: confirm.user.fullName }),
          description: t("users.deactivateDialog.description"),
        }
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-heading-2 font-bold text-accent">
              {t("users.heading")}
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 bg-surface-tertiary text-content-secondary rounded-pill text-caption font-bold border border-border-primary">
              {data.total}
            </span>
          </div>
            <p className="text-body-sm text-content-secondary">{t("users.description")}</p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => { setAddError(null); setAddOpen(true); }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 py-3 text-body-sm font-bold text-content-contrast shadow-elevation-2 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            {t("users.add")}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-5 h-5 text-content-tertiary absolute top-1/2 -translate-y-1/2 inset-s-4 pointer-events-none"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("users.searchPlaceholder")}
            aria-label={t("users.search")}
            className="w-full bg-form-input-bg border border-form-input-border rounded-control py-3 ps-12 pe-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-body-sm text-content-secondary">
          <span className="whitespace-nowrap">{t("users.status")}</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">{t("users.statusAll")}</option>
            <option value="active">{t("users.statusActive")}</option>
            <option value="inactive">{t("users.statusInactive")}</option>
            <option value="banned">{t("users.statusBanned")}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-body-sm text-content-secondary">
          <span className="whitespace-nowrap">{t("users.role")}</span>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value as RoleFilter); setPage(1); }}
            className="bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">{t("users.roleAll")}</option>
            {(["admin", "doctor", "receptionist", "customer"] as const).map((key) => (
              <option key={key} value={key}>{roleLabel(key)}</option>
            ))}
          </select>
        </label>
        {(status !== "all" || role !== "all" || search) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setStatus("all"); setRole("all"); setPage(1); }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="size-4" aria-hidden="true" /> {t("users.clearFilters")}
          </button>
        )}
      </div>

      {/* Error banner */}
      {loadFailed && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 bg-error/10 border border-error/40 rounded-control p-4"
        >
          <p className="text-body-sm text-error font-medium">{t("users.error")}</p>
          <button
            type="button"
            onClick={() => load({ search: debouncedSearch, status, role, page })}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-9 rounded-pill text-body-sm font-bold text-error border border-error/40 hover:bg-error/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("users.retry")}</span>
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="bg-error/10 border border-error/40 rounded-control p-4 text-body-sm text-error font-medium"
        >
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-secondary border border-border-primary rounded-panel shadow-elevation-1 overflow-hidden">
        <div className="grid gap-3 p-4 md:hidden">
          {data.items.map((row) => {
            const state = statusOf(row);
            const isSelf = row.id === currentUser.id;
            return (
              <article key={row.id} className="rounded-card border border-border-primary bg-surface-primary p-4 shadow-elevation-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-body-sm font-bold text-copper-strong" aria-hidden="true">{initials(row.fullName)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-body font-bold text-accent">{row.fullName}</p>
                      <p className="truncate text-caption text-content-tertiary" dir="ltr">{row.email}</p>
                    </div>
                  </div>
                  {canManage && !isSelf && <div className="shrink-0">{rowActions(row)}</div>}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-caption font-bold ${statusClass[state]}`}>{t(`users.statuses.${state}`)}</span>
                  {row.roles.map((item) => <span key={item} className="inline-flex items-center rounded-pill bg-surface-tertiary px-2.5 py-1 text-caption font-medium text-content-secondary">{roleLabel(item)}</span>)}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border-primary pt-3 text-caption">
                  <div><dt className="text-content-tertiary">{t("users.table.lastLogin")}</dt><dd className="mt-1 text-content-secondary">{row.lastLoginAt ? format.relativeTime(row.lastLoginAt, new Date()) : t("users.never")}</dd></div>
                  <div><dt className="text-content-tertiary">{t("users.table.phone")}</dt><dd className="mt-1 text-content-secondary" dir="ltr">{row.phone ?? "—"}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-start">
            <thead>
              <tr className="border-b border-border-primary text-caption text-content-tertiary">
                <th scope="col" className="text-start font-medium px-6 py-4">
                  {t("users.table.user")}
                </th>
                <th scope="col" className="text-start font-medium px-4 py-4 hidden sm:table-cell">
                  {t("users.table.roles")}
                </th>
                <th scope="col" className="text-start font-medium px-4 py-4">
                  {t("users.table.status")}
                </th>
                <th scope="col" className="text-start font-medium px-4 py-4 hidden md:table-cell">
                  {t("users.table.lastLogin")}
                </th>
                {canManage && (
                  <th scope="col" className="text-end font-medium px-6 py-4">
                    {t("users.table.actions")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {data.items.map((row) => {
                const state = statusOf(row);
                const isSelf = row.id === currentUser.id;
                return (
                  <tr key={row.id} className="hover:bg-surface-primary/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-10 h-10 shrink-0 rounded-pill bg-surface-tertiary text-copper-strong flex items-center justify-center text-body-sm font-bold border border-border-primary"
                          aria-hidden="true"
                        >
                          {initials(row.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-body font-semibold text-accent truncate">
                            <span className="truncate">{row.fullName}</span>
                            {isSelf && (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 bg-accent-subtle text-accent rounded-pill text-caption font-bold">
                                {t("users.self")}
                              </span>
                            )}
                          </p>
                          <p className="text-caption text-content-tertiary truncate" dir="ltr">
                            {row.email}
                            {row.phone ? (
                              <>
                                {" · "}
                                <span dir="ltr">{row.phone}</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {row.roles.length > 0 ? (
                          row.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center px-2 py-0.5 bg-surface-tertiary text-content-secondary rounded-pill text-caption font-medium"
                            >
                              {roleLabel(role)}
                            </span>
                          ))
                        ) : (
                          <span className="text-caption text-content-tertiary">
                            {t("users.noRoles")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-caption font-bold border whitespace-nowrap ${statusClass[state]}`}
                      >
                        {t(`users.statuses.${state}`)}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-body-sm text-content-secondary whitespace-nowrap">
                        {row.lastLoginAt
                          ? format.relativeTime(row.lastLoginAt, new Date())
                          : t("users.never")}
                      </p>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {busyId === row.id && (
                            <Loader2
                              className="w-4 h-4 animate-spin text-accent"
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          )}
                          {rowActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 bg-surface-tertiary rounded-control flex items-center justify-center mb-6">
              {(debouncedSearch || status !== "all" || role !== "all") ? (
                <SearchX className="w-8 h-8 text-content-tertiary" strokeWidth={1.5} aria-hidden="true" />
              ) : <UsersIcon
                className="w-8 h-8 text-content-tertiary"
                strokeWidth={1.5}
                aria-hidden="true"
              />}
            </div>
            <p className="text-content-secondary text-body">
              {debouncedSearch || status !== "all" || role !== "all"
                ? t("users.emptySearch")
                : t("users.empty")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-primary px-6 py-4">
            <p className="text-body-sm text-content-tertiary">
              {t("users.pagination.showing", { from, to, total: data.total })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                <span>{t("users.pagination.previous")}</span>
              </button>
              <span className="text-body-sm text-content-secondary px-2 whitespace-nowrap">
                {t("users.pagination.pageInfo", { page, totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span>{t("users.pagination.next")}</span>
                <ChevronRight className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="sr-only" role="status">
          {t("users.loading")}
        </p>
      )}

      {/* Confirm dialog */}
      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
            setBanReason("");
            setActionError(null);
          }
        }}
      >
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-accent text-body-lg">
              {dialog?.title}
            </DialogTitle>
            <DialogDescription>{dialog?.description}</DialogDescription>
          </DialogHeader>

          {confirm?.action === "ban" && (
            <div>
              <label
                htmlFor="ban-reason"
                className="block text-caption font-medium text-content-secondary mb-2"
              >
                {t("users.banDialog.reason")}
              </label>
              <textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder={t("users.banDialog.reasonPlaceholder")}
                className="w-full bg-form-input-bg border border-form-input-border rounded-control py-3 px-4 text-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent resize-y"
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <DialogClose
              disabled={busyId !== null}
              className="inline-flex items-center justify-center px-6 py-3 min-h-11 text-body-sm bg-surface-tertiary text-accent rounded-pill font-semibold transition-colors hover:bg-surface-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            >
              {t("users.dialog.cancel")}
            </DialogClose>
            <button
              type="button"
              onClick={() => {
                if (!confirm) return;
                if (confirm.action === "ban") {
                  runAction(confirm.user, {
                    isBanned: true,
                    banReason: banReason.trim() || null,
                  });
                } else {
                  runAction(confirm.user, { isActive: false });
                }
              }}
              disabled={busyId !== null}
              aria-busy={busyId !== null}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-11 text-body-sm bg-error text-content-contrast rounded-pill font-bold transition-all duration-200 hover:bg-error/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error active:scale-95 disabled:opacity-60"
            >
              {busyId !== null && (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} aria-hidden="true" />
              )}
              <span>{t("users.dialog.confirm")}</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-accent">{t("users.addTitle")}</DialogTitle>
            <DialogDescription>{t("users.addDescription")}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={createUser}>
            {(["fullName", "email", "phone", "password"] as const).map((field) => (
              <label key={field} className="grid gap-2 text-caption font-bold text-content-secondary">
                <span>{t(`users.form.${field}`)}</span>
                <input
                  required={field !== "phone"}
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={newUser[field]}
                  onChange={(event) => setNewUser((value) => ({ ...value, [field]: event.target.value }))}
                  className="min-h-11 rounded-control border border-form-input-border bg-form-input-bg px-4 text-body text-accent outline-none transition focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </label>
            ))}
            <label className="grid gap-2 text-caption font-bold text-content-secondary">
              <span>{t("users.form.role")}</span>
              <select value={newUser.roleKey} onChange={(event) => setNewUser((value) => ({ ...value, roleKey: event.target.value }))} className="min-h-11 rounded-control border border-form-input-border bg-form-input-bg px-4 text-body text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                {(["admin", "doctor", "receptionist", "customer"] as const).map((key) => <option key={key} value={key}>{roleLabel(key)}</option>)}
              </select>
            </label>
            {addError && <p role="alert" className="text-body-sm font-medium text-error">{addError}</p>}
            <DialogFooter>
              <DialogClose type="button" className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-body-sm font-bold text-accent">{t("users.dialog.cancel")}</DialogClose>
              <button type="submit" disabled={addBusy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-body-sm font-bold text-content-contrast disabled:opacity-60">
                {addBusy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{t("users.addSubmit")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
