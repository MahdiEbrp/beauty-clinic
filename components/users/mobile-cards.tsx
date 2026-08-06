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
    selectedIds,
    toggleUserSelection,
  } = useUsers();

  const state = statusOf(row);
  const isSelf = row.id === currentUser.id;

  return (
    <article className="rounded-card border border-border-primary bg-surface-secondary p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
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
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-primary bg-surface-tertiary text-dash-body-sm font-bold text-copper-strong"
            aria-hidden="true"
          >
            {initials(row.fullName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-dash-body font-bold text-accent">
              {row.fullName}
            </p>
            <p
              className="truncate text-dash-caption text-content-tertiary"
              dir="ltr"
            >
              {row.email}
            </p>
          </div>
        </div>
        {canManage && <div className="shrink-0">{<RowActions row={row} />}</div>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-dash-caption font-bold ${statusClass[state]}`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t(`users.statuses.${state}`)}
        </span>
        {row.roles.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center rounded-control border px-2 py-0.5 text-dash-caption font-medium ${roleClass(item)}`}
          >
            {roleLabel(item)}
          </span>
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border-primary pt-4 text-dash-caption">
        <div>
          <dt className="text-content-tertiary">{t("users.table.lastLogin")}</dt>
          <dd className={`mt-1 ${row.lastLoginAt ? "text-content-secondary" : "text-content-tertiary italic"}`}>
            {row.lastLoginAt
              ? format.relativeTime(row.lastLoginAt, new Date())
              : t("users.never")}
          </dd>
        </div>
        <div>
          <dt className="text-content-tertiary">{t("users.table.phone")}</dt>
          <dd className={`mt-1 ${row.phone ? "text-content-secondary" : "text-content-tertiary"}`} dir="ltr">
            {row.phone ?? "—"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function UsersMobileCards() {
  const { data, isSyncing } = useUsers();

  return (
    <div className="grid gap-3 py-3 md:hidden">
      {data.items.map((row) => {
        if (isSyncing(row.id)) return <UserCardSkeleton key={row.id} />;
        return <MobileCard key={row.id} row={row} />;
      })}
    </div>
  );
}
