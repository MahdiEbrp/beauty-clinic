import type { LangContent, Locale } from "./types";

/** Payload shared by create (POST) and edit (PATCH) care-guide-item submits. */
export function buildItemPayload(input: {
  guideId: string;
  content: Record<Locale, LangContent>;
  isActive: boolean;
  highlighted: boolean;
  displayOrder: string;
}) {
  return {
    guideId: input.guideId,
    isActive: input.isActive,
    highlighted: input.highlighted,
    displayOrder: input.displayOrder ? Number(input.displayOrder) : undefined,
    translations: {
      en: {
        title: input.content.en.title.trim(),
        description: input.content.en.description.trim() || null,
      },
      fa: {
        title: input.content.fa.title.trim(),
        description: input.content.fa.description.trim() || null,
      },
    },
  };
}

export type SubmitItemResult =
  | { ok: true }
  | { ok: false; kind: "server"; message?: string };

/** POSTs (create) or PATCHes (edit) a care-guide item to the admin API. */
export async function submitItemRequest(input: {
  itemId?: string;
  payload: unknown;
}): Promise<SubmitItemResult> {
  const url = input.itemId
    ? `/api/v1/care-guide-items/${input.itemId}`
    : "/api/v1/care-guide-items";
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
  return { ok: false, kind: "server", message: errorBody?.error?.message };
}
