import type { AdminCareGuide } from "@/lib/services/care-guides-types";

export type StatusFilter = "all" | "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; guide: AdminCareGuide; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type GuideStatus = "active" | "inactive";
