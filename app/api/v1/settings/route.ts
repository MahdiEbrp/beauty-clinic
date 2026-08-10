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
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { scope, page, limit, userId } = query;
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

    const targetUserId = guard.targetUserId ?? (() => { throw new Error("Target user ID is missing"); })();
    const items = await getUserSettings(targetUserId);
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
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const { scope, key, value, type, userId } = body;
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
    const session = ctx.session ?? (() => { throw new Error("Session is missing"); })();
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { scope, key, userId } = query;
    const guard = resolveTarget(session, scope, userId);
    if (guard.status === "error") return guard.response;

    await deleteSetting(key, {
      scope: guard.scope,
      userId: guard.targetUserId ?? undefined,
    });
    return jsonOk({ deleted: true });
  },
);
