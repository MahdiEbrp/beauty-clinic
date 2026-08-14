import type { LangContent, LangSeo, Locale } from "./types";

export type SubmitServiceResult =
  | { ok: true }
  | { ok: false; kind: "slug-taken" }
  | { ok: false; kind: "server"; message?: string };

export type ServicePayloadInput = {
  categoryId: string;
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slug: string;
  price: string | null;
  priceType: string;
  durationMin: string | null;
  sessionsCount: string;
  coverImage: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: string;
};

export function buildServicePayload(input: ServicePayloadInput) {
  return {
    categoryId: input.categoryId,
    slug: input.slug.trim(),
    price: input.price === null ? null : Number(input.price),
    priceType: input.priceType,
    durationMin:
      input.durationMin === null ? null : Number(input.durationMin),
    sessionsCount: Number(input.sessionsCount) || 1,
    coverImage: input.coverImage.trim() || null,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
    displayOrder: Number(input.displayOrder) || 0,
    translations: {
      en: {
        title: input.content.en.title.trim(),
        shortDesc: input.content.en.shortDesc.trim() || null,
        fullDesc: input.content.en.fullDesc.trim() || null,
        seoTitle: input.seo.en.title.trim() || null,
        seoDescription: input.seo.en.description.trim() || null,
      },
      fa: {
        title: input.content.fa.title.trim(),
        shortDesc: input.content.fa.shortDesc.trim() || null,
        fullDesc: input.content.fa.fullDesc.trim() || null,
        seoTitle: input.seo.fa.title.trim() || null,
        seoDescription: input.seo.fa.description.trim() || null,
      },
    },
  };
}

/** POSTs (create) or PATCHes (edit) a service to the admin API. */
export async function submitServiceRequest(input: {
  serviceId?: string;
  payload: unknown;
}): Promise<SubmitServiceResult> {
  const url = input.serviceId
    ? `/api/v1/services/${input.serviceId}`
    : "/api/v1/services";
  const response = await fetch(url, {
    method: input.serviceId ? "PATCH" : "POST",
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
