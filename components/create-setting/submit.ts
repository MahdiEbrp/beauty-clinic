export type SubmitSettingResult =
  | { ok: true }
  | { ok: false; kind: "key-taken" }
  | { ok: false; kind: "server"; message?: string };

export async function submitSettingRequest(input: {
  settingId?: string;
  payload: unknown;
}): Promise<SubmitSettingResult> {
  const url = input.settingId
    ? `/api/v1/admin/settings/${input.settingId}`
    : "/api/v1/admin/settings";
  const response = await fetch(url, {
    method: input.settingId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input.payload),
  });
  if (response.ok) return { ok: true };

  const errorBody = (await response.json().catch(() => null)) as
    | { error?: { code?: string; message?: string } }
    | null;
  if (errorBody?.error?.code === "KEY_TAKEN") {
    return { ok: false, kind: "key-taken" };
  }
  return { ok: false, kind: "server", message: errorBody?.error?.message };
}