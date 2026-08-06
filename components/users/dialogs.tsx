"use client";

import { useTranslations } from "next-intl";
import { Copy, Download, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddUserModal from "@/components/AddUserModal";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { ROLE_KEYS } from "./types";
import { useRoleLabel } from "./helpers";
import { useUsers } from "./users-context";

export function UsersDialogs() {
  const t = useTranslations();
  const roleLabel = useRoleLabel();
  const {
    busyId,
    confirm,
    setConfirm,
    banReason,
    setBanReason,
    confirmTitle,
    confirmDescription,
    runAction,
    deleteUser,
    executeBulkAction,
    addOpen,
    setAddOpen,
    addError,
    setAddError,
    createUser,
    changePassword,
    passwordTarget,
    setPasswordTarget,
    roleTarget,
    setRoleTarget,
    roleValue,
    setRoleValue,
    saveRole,
    bulkResult,
    setBulkResult,
    copyTemporaryPasswords,
    downloadTemporaryPasswords,
  } = useUsers();

  return (
    <>
      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
            setBanReason("");
          }
        }}
      >
        <AlertDialogContent closeLabel={t("users.dialog.cancel")}>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirm?.kind === "row" && confirm.action === "ban" && (
            <label
              htmlFor="ban-reason"
              className="grid gap-1.5 text-dash-caption font-bold text-content-secondary"
            >
              <span>{t("users.banDialog.reason")}</span>
              <textarea
                id="ban-reason"
                value={banReason}
                onChange={(event) => setBanReason(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder={t("users.banDialog.reasonPlaceholder")}
                className="w-full resize-y rounded-control border border-form-input-border bg-form-input-bg px-4 py-3 text-dash-body text-accent outline-none focus-visible:border-copper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
            </label>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>
              {t("users.dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={busyId !== null}
              onClick={(event) => {
                event.preventDefault();
                if (!confirm) return;
                if (confirm.kind === "bulk") {
                  void executeBulkAction();
                  return;
                }
                if (confirm.action === "ban") {
                  void runAction(confirm.user, {
                    isBanned: true,
                    banReason: banReason.trim() || null,
                  });
                } else if (confirm.action === "deactivate") {
                  void runAction(confirm.user, { isActive: false });
                } else {
                  void deleteUser(confirm.user);
                }
              }}
            >
              {busyId !== null && <Loader2 className="size-4 animate-spin" />}
              {t("users.dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={roleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRoleTarget(null);
        }}
      >
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-accent">
              {t("users.changeRole.title")}
            </DialogTitle>
            <DialogDescription>
              {roleTarget &&
                t("users.changeRole.description", {
                  name: roleTarget.fullName,
                })}
            </DialogDescription>
          </DialogHeader>
          <select
            value={roleValue}
            onChange={(event) => setRoleValue(event.target.value)}
            className="min-h-11 w-full rounded-control border border-form-input-border bg-form-input-bg px-4 text-dash-body text-accent outline-none focus-visible:border-copper"
          >
            <option value="">{t("users.form.rolePlaceholder")}</option>
            {ROLE_KEYS.map((key) => (
              <option key={key} value={key}>
                {roleLabel(key)}
              </option>
            ))}
          </select>
          <DialogFooter>
            <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
              {t("users.dialog.cancel")}
            </DialogClose>
            <button
              type="button"
              disabled={!roleValue || busyId !== null}
              onClick={() => {
                if (roleTarget && roleValue) void saveRole(roleTarget, roleValue);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-accent px-5 text-dash-body-sm font-bold text-content-contrast disabled:opacity-50"
            >
              {t("users.changeRole.submit")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        user={passwordTarget}
        onOpenChange={(open) => {
          if (!open) setPasswordTarget(null);
        }}
        onSave={(userId, password) => changePassword(userId, password)}
      />

      <Dialog
        open={bulkResult !== null}
        onOpenChange={(open) => {
          if (!open) setBulkResult(null);
        }}
      >
        <DialogContent closeLabel={t("users.dialog.cancel")} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-accent">
              {t("users.bulk.resultTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("users.bulk.resultDescription")}
            </DialogDescription>
          </DialogHeader>
          {bulkResult && bulkResult.temporaryPasswords.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-control border border-border-primary">
              <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border-primary bg-surface-tertiary/30 px-3 py-2 text-dash-caption font-bold text-content-secondary">
                <span>{t("users.table.user")}</span>
                <span>{t("users.bulk.temporaryPassword")}</span>
              </div>
              {bulkResult.temporaryPasswords.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-border-primary px-3 py-2 font-mono text-dash-caption last:border-b-0"
                >
                  <span className="text-content-tertiary">
                    {item.id.slice(0, 8)}
                  </span>
                  <span className="text-accent">{item.password}</span>
                </div>
              ))}
            </div>
          )}
          {bulkResult && bulkResult.failures.length > 0 && (
            <p className="text-dash-body-sm text-error">
              {t("users.bulk.failureCount", {
                count: bulkResult.failures.length,
              })}
            </p>
          )}
          <DialogFooter>
            {bulkResult && bulkResult.temporaryPasswords.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => void copyTemporaryPasswords()}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent"
                >
                  <Copy className="size-4" />
                  {t("users.bulk.copy")}
                </button>
                <button
                  type="button"
                  onClick={downloadTemporaryPasswords}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-border-interactive px-4 text-dash-body-sm font-bold text-accent"
                >
                  <Download className="size-4" />
                  {t("users.bulk.download")}
                </button>
              </>
            )}
            <DialogClose className="inline-flex min-h-11 items-center justify-center rounded-pill bg-surface-tertiary px-5 text-dash-body-sm font-bold text-accent">
              {t("users.dialog.close")}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUserModal
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setAddError(null);
        }}
        onSubmit={createUser}
        serverError={addError}
      />
    </>
  );
}
