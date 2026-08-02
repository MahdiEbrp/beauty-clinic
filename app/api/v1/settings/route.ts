import { jsonError, jsonOk, withApiHandler } from "@/lib/api/errors";
import { readJsonBody } from "@/lib/api/request";
import { getSession } from "@/lib/auth/dal";
import { resolveTarget } from "@/lib/settings/guard";
import { deleteSetting, getAllSettings, getUserSettings, upsertSetting } from "@/lib/settings/service";
import {
  upsertSettingSchema,
  deleteSettingsQuerySchema,
  settingsQuerySchema,
} from "@/lib/validation/settings";

export const runtime = "nodejs";

export const GET = withApiHandler(async (request) => {
  const session = await getSession();
  if (!session) return jsonError("UNAUTHORIZED", "Not authenticated.", 401);

  const url = new URL(request.url);
  const parsed = settingsQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Invalid query parameters.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const { page, limit, userId } = parsed.data;
  const guard = resolveTarget(session, userId);
  if (guard.status === "error") return guard.response;

  if (guard.isAdmin) {
    const result = await getAllSettings(page, limit, userId);
    return jsonOk(result);
  }

  const items = await getUserSettings(guard.targetUserId);
  return jsonOk({ items });
});

export const POST = withApiHandler(async (request) => {
  const session = await getSession();
  if (!session) return jsonError("UNAUTHORIZED", "Not authenticated.", 401);

  const body = await readJsonBody(request);
  const parsed = upsertSettingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Invalid setting data.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const { key, value, type, userId } = parsed.data;
  const guard = resolveTarget(session, userId);
  if (guard.status === "error") return guard.response;

  const setting = await upsertSetting(guard.targetUserId, key, value, type);
  return jsonOk({ setting });
});

export const DELETE = withApiHandler(async (request) => {
  const session = await getSession();
  if (!session) return jsonError("UNAUTHORIZED", "Not authenticated.", 401);

  const url = new URL(request.url);
  const parsed = deleteSettingsQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    return jsonError(
      "VALIDATION_ERROR",
      "Invalid query parameters.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const guard = resolveTarget(session, parsed.data.userId);
  if (guard.status === "error") return guard.response;

  await deleteSetting(guard.targetUserId, parsed.data.key);
  return jsonOk({ deleted: true });
});
