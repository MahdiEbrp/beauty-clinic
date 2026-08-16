import type { AdminRule } from "@/lib/services/rules-types";

export type RuleStatus = "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; rule: AdminRule; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type RuleStatusFilter = "all" | "active" | "inactive";
