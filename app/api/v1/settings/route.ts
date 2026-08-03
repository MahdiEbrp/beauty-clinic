import { withSecurity, jsonOk } from "@/lib/api/security";
import { resolveTarget } from "@/lib/settings/guard";
import { deleteSetting, getAllSettings, getSystemSettings, getUserSettings, upsertSetting } from "@/lib/settings/service";
import {
  upsertSettingSchema,
  deleteSettingsQuerySchema,
  settingsQuerySchema,
} from "@/lib/validation/settings";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    validate: { query: settingsQuerySchema },
  },
  async (_request, ctx) => {
    const session = ctx.session!;
    const { scope, page, limit, userId } = ctx.query!;
    const guard = resolveTarget(session, scope, userId);
    if (guard.status === "error") return guard.response;

    if (guard.scope === "system") {
      const items = await getSystemSettings();
      return jsonOk({ items });
    }

    if (guard.isAdmin) {
      const result = await getAllSettings(page, limit, { userId, scope });
      return jsonOk(result);
    }

    const items = await getUserSettings(guard.targetUserId!);
    return jsonOk({ items });
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    validate: { body: upsertSettingSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session!;
    const { scope, key, value, type, userId } = ctx.body!;
    const guard = resolveTarget(session, scope, userId);
    if (guard.status === "error") return guard.response;

    const setting = await upsertSetting(key, value, {
      scope: guard.scope,
      userId: guard.targetUserId ?? undefined,
      type,
    });
    return jsonOk({ setting });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    validate: { query: deleteSettingsQuerySchema },
    audit: true,
  },
  async (_request, ctx) => {
    const session = ctx.session!;
    const { scope, key, userId } = ctx.query!;
    const guard = resolveTarget(session, scope, userId);
    if (guard.status === "error") return guard.response;

    await deleteSetting(key, {
      scope: guard.scope,
      userId: guard.targetUserId ?? undefined,
    });
    return jsonOk({ deleted: true });
  },
);
