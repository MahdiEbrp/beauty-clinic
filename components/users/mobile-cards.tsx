"use client";

import { useTranslations, useFormatter } from "next-intl";
import { initials } from "@/lib/utils";
import type { AdminUser } from "@/lib/users/service";
import {
  roleClass,
  statusClass,
  statusOf,
  SelectionCheckbox,
  useRoleLabel,
} from "./helpers";
import { RowActions } from "./row-actions";
import { UserCardSkeleton } from "./skeletons";
import { useUsers } from "./users-context";

function MobileCard({ row }: { row: AdminUser }) {
  const t = useTranslations();
  const format = useFormatter();
  const roleLabel = useRoleLabel();
  const {
    currentUser,
    canManage,
    isSyncing,
    selectionMode,
    selectedIds,
    toggleUserSelection,
  } = useUsers();

  const state = statusOf(row);
  const isSelf = row.id === currentUser.id;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-3">
      <div className="flex items-center gap-3">
        {selectionMode && (
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
        )}
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-body-sm font-bold text-copper-strong"
          aria-hidden="true"
        >
          {initials(row.fullName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-dash-body font-bold text-accent">
            <span className="truncate">{row.fullName}</span>
            {isSelf && (
              <span className="shrink-0 inline-flex items-center rounded-pill bg-accent-subtle px-2 py-0.5 text-dash-caption font-bold text-accent">
                {t("users.self")}
              </span>
            )}
          </p>
          <p className="truncate text-dash-caption text-content-tertiary" dir="ltr">
            {row.email}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill border px-2 py-0.5 text-dash-caption font-bold ${/* eslint-disable-line security/detect-object-injection -- typed status class lookup */ statusClass[state]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {t(`users.statuses.${state}`)}
            </span>
            {row.roles.map((item) => (
              <span
                key={item}
                className={`inline-flex items-center rounded-control border px-1.5 py-0.5 text-dash-caption font-medium ${roleClass(item)}`}
              >
                {roleLabel(item)}
              </span>
            ))}
            {row.lastLoginAt && (
              <span className="text-dash-caption text-content-tertiary">
                {t("users.table.lastLogin")}:{" "}
                {format.relativeTime(row.lastLoginAt, new Date())}
              </span>
            )}
          </div>
        </div>
        {canManage && <div className="shrink-0 self-center">{<RowActions row={row} />}</div>}
      </div>
    </article>
  );
}

export function UsersMobileCards() {
  const { data, isSyncing } = useUsers();

  return (
    <div className="grid gap-2.5 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <UserCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
