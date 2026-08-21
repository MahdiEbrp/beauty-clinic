import type { AdminCareGuideItem } from "@/lib/services/care-guides-types";

export type StatusFilter = "all" | "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; item: AdminCareGuideItem; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export type ItemStatus = "active" | "inactive";

export type GuideOption = { id: string; name: string };
