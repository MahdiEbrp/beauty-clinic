"use client";

import type { LandingCollectionKey } from "@/lib/landing/admin/types";

export type CollectionKey = LandingCollectionKey;
export type StatusFilter = "all" | "active" | "inactive";
export type ConfirmAction = "deactivate" | "delete";
export type BulkAction = "activate" | "deactivate" | "delete";
export type DestructiveConfirm =
  | { kind: "row"; rowId: string; action: ConfirmAction }
  | { kind: "bulk"; action: BulkAction };

export const COLLECTION_KEYS: CollectionKey[] = [
  "marquee",
  "services",
  "stats",
  "gallery",
];
