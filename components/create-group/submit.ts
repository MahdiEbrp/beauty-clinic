import type { LangContent, LangSeo, Locale } from "./types";

/** Payload shared by create (POST) and edit (PATCH) service-group submits. */
export function buildGroupPayload(input: {
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slug: string;
  iconKey: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
}) {
  return {
    slug: input.slug.trim(),
    icon: input.iconKey || null,
    image: input.imageUrl.trim() || null,
    displayOrder: Number(input.displayOrder) || 0,
    isActive: input.isActive,
    translations: {
      en: {
        name: input.content.en.name.trim(),
        description: input.content.en.description.trim() || null,
        seoTitle: input.seo.en.title.trim() || null,
        seoDescription: input.seo.en.description.trim() || null,
      },
      fa: {
        name: input.content.fa.name.trim(),
        description: input.content.fa.description.trim() || null,
        seoTitle: input.seo.fa.title.trim() || null,
        seoDescription: input.seo.fa.description.trim() || null,
      },
    },
  };
}

export type SubmitGroupResult =
  | { ok: true }
  | { ok: false; kind: "slug-taken" }
  | { ok: false; kind: "server"; message?: string };

/** POSTs (create) or PATCHes (edit) a service group to the admin API. */
export async function submitGroupRequest(input: {
  groupId?: string;
  payload: unknown;
}): Promise<SubmitGroupResult> {
  const url = input.groupId
    ? `/api/v1/service-groups/${input.groupId}`
    : "/api/v1/service-groups";
  const response = await fetch(url, {
    method: input.groupId ? "PATCH" : "POST",
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
