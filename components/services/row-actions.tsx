"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import type { AdminService } from "@/lib/services/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useServices } from "./services-context";

export function ServiceRowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: AdminService;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations();
  const { canWrite, canManage, isSyncing } = useServices();
  const disabled = isSyncing(row.id);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={t("servicesCatalog.actions.menu")}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary p-0 text-accent shadow-elevation-1 transition hover:bg-surface-tertiary hover:shadow-elevation-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <MoreVertical className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canWrite && (
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onEdit} className="text-accent">
              <Pencil className="size-4" strokeWidth={2} />
              <span>{t("servicesCatalog.actions.edit")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        {canWrite && canManage && <DropdownMenuSeparator />}
        {canManage && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-error focus:bg-error/10 focus:text-error"
            >
              <Trash2 className="size-4" strokeWidth={2} />
              <span>{t("servicesCatalog.actions.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
