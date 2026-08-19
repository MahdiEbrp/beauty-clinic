"use client";

import type { AdminCollectionRow } from "@/lib/landing/admin/types";
import type { CollectionKey } from "./types";

export function endpointFor(key: CollectionKey): string {
  return `/api/v1/landing/${key}`;
}

export function bulkEndpointFor(key: CollectionKey): string {
  return `/api/v1/landing/${key}/bulk`;
}

export function addPathFor(key: CollectionKey): string {
  return `/dashboard/landing/${key}/add`;
}

export function editPathFor(key: CollectionKey, id: string): string {
  return `/dashboard/landing/${key}/${id}/edit`;
}

export function rowTitle(row: AdminCollectionRow): string {
  if ("text" in row) return row.text;
  if ("title" in row) return row.title;
  if ("label" in row) return row.label;
  if ("alt" in row) return row.alt;
  return "";
}

export function rowMeta(row: AdminCollectionRow): string {
  if ("text" in row) return row.key;
  if ("title" in row) return row.description ?? "";
  if ("label" in row) return `${row.value}${row.plus ? "+" : ""}`;
  if ("alt" in row) return row.caption ?? "";
  return "";
}

export function rowKey(row: AdminCollectionRow): string {
  return row.key;
}
