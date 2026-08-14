import type { AdminService } from "@/lib/services/types";

export type ServiceStatus = "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; service: AdminService; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type FeaturedFilter = "all" | "yes" | "no";
export type ServiceStatusFilter = "all" | "active" | "inactive";
