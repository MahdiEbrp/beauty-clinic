import type { LangContent, LangSeo, Locale } from "./types";

/** Payload shared by create (POST) and edit (PATCH) service-category submits. */
export function buildCategoryPayload(input: {
  groupId: string;
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slug: string;
  iconKey: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
}) {
  return {
    groupId: input.groupId,
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

export type SubmitCategoryResult =
  | { ok: true }
  | { ok: false; kind: "slug-taken" }
  | { ok: false; kind: "server"; message?: string };

/** POSTs (create) or PATCHes (edit) a service category to the admin API. */
export async function submitCategoryRequest(input: {
  categoryId?: string;
  payload: unknown;
}): Promise<SubmitCategoryResult> {
  const url = input.categoryId
    ? `/api/v1/service-categories/${input.categoryId}`
    : "/api/v1/service-categories";
  const response = await fetch(url, {
    method: input.categoryId ? "PATCH" : "POST",
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
