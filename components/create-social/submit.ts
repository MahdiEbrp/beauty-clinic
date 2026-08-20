export type SubmitSocialLinkResult =
  | { ok: true }
  | { ok: false; kind: "server"; message?: string };

export async function submitSocialLinkRequest(input: {
  linkId?: string;
  payload: unknown;
}): Promise<SubmitSocialLinkResult> {
  const url = input.linkId
    ? `/api/v1/admin/social-links/${input.linkId}`
    : "/api/v1/admin/social-links";
  const response = await fetch(url, {
    method: input.linkId ? "PATCH" : "POST",
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