import type { AdminServiceGroup } from "@/lib/services/types";

export type StatusFilter = "all" | "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; group: AdminServiceGroup; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type GroupStatus = "active" | "inactive";
