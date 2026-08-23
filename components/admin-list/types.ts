import type { ReactNode } from "react";

export interface ListResult<T> {
  items: T[];
  total: number;
  perPage: number;
  totalPages: number;
  page: number;
}

export type ListFilterParams = {
  search: string;
  status: string;
  page: number;
};

export interface Column<T> {
  key: string;
  labelKey: string;
  /** `desktop` (default) only shows on md+, `mobile` shows on md and below. */
  responsive?: "desktop" | "mobile";
  render: (row: T) => ReactNode;
}

export type RowActionIcon =
  | "edit"
  | "activate"
  | "deactivate"
  | "delete"
  | "confirm"
  | "cancel"
  | "payment";

export interface RowActionItem {
  key: string;
  labelKey: string;
  onClick: () => void;
  icon: RowActionIcon;
  danger?: boolean;
}

export type DestructiveConfirm<T> =
  | { kind: "row"; action: string; row: T }
  | { kind: "bulk"; action: string };

export interface BulkResult {
  requested: number;
  succeeded: number;
  failures: Array<{ id: string; code: string }>;
}

export type RowActionCtx<T> = {
  isSyncing: (id: string) => boolean;
  setConfirm: (value: DestructiveConfirm<T> | null) => void;
};

export interface AdminListConfig<T extends { id: string }> {
    namespace: string;
  routeBase: string;
  backHref: string;
  addHref: string;
  listUrl: string;
  permissions: { read: string; write: string; manage: string };
  statusOptions: Array<{ value: string; labelKey: string }>;
  columns: Column<T>[];
  renderMobileCard: (row: T) => ReactNode;
  rowActionButtons: (row: T, ctx: RowActionCtx<T>) => RowActionItem[];
  /** Maps a row-level action key to the PATCH body used to persist it. */
  statusPatch: (action: string) => Record<string, unknown>;
  /** Human-readable (already translated) confirm heading/description per action. */
  confirmPhrase: (action: string, row: T) => { title: string; description: string };
  bulkActions: Array<{ key: string; labelKey: string; dangerous?: boolean }>;
  executeBulk: (
    action: string,
    ids: string[],
    filters: { search: string; status: string },
  ) => Promise<BulkResult>;
  itemUrl: (row: T) => string;
  deleteRow: (row: T) => Promise<void>;
  patchRow: (row: T, patch: Record<string, unknown>) => Promise<void>;
  perPage?: number;
}
