"use client";

import type { CollectionKey } from "../types";

export type SubmitItemResult =
  | { ok: true }
  | { ok: false; message?: string };

export async function submitItemRequest(input: {
  collection: CollectionKey;
  itemId?: string;
  payload: unknown;
}): Promise<SubmitItemResult> {
  const base = `/api/v1/landing/${input.collection}`;
  const url = input.itemId ? `${base}/${input.itemId}` : base;
  const response = await fetch(url, {
    method: input.itemId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input.payload),
  });
  if (response.ok) return { ok: true };

  const errorBody = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  return {
    ok: false,
    message: errorBody?.error?.message,
  };
}