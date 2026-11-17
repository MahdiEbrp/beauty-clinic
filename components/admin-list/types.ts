import type { ReactNode } from "react";
import type { MessageKey, MessageNamespace } from "@/src/i18n/message-key";

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
  labelKey: MessageKey;
  /** `desktop` (default) only shows on md+, `mobile` shows on md and below. */
  responsive?: "desktop" | "mobile";
  render: (row: T) => ReactNode;
}

export type RowActionIcon =
  | "edit"
  | "slots"
  | "activate"
  | "deactivate"
  | "delete"
  | "confirm"
  | "cancel"
  | "payment";

export interface RowActionItem {
  key: string;
  labelKey: MessageKey;
  onClick: () => void;
  icon: RowActionIcon;
  danger?: boolean;
  /** Rendered greyed-out and inert (e.g. a policy window has passed). */
  disabled?: boolean;
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
    namespace: MessageNamespace;
  routeBase: string;
  backHref: string;
  /** Label for the header's back link (defaults to the bookings admin copy). */
  backLabelKey?: MessageKey;
  addHref: string;
  listUrl: string;
  permissions: { read: string; write: string; manage: string };
  statusOptions: Array<{ value: string; labelKey: MessageKey }>;
  columns: Column<T>[];
  renderMobileCard: (row: T) => ReactNode;
  rowActionButtons: (row: T, ctx: RowActionCtx<T>) => RowActionItem[];
  /** Maps a row-level action key to the PATCH body used to persist it. */
  statusPatch: (action: string) => Record<string, unknown>;
  /** Human-readable (already translated) confirm heading/description per action. */
  confirmPhrase: (action: string, row: T) => { title: string; description: string };
  bulkActions: Array<{ key: string; labelKey: MessageKey; dangerous?: boolean }>;
  executeBulk: (
    action: string,
    ids: string[],
    filters: { search: string; status: string },
  ) => Promise<BulkResult>;
  itemUrl: (row: T) => string;
  deleteRow: (row: T) => Promise<void>;
  patchRow: (row: T, patch: Record<string, unknown>) => Promise<void>;
  /** Optional extra button rendered in the header (e.g. "Generate all slots"). */
  headerAction?: {
    labelKey: MessageKey;
    icon: "sparkles" | "refresh";
    onClick: () => void | Promise<void>;
    busy?: boolean;
  };
  /** Optional domain-specific bulk editor rendered beside generic bulk actions. */
  renderBulkSelection?: (ctx: { ids: string[]; scope: "page" | "filtered"; onComplete: () => void }) => ReactNode;
  perPage?: number;
  /** Initial status filter for the list (defaults to "all"). */
  defaultStatus?: string;
}
