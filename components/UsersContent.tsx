"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { toast } from "sonner";
import {
  Search,
  SearchX,
  ChevronDown,
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
  Check,
  Minus,
  KeyRound,
  Trash2,
  UserCog,
  Download,
  Copy,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth/dal";
import type { AdminUser, ListUsersResult } from "@/lib/users/service";
import AddUserModal from "@/components/AddUserModal";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
type ConfirmAction = "ban" | "deactivate" | "delete";
type BulkAction = "activate" | "deactivate" | "ban" | "unban" | "change-role" | "delete" | "reset-password";
type DestructiveConfirm = { kind: "row"; user: AdminUser; action: ConfirmAction } | { kind: "bulk"; action: BulkAction };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const SelectionCheckbox = forwardRef<HTMLInputElement, { checked: boolean; indeterminate?: boolean; disabled?: boolean; onChange: () => void; label: string }>(function SelectionCheckbox({ checked, indeterminate = false, disabled = false, onChange, label }, ref) {
  return (
    <label className={`relative inline-flex size-5 shrink-0 items-center justify-center rounded-control focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`} title={disabled ? label : undefined}>
      <input ref={ref} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={label} className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed" />
      <span className={`inline-flex size-4 items-center justify-center rounded-[0.3rem] border transition-colors ${checked || indeterminate ? "border-accent bg-accent text-content-contrast" : "border-border-interactive bg-surface-secondary text-transparent"}`} aria-hidden="true">
        {checked ? <Check className="size-3" strokeWidth={3} /> : indeterminate ? <Minus className="size-3" strokeWidth={3} /> : null}
      </span>
    </label>
  );
});

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
  const [confirm, setConfirm] = useState<DestructiveConfirm | null>(null);
  const [banReason, setBanReason] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionScope, setSelectionScope] = useState<"page" | "filtered">("page");
  const [bulkAction, setBulkAction] = useState<BulkAction>("activate");
  const [bulkRole, setBulkRole] = useState("");
  const [bulkResult, setBulkResult] = useState<{ temporaryPasswords: Array<{ id: string; password: string }>; failures: Array<{ id: string; code: string }> } | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [roleValue, setRoleValue] = useState("");
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const firstRun = useRef(true);

  const canManage = currentUser.permissions.includes("users.manage");
  const canWrite = currentUser.permissions.includes("users.write");

  const visibleIds = data.items.filter((item) => item.id !== currentUser.id).map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
  }, [selectedVisibleCount, allVisibleSelected]);

  const load = useCallback(
    async (params: { search: string; status: StatusFilter; role: RoleFilter; page: number; }) => {
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
        const payload = (await response.json()) as { data: ListUsersResult; };
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

  const setSyncing = (id: string, syncing: boolean) => {
    setSyncingIds((current) => {
      const next = new Set(current);
      if (syncing) next.add(id); else next.delete(id);
      return next;
    });
  };

  const runAction = async (
    target: AdminUser,
    patch: { isActive?: boolean; isBanned?: boolean; banReason?: string | null; },
  ) => {
    setConfirm(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
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
      setBanReason("");
      await load({ search: debouncedSearch, status, role, page });
      toast.success(t("users.toast.success"), { id: pendingToast });
    } catch (error) {
      toast.error(t(error instanceof Error && error.message === "self_lockout" ? "users.errors.selfLockout" : "users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const deleteUser = async (row: AdminUser) => {
    setConfirm(null);
    setBusyId(row.id);
    setSyncing(row.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${row.id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("delete_failed");
      await load({ search: debouncedSearch, status, role, page });
      toast.success(t("users.toast.deleted"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(row.id, false);
      setBusyId(null);
    }
  };

  const saveRole = async (target: AdminUser, nextRole: string) => {
    setRoleTarget(null);
    setBusyId(target.id);
    setSyncing(target.id, true);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch(`/api/v1/users/${target.id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ roleKey: nextRole }) });
      if (!response.ok) throw new Error("role_failed");
      await load({ search: debouncedSearch, status, role, page });
      toast.success(t("users.toast.roleSuccess"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      setSyncing(target.id, false);
      setBusyId(null);
    }
  };

  const createUser = async (values: { fullName: string; email: string; phone: string; password: string; roleKey: string; }) => {
    setAddError(null);
    const pendingToast = toast.loading(t("users.toast.syncing"));
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...values, phone: values.phone.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: { code?: string } } | null;
        throw new Error(payload?.error?.code === "EMAIL_TAKEN" ? "email_taken" : "create_failed");
      }
      await load({ search: debouncedSearch, status, role, page: 1 });
      setPage(1);
      toast.success(t("users.toast.userCreated"), { id: pendingToast });
    } catch (error) {
      setAddError(t(error instanceof Error && error.message === "email_taken" ? "users.form.errors.emailTaken" : "users.errors.create"));
      toast.error(t("users.toast.error"), { id: pendingToast });
      throw error;
    }
  };

  const roleLabel = (role: string) =>
    t.has(`users.roles.${role}`) ? t(`users.roles.${role}`) : role;

  const roleClass = (role: string) => {
    if (role === "admin") return "border-accent/25 bg-accent/10 text-accent";
    if (role === "doctor") return "border-copper/30 bg-copper/10 text-copper-strong";
    if (role === "receptionist") return "border-success/25 bg-success/10 text-success";
    return "border-border-primary bg-surface-tertiary text-content-secondary";
  };

  const toggleUserSelection = (id: string) => {
    if (id === currentUser.id || syncingIds.has(id)) return;
    setSelectionScope("page");
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const togglePageSelection = () => {
    setSelectionScope("page");
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])]);
  };

  const selectFilteredResults = () => {
    setSelectionScope("filtered");
    setSelectedIds(visibleIds);
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectionScope("page");
  };

  const temporaryPasswordText = bulkResult?.temporaryPasswords.map((item) => `${item.id}\t${item.password}`).join("\n") ?? "";
  const copyTemporaryPasswords = async () => {
    await navigator.clipboard.writeText(temporaryPasswordText);
  };
  const downloadTemporaryPasswords = () => {
    const blob = new Blob([temporaryPasswordText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "temporary-passwords.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const executeBulkAction = async () => {
    if (!selectedIds.length && selectionScope === "page") return;
    if (bulkAction === "change-role" && !bulkRole) return;
    setConfirm(null);
    setBusyId("bulk");
    const pendingToast = toast.loading(t("users.toast.syncing"));
    const targetIds = selectionScope === "page" ? selectedIds : visibleIds;
    targetIds.forEach((id) => setSyncing(id, true));
    try {
      const response = await fetch("/api/v1/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: bulkAction,
          scope: selectionScope,
          ids: selectionScope === "page" ? selectedIds : undefined,
          filters: selectionScope === "filtered" ? { search: debouncedSearch, status, role } : undefined,
          roleKey: bulkAction === "change-role" ? bulkRole : undefined,
        }),
      });
      if (!response.ok) throw new Error("bulk_failed");
      const payload = (await response.json()) as { data: { temporaryPasswords: Array<{ id: string; password: string }>; failures: Array<{ id: string; code: string }> } };
      setBulkResult(payload.data.temporaryPasswords.length || payload.data.failures.length ? payload.data : null);
      clearSelection();
      await load({ search: debouncedSearch, status, role, page });
      toast.success(t("users.toast.bulkSuccess"), { id: pendingToast });
    } catch {
      toast.error(t("users.toast.error"), { id: pendingToast });
    } finally {
      targetIds.forEach((id) => setSyncing(id, false));
      setBusyId(null);
    }
  };

  const runBulkAction = () => {
    if (["ban", "delete", "reset-password"].includes(bulkAction)) {
      setConfirm({ kind: "bulk", action: bulkAction });
      return;
    }
    void executeBulkAction();
  };

  const statusOf = (row: AdminUser): "active" | "inactive" | "banned" => {
    if (row.isBanned) return "banned";
    return row.isActive ? "active" : "inactive";
  };

  const statusClass: Record<"active" | "inactive" | "banned", string> = {
    active: "bg-success/10 text-success border-success/30",
    inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
    banned: "bg-error/10 text-error border-error/30",
  };

  const statusTextClass: Record<"active" | "inactive" | "banned", string> = {
    active: "text-success",
    inactive: "text-content-secondary",
    banned: "text-error",
  };

  const rowActionButtons = (row: AdminUser) => {
    const state = statusOf(row);
    const isSelf = row.id === currentUser.id;

    const buttons: { key: string; labelKey: string; onClick: () => void; danger?: boolean; }[] = [];
    if (isSelf) {
      buttons.push({
        key: "self",
        labelKey: "users.actions.selfNotice",
        onClick: () => undefined,
      });
    } else if (state === "banned") {
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
            ? setConfirm({ kind: "row", user: row, action: "deactivate" })
            : runAction(row, { isActive: true }),
      });
      buttons.push({
        key: "ban",
        labelKey: "users.actions.ban",
        danger: true,
        onClick: () => setConfirm({ kind: "row", user: row, action: "ban" }),
      });
    }

    if (!isSelf) {
      buttons.push({ key: "role", labelKey: "users.actions.changeRole", onClick: () => { setRoleTarget(row); setRoleValue(row.roles[0] ?? ""); } });
      buttons.push({ key: "password", labelKey: "users.actions.changePassword", onClick: () => setPasswordTarget(row) });
      buttons.push({ key: "delete", labelKey: "users.actions.delete", danger: true, onClick: () => setConfirm({ kind: "row", user: row, action: "delete" }) });
    }

    return buttons;
  };

  const rowActions = (row: AdminUser) => {
    const buttons = rowActionButtons(row);
    const selfButtons = buttons.filter((button) => button.key === "self");
    const statusButtons = buttons.filter((button) => ["activate", "deactivate", "unban"].includes(button.key));
    const accountButtons = buttons.filter((button) => ["role", "password"].includes(button.key));
    const dangerButtons = buttons.filter((button) => ["ban", "delete"].includes(button.key));
    const renderButton = (button: (typeof buttons)[number]) => (
      <DropdownMenuItem
        key={button.key}
        disabled={syncingIds.has(row.id) || button.key === "self"}
        onSelect={button.onClick}
        className={button.danger ? "text-error focus:bg-error/10 focus:text-error" : "text-accent"}
      >
        {button.key === "ban" && <Ban className="size-4" strokeWidth={2} />}
        {button.key === "unban" && <ShieldCheck className="size-4" strokeWidth={2} />}
        {button.key === "deactivate" && <UserX className="size-4" strokeWidth={2} />}
        {button.key === "activate" && <UserCheck className="size-4" strokeWidth={2} />}
        {button.key === "self" && <ShieldCheck className="size-4" strokeWidth={2} />}
        {button.key === "role" && <UserCog className="size-4" strokeWidth={2} />}
        {button.key === "password" && <KeyRound className="size-4" strokeWidth={2} />}
        {button.key === "delete" && <Trash2 className="size-4" strokeWidth={2} />}
        <span>{t(button.labelKey)}</span>
      </DropdownMenuItem>
    );
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={syncingIds.has(row.id)} aria-label={t("users.actions.menu")} className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40">
            <MoreVertical className="size-5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {selfButtons.length > 0 && <DropdownMenuGroup>{selfButtons.map(renderButton)}</DropdownMenuGroup>}
          {selfButtons.length > 0 && (statusButtons.length > 0 || accountButtons.length > 0 || dangerButtons.length > 0) && <DropdownMenuSeparator />}
          <DropdownMenuGroup>{statusButtons.map(renderButton)}</DropdownMenuGroup>
          {statusButtons.length > 0 && accountButtons.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuGroup>{accountButtons.map(renderButton)}</DropdownMenuGroup>
          {dangerButtons.length > 0 && <><DropdownMenuSeparator /><DropdownMenuGroup>{dangerButtons.map(renderButton)}</DropdownMenuGroup></>}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const totalPages = data.totalPages;
  const from = data.total === 0 ? 0 : (page - 1) * data.perPage + 1;
  const to = Math.min(page * data.perPage, data.total);
  const statusSummary = status === "all"
    ? t("users.statusAll")
    : t(`users.status${status.charAt(0).toUpperCase()}${status.slice(1)}`);

  const confirmTitle = confirm?.kind === "row"
    ? confirm.action === "ban" ? t("users.banDialog.title", { name: confirm.user.fullName }) : confirm.action === "deactivate" ? t("users.deactivateDialog.title", { name: confirm.user.fullName }) : t("users.actions.deleteConfirm", { name: confirm.user.fullName })
    : confirm ? t(`users.bulk.confirm.${confirm.action}`) : "";
  const confirmDescription = confirm?.kind === "row"
    ? confirm.action === "ban" ? t("users.banDialog.description") : confirm.action === "deactivate" ? t("users.deactivateDialog.description") : t("users.bulk.confirmDescription")
    : confirm ? t("users.bulk.confirmDescription") : "";
  const bulkDangerous = ["ban", "delete", "reset-password"].includes(bulkAction);

  return (
    <div className="space-y-6 sm:space-y-7">
      <header className="grid gap-5 rounded-panel border border-border-primary bg-surface-secondary p-6 shadow-elevation-2 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-3 text-dash-caption font-bold uppercase tracking-[0.14em] text-copper-strong">
            <span className="size-2 rounded-full bg-copper" aria-hidden="true" />
            <span>{t("users.eyebrow")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-dash-display font-bold tracking-tight text-accent">{t("users.heading")}</h1>
            <span className="inline-flex items-center rounded-pill border border-border-primary bg-surface-tertiary px-3 py-1 text-dash-caption font-bold text-content-secondary">
              {data.total} {t("users.resultsLabel")}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-dash-body-sm text-content-secondary">{t("users.description")}</p>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-border-primary pt-5 lg:border-s-2 lg:border-t-0 lg:ps-7 lg:pt-0">
          <div>
            <p className="text-dash-title font-bold text-accent">{data.items.filter((item) => item.isActive && !item.isBanned).length}</p>
            <p className="text-dash-caption text-content-tertiary">{t("users.activeCount", { active: data.items.filter((item) => item.isActive && !item.isBanned).length, total: data.items.length })}</p>
          </div>
          <div className="text-end">
            <p className="text-dash-caption font-semibold text-copper-strong">{t("users.syncStatus")}</p>
            {canWrite && (
              <button
                type="button"
                onClick={() => { setAddError(null); setAddOpen(true); }}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 py-3 text-dash-body-sm font-bold text-content-contrast shadow-elevation-1 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <UserPlus className="size-4" aria-hidden="true" />
                {t("users.add")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters */}
      <section aria-labelledby="user-filters-heading" className="rounded-card border border-border-primary bg-surface-secondary/60 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="user-filters-heading" className="text-dash-body-sm font-bold text-accent">{t("users.filterLabel")}</h2>
          {loading && <Loader2 className="size-4 animate-spin text-copper" aria-label={t("users.loading")} />}
        </div>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-end md:gap-4">
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
                clearSelection();
              }}
              placeholder={t("users.searchPlaceholder")}
              aria-label={t("users.search")}
              className="w-full bg-form-input-bg border border-form-input-border rounded-control py-3 ps-12 pe-4 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>
          <label className="grid gap-1 text-dash-caption font-bold text-content-secondary">
            <span className="whitespace-nowrap">{t("users.status")}</span>
            <span className="relative block w-full">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusFilter);
                  setPage(1);
                  clearSelection();
                }}
                className="min-h-11 w-full appearance-none rounded-control border border-form-input-border bg-form-input-bg py-2.5 ps-4 pe-10 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="all">{t("users.statusAll")}</option>
                <option value="active">{t("users.statusActive")}</option>
                <option value="inactive">{t("users.statusInactive")}</option>
                <option value="banned">{t("users.statusBanned")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" aria-hidden="true" />
            </span>
          </label>
          <label className="grid gap-1 text-dash-caption font-bold text-content-secondary">
            <span className="whitespace-nowrap">{t("users.role")}</span>
            <span className="relative block w-full">
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value as RoleFilter); setPage(1); clearSelection(); }}
                className="min-h-11 w-full appearance-none rounded-control border border-form-input-border bg-form-input-bg py-2.5 ps-4 pe-10 text-dash-body text-accent outline-none transition-colors hover:border-border-interactive focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <option value="all">{t("users.roleAll")}</option>
                {(["admin", "doctor", "receptionist", "customer"] as const).map((key) => (
                  <option key={key} value={key}>{roleLabel(key)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" aria-hidden="true" />
            </span>
          </label>
          {(status !== "all" || role !== "all" || search) && (
            <button
              type="button"
              onClick={() => { setSearch(""); setStatus("all"); setRole("all"); setPage(1); clearSelection(); }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-dash-body-sm font-bold text-accent transition hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" /> {t("users.clearFilters")}
            </button>
          )}
        </div>
      </section>

      {/* Error banner */}
      {loadFailed && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 bg-error/10 border border-error/40 rounded-control p-4"
        >
          <p className="text-dash-body-sm text-error font-medium">{t("users.error")}</p>
          <button
            type="button"
            onClick={() => load({ search: debouncedSearch, status, role, page })}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-9 rounded-pill text-dash-body-sm font-bold text-error border border-error/40 hover:bg-error/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            <span>{t("users.retry")}</span>
          </button>
        </div>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-panel border border-border-primary bg-surface-secondary shadow-elevation-2" aria-label={t("users.heading")}>
        <div className="flex items-center justify-between gap-4 border-b border-border-primary bg-surface-secondary px-4 py-4 md:bg-surface-tertiary/20 md:px-6">
          <div>
            <p className="text-dash-body-sm font-bold text-accent">{t("users.heading")}</p>
            <p className="mt-1 text-dash-caption text-content-tertiary">{from}–{to} / {data.total}</p>
          </div>
          <span className="border-s border-border-interactive ps-3 text-dash-caption font-bold text-content-secondary">{statusSummary}</span>
        </div>
        {selectedIds.length > 0 && (
            <div className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border-primary bg-accent-subtle/75 px-4 py-3 md:px-6">
            <span className="text-dash-body-sm font-bold text-accent">{selectionScope === "filtered" ? t("users.bulk.selectedFiltered", { count: data.total }) : t("users.bulk.selected", { count: selectedIds.length })}</span>
            <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value as BulkAction)} className={`min-h-10 rounded-control border bg-form-input-bg px-3 text-dash-caption font-bold outline-none focus-visible:border-copper ${bulkDangerous ? "border-error/50 text-error" : "border-form-input-border text-accent"}`}>
              <option value="activate">{t("users.bulk.activate")}</option>
              <option value="deactivate">{t("users.bulk.deactivate")}</option>
              <option value="ban">{t("users.bulk.ban")}</option>
              <option value="unban">{t("users.bulk.unban")}</option>
              <option value="change-role">{t("users.bulk.changeRole")}</option>
              <option value="reset-password">{t("users.bulk.resetPassword")}</option>
              <option value="delete">{t("users.bulk.delete")}</option>
            </select>
            {bulkAction === "change-role" && <select value={bulkRole} onChange={(event) => setBulkRole(event.target.value)} className="min-h-10 rounded-control border border-form-input-border bg-form-input-bg px-3 text-dash-caption font-bold text-accent outline-none focus-visible:border-copper"><option value="">{t("users.form.rolePlaceholder")}</option>{["admin", "doctor", "receptionist", "customer"].map((key) => <option key={key} value={key}>{roleLabel(key)}</option>)}</select>}
            <button type="button" onClick={runBulkAction} disabled={busyId === "bulk"} className={`inline-flex min-h-10 items-center gap-2 rounded-pill px-4 text-dash-caption font-bold disabled:opacity-50 ${bulkDangerous ? "bg-error text-content-contrast hover:bg-error/90" : "border border-border-interactive bg-surface-secondary text-accent hover:bg-surface-tertiary"}`}>{busyId === "bulk" && <Loader2 className="size-4 animate-spin" />}{t("users.bulk.apply")}</button>
            <button type="button" onClick={clearSelection} className="min-h-10 rounded-pill px-3 text-dash-caption font-bold text-content-secondary hover:bg-surface-tertiary">{t("users.bulk.clear")}</button>
          </div>
        )}
        {selectedIds.length > 0 && selectionScope === "page" && data.total > data.items.length && selectedVisibleCount === visibleIds.length && (
          <div className="flex items-center justify-between gap-3 border-b border-border-primary px-4 py-2 text-dash-caption text-content-secondary md:px-6">
            <span>{t("users.bulk.pageSelected")}</span>
            <button type="button" onClick={selectFilteredResults} className="font-bold text-copper-strong hover:underline">{t("users.bulk.selectFiltered", { count: data.total })}</button>
          </div>
        )}
        <div className="grid gap-3 py-3 md:hidden">
          {data.items.map((row) => {
            if (syncingIds.has(row.id)) return <UserCardSkeleton key={row.id} />;
            const state = statusOf(row);
            return (
              <article key={row.id} className="rounded-card border border-border-primary bg-surface-secondary p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <SelectionCheckbox checked={selectedIds.includes(row.id)} disabled={row.id === currentUser.id || syncingIds.has(row.id)} onChange={() => toggleUserSelection(row.id)} label={row.id === currentUser.id ? t("users.bulk.selfNotSelectable") : t("users.bulk.selectUser", { name: row.fullName })} />
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-body-sm font-bold text-copper-strong" aria-hidden="true">{initials(row.fullName)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-dash-body font-bold text-accent">{row.fullName}</p>
                      <p className="truncate text-dash-caption text-content-tertiary" dir="ltr">{row.email}</p>
                    </div>
                  </div>
                  {canManage && <div className="shrink-0">{rowActions(row)}</div>}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${statusClass[state]}`}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                    {t(`users.statuses.${state}`)}
                  </span>
                  {row.roles.map((item) => <span key={item} className={`inline-flex items-center rounded-control border px-2 py-0.5 text-dash-caption font-medium ${roleClass(item)}`}>{roleLabel(item)}</span>)}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border-primary pt-4 text-dash-caption">
                  <div><dt className="text-content-tertiary">{t("users.table.lastLogin")}</dt><dd className={`mt-1 ${row.lastLoginAt ? "text-content-secondary" : "text-content-tertiary italic"}`}>{row.lastLoginAt ? format.relativeTime(row.lastLoginAt, new Date()) : t("users.never")}</dd></div>
                  <div><dt className="text-content-tertiary">{t("users.table.phone")}</dt><dd className={`mt-1 ${row.phone ? "text-content-secondary" : "text-content-tertiary"}`} dir="ltr">{row.phone ?? "—"}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-155 table-fixed text-start">
            <thead>
              <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
                <th scope="col" className="w-12 px-4 py-4 text-start font-bold">
                  <SelectionCheckbox ref={selectAllRef} checked={allVisibleSelected} indeterminate={selectedVisibleCount > 0 && !allVisibleSelected} disabled={visibleIds.length === 0} onChange={togglePageSelection} label={t("users.bulk.selectPage")} />
                </th>
                <th scope="col" className="w-[50%] px-2 py-4 text-start font-bold xl:w-[36%]">
                  {t("users.table.user")}
                </th>
                <th scope="col" className="hidden w-[18%] px-4 py-4 text-start font-bold xl:table-cell">
                  {t("users.table.roles")}
                </th>
                <th scope="col" className="w-[24%] px-4 py-4 text-start font-bold xl:w-[16%]">
                  {t("users.table.status")}
                </th>
                <th scope="col" className="hidden w-[20%] px-4 py-4 text-start font-bold xl:table-cell">
                  {t("users.table.lastLogin")}
                </th>
                {canManage && (
                  <th scope="col" className="w-16 px-2 py-4 text-end font-bold">
                    {t("users.table.actions")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {data.items.map((row) => {
                if (syncingIds.has(row.id)) return <tr key={row.id} className="border-b border-border-primary"><td colSpan={canManage ? 6 : 5} className="px-4 py-5"><UserRowSkeleton /></td></tr>;
                const state = statusOf(row);
                const isSelf = row.id === currentUser.id;
                return (
                  <tr key={row.id} className="transition-colors hover:bg-surface-primary/60">
                    <td className="px-4 py-5">
                      <SelectionCheckbox checked={selectedIds.includes(row.id)} disabled={row.id === currentUser.id || syncingIds.has(row.id)} onChange={() => toggleUserSelection(row.id)} label={row.id === currentUser.id ? t("users.bulk.selfNotSelectable") : t("users.bulk.selectUser", { name: row.fullName })} />
                    </td>
                    <td className="px-2 py-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-body-sm font-bold text-copper-strong"
                          aria-hidden="true"
                        >
                          {initials(row.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-dash-body font-semibold text-accent truncate">
                            <span className="truncate">{row.fullName}</span>
                            {isSelf && (
                              <span className="shrink-0 inline-flex items-center px-2 py-0.5 bg-accent-subtle text-accent rounded-pill text-dash-caption font-bold">
                                {t("users.self")}
                              </span>
                            )}
                          </p>
                          <p className="text-dash-caption text-content-tertiary truncate" dir="ltr">
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
                    <td className="hidden px-4 py-5 xl:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {row.roles.length > 0 ? (
                          row.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center rounded-control border px-2 py-0.5 text-dash-caption font-medium ${roleClass(role)}`}
                            >
                              {roleLabel(role)}
                            </span>
                          ))
                        ) : (
                          <span className="text-dash-caption text-content-tertiary">
                            {t("users.noRoles")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-0 py-0.5 text-dash-caption font-bold whitespace-nowrap ${statusTextClass[state]}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                        {t(`users.statuses.${state}`)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-5 xl:table-cell">
                      <p className="text-dash-body-sm text-content-secondary whitespace-nowrap">
                        {row.lastLoginAt
                          ? format.relativeTime(row.lastLoginAt, new Date())
                          : <span className="text-content-tertiary italic">{t("users.never")}</span>}
                      </p>
                    </td>
                    {canManage && (
                      <td className="w-16 px-2 py-5">
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
            <p className="text-content-secondary text-dash-body">
              {debouncedSearch || status !== "all" || role !== "all"
                ? t("users.emptySearch")
                : t("users.empty")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-primary px-6 py-4">
            <p className="text-dash-body-sm text-content-tertiary">
              {t("users.pagination.showing", { from, to, total: data.total })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => { clearSelection(); setPage((p) => Math.max(1, p - 1)); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-dash-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <ChevronLeft className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
                <span>{t("users.pagination.previous")}</span>
              </button>
              <span className="text-dash-body-sm text-content-secondary px-2 whitespace-nowrap">
                {t("users.pagination.pageInfo", { page, totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => { clearSelection(); setPage((p) => Math.min(totalPages, p + 1)); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-10 rounded-pill text-dash-body-sm font-semibold text-accent border border-border-interactive bg-transparent transition-colors hover:bg-surface-tertiary disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span>{t("users.pagination.next")}</span>
                <ChevronRight className="w-4 h-4 rtl-mirror" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </section>

      {loading && (
        <p className="sr-only" role="status">
          {t("users.loading")}
        </p>
      )}

      <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open) { setConfirm(null); setBanReason(""); } }}>
        <AlertDialogContent closeLabel={t("users.dialog.cancel")}>
          <AlertDialogHeader><AlertDialogTitle>{confirmTitle}</AlertDialogTitle><AlertDialogDescription>{confirmDescription}</AlertDialogDescription></AlertDialogHeader>
          {confirm?.kind === "row" && confirm.action === "ban" && <label htmlFor="ban-reason" className="grid gap-1.5 text-dash-caption font-bold text-content-secondary"><span>{t("users.banDialog.reason")}</span><textarea id="ban-reason" value={banReason} onChange={(event) => setBanReason(event.target.value)} rows={3} maxLength={500} placeholder={t("users.banDialog.reasonPlaceholder")} className="w-full resize-y rounded-control border border-form-input-border bg-form-input-bg px-4 py-3 text-dash-body text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" /></label>}
          <AlertDialogFooter><AlertDialogCancel disabled={busyId !== null}>{t("users.dialog.cancel")}</AlertDialogCancel><AlertDialogAction disabled={busyId !== null} onClick={(event) => { event.preventDefault(); if (!confirm) return; if (confirm.kind === "bulk") { void executeBulkAction(); return; } if (confirm.action === "ban") { void runAction(confirm.user, { isBanned: true, banReason: banReason.trim() || null }); } else if (confirm.action === "deactivate") { void runAction(confirm.user, { isActive: false }); } else { void deleteUser(confirm.user); } }}>{busyId !== null && <Loader2 className="size-4 animate-spin" />}{t("users.dialog.confirm")}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={roleTarget !== null} onOpenChange={(open) => { if (!open) setRoleTarget(null); }}>
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-sm">
          <DialogHeader><DialogTitle className="text-accent">{t("users.changeRole.title")}</DialogTitle><DialogDescription>{roleTarget && t("users.changeRole.description", { name: roleTarget.fullName })}</DialogDescription></DialogHeader>
          <select value={roleValue} onChange={(event) => setRoleValue(event.target.value)} className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-4 text-dash-body text-accent outline-none focus-visible:border-copper">
            <option value="">{t("users.form.rolePlaceholder")}</option>{["admin", "doctor", "receptionist", "customer"].map((key) => <option key={key} value={key}>{roleLabel(key)}</option>)}
          </select>
          <DialogFooter><DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">{t("users.dialog.cancel")}</DialogClose><button type="button" disabled={!roleValue || busyId !== null} onClick={() => { if (roleTarget && roleValue) void saveRole(roleTarget, roleValue); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50">{t("users.changeRole.submit")}</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog user={passwordTarget} onOpenChange={(open) => { if (!open) setPasswordTarget(null); }} onSave={async (userId, password) => { setPasswordTarget(null); setBusyId(userId); setSyncing(userId, true); const pendingToast = toast.loading(t("users.toast.syncing")); try { const response = await fetch(`/api/v1/users/${userId}/password`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ password, confirmPassword: password }) }); if (!response.ok) throw new Error("password_failed"); await load({ search: debouncedSearch, status, role, page }); toast.success(t("users.toast.passwordSuccess"), { id: pendingToast }); } catch { toast.error(t("users.toast.error"), { id: pendingToast }); } finally { setSyncing(userId, false); setBusyId(null); } }} />

      <Dialog open={bulkResult !== null} onOpenChange={(open) => { if (!open) setBulkResult(null); }}>
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-lg">
          <DialogHeader><DialogTitle className="text-accent">{t("users.bulk.resultTitle")}</DialogTitle><DialogDescription>{t("users.bulk.resultDescription")}</DialogDescription></DialogHeader>
          {bulkResult && bulkResult.temporaryPasswords.length > 0 && <div className="max-h-64 overflow-y-auto rounded-control border border-border-primary"><div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border-primary bg-surface-tertiary/30 px-3 py-2 text-dash-caption font-bold text-content-secondary"><span>{t("users.table.user")}</span><span>{t("users.bulk.temporaryPassword")}</span></div>{bulkResult.temporaryPasswords.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border-primary px-3 py-2 font-mono text-dash-caption last:border-b-0"><span className="text-content-tertiary">{item.id.slice(0, 8)}</span><span className="text-accent">{item.password}</span></div>)}</div>}
          {bulkResult && bulkResult.failures.length > 0 && <p className="text-dash-body-sm text-error">{t("users.bulk.failureCount", { count: bulkResult.failures.length })}</p>}
          <DialogFooter>{bulkResult && bulkResult.temporaryPasswords.length > 0 && <><button type="button" onClick={() => void copyTemporaryPasswords()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent"><Copy className="size-4" />{t("users.bulk.copy")}</button><button type="button" onClick={downloadTemporaryPasswords} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent"><Download className="size-4" />{t("users.bulk.download")}</button></>}<DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">{t("users.dialog.close")}</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUserModal open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddError(null); }} onSubmit={createUser} serverError={addError} />
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-control bg-surface-tertiary/80 ${className}`} aria-hidden="true" />;
}

function UserCardSkeleton() {
  return <article className="rounded-card border border-border-primary bg-surface-secondary p-4" aria-label="Loading user"><div className="flex items-center gap-3"><SkeletonBlock className="size-11 rounded-pill" /><div className="grid flex-1 gap-2"><SkeletonBlock className="h-4 w-2/3" /><SkeletonBlock className="h-3 w-5/6" /></div><SkeletonBlock className="size-11 rounded-pill" /></div><div className="mt-4 flex gap-2"><SkeletonBlock className="h-6 w-16" /><SkeletonBlock className="h-6 w-20" /></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-primary pt-4"><SkeletonBlock className="h-3 w-20" /><SkeletonBlock className="h-3 w-24" /></div></article>;
}

function UserRowSkeleton() {
  return <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4"><div className="flex items-center gap-3"><SkeletonBlock className="size-12 rounded-pill" /><div className="grid gap-2"><SkeletonBlock className="h-4 w-36" /><SkeletonBlock className="h-3 w-48" /></div></div><SkeletonBlock className="h-6 w-20" /><SkeletonBlock className="h-4 w-16" /><SkeletonBlock className="size-11 rounded-pill" /></div>;
}
