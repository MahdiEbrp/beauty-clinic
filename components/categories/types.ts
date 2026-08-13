import type { AdminServiceCategory } from "@/lib/services/types";

export type StatusFilter = "all" | "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; category: AdminServiceCategory; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type CategoryStatus = "active" | "inactive";
