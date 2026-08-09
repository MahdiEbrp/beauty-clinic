"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Loader2 } from "lucide-react";
import { initials } from "@/lib/utils";
import type { AdminUser } from "@/lib/users/service";
import { roleClass, statusOf, statusTextClass, SelectionCheckbox, useRoleLabel } from "./helpers";
import { RowActions } from "./row-actions";
import { UserRowSkeleton } from "./skeletons";
import { useUsers } from "./users-context";

function DesktopRow({ row }: { row: AdminUser }) {
  const t = useTranslations();
  const format = useFormatter();
  const roleLabel = useRoleLabel();
  const {
    currentUser,
    canManage,
    isSyncing,
    busyId,
    selectedIds,
    toggleUserSelection,
  } = useUsers();

  const state = statusOf(row);
  const isSelf = row.id === currentUser.id;

  return (
    <tr className="transition-colors hover:bg-surface-primary/60">
      <td className="px-4 py-5">
        <SelectionCheckbox
          checked={selectedIds.includes(row.id)}
          disabled={isSelf || isSyncing(row.id)}
          onChange={() => toggleUserSelection(row.id)}
          label={
            isSelf
              ? t("users.bulk.selfNotSelectable")
              : t("users.bulk.selectUser", { name: row.fullName })
          }
        />
      </td>
      <td className="px-2 py-5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-body-sm font-bold text-copper-strong" aria-hidden="true">
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
        <span className={`inline-flex items-center gap-1.5 px-0 py-0.5 text-dash-caption font-bold whitespace-nowrap ${/* eslint-disable-line security/detect-object-injection -- typed status class lookup */ statusTextClass[state]}`}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`users.statuses.${state}`)}
        </span>
      </td>
      <td className="hidden px-4 py-5 xl:table-cell">
        <p className="text-dash-body-sm text-content-secondary whitespace-nowrap">
          {row.lastLoginAt ? (
            format.relativeTime(row.lastLoginAt, new Date())
          ) : (
            <span className="text-content-tertiary italic">{t("users.never")}</span>
          )}
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
            <RowActions row={row} />
          </div>
        </td>
      )}
    </tr>
  );
}

export function UsersDesktopTable() {
  const t = useTranslations();
  const {
    data,
    canManage,
    isSyncing,
    selectedVisibleCount,
    allVisibleSelected,
    visibleIds,
    selectAllRef,
    togglePageSelection,
  } = useUsers();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-155 table-fixed text-start">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary/30 text-dash-caption text-content-secondary">
            <th scope="col" className="w-12 px-4 py-4 text-start font-bold">
              <SelectionCheckbox
                ref={selectAllRef}
                checked={allVisibleSelected}
                indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
                disabled={visibleIds.length === 0}
                onChange={togglePageSelection}
                label={t("users.bulk.selectPage")}
              />
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
          {data.items.map((row) =>
            isSyncing(row.id) ? (
              <tr key={row.id} className="border-b border-border-primary">
                <td colSpan={canManage ? 6 : 5} className="px-4 py-5">
                  <UserRowSkeleton />
                </td>
              </tr>
            ) : (
              <DesktopRow key={row.id} row={row} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
