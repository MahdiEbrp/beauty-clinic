import type { LangContent, Locale } from "./types";

/** Payload shared by create (POST) and edit (PATCH) rule submits. */
export function buildRulePayload(input: {
  content: Record<Locale, LangContent>;
  slug: string;
  iconKey: string;
  color: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
  highlighted: boolean;
}) {
  return {
    slug: input.slug.trim(),
    icon: input.iconKey || null,
    color: input.color || null,
    image: input.imageUrl.trim() || null,
    displayOrder: Number(input.displayOrder) || 0,
    isActive: input.isActive,
    highlighted: input.highlighted,
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

export type SubmitRuleResult =
  | { ok: true }
  | { ok: false; kind: "slug-taken" }
  | { ok: false; kind: "server"; message?: string };

/** POSTs (create) or PATCHes (edit) a clinic rule to the admin API. */
export async function submitRuleRequest(input: {
  ruleId?: string;
  payload: unknown;
}): Promise<SubmitRuleResult> {
  const url = input.ruleId
    ? `/api/v1/rules/${input.ruleId}`
    : "/api/v1/rules";
  const response = await fetch(url, {
    method: input.ruleId ? "PATCH" : "POST",
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
