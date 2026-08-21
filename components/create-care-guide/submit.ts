import type { LangContent, Locale } from "./types";

/** Payload shared by create (POST) and edit (PATCH) care-guide submits. */
export function buildGuidePayload(input: {
  content: Record<Locale, LangContent>;
  slug: string;
  iconKey: string;
  displayOrder: string;
  isActive: boolean;
}) {
  return {
    slug: input.slug.trim(),
    icon: input.iconKey || null,
    displayOrder: Number(input.displayOrder) || 0,
    isActive: input.isActive,
    translations: {
      en: {
        name: input.content.en.name.trim(),
        description: input.content.en.description.trim() || null,
      },
      fa: {
        name: input.content.fa.name.trim(),
        description: input.content.fa.description.trim() || null,
      },
    },
  };
}

export type SubmitGuideResult =
  | { ok: true }
  | { ok: false; kind: "slug-taken" }
  | { ok: false; kind: "server"; message?: string };

/** POSTs (create) or PATCHes (edit) a care guide to the admin API. */
export async function submitGuideRequest(input: {
  guideId?: string;
  payload: unknown;
}): Promise<SubmitGuideResult> {
  const url = input.guideId
    ? `/api/v1/care-guides/${input.guideId}`
    : "/api/v1/care-guides";
  const response = await fetch(url, {
    method: input.guideId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input.payload),
  });
  if (response.ok) return { ok: true };

  const errorBody = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  if (errorBody?.error?.code === "SLUG_TAKEN") {
    return { ok: false, kind: "slug-taken" };
  }
  return { ok: false, kind: "server", message: errorBody?.error?.message };
}
