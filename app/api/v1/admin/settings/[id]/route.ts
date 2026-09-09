import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteSystemSetting,
  getSystemSettingById,
  updateSystemSetting,
} from "@/lib/settings/admin";
import { updateSettingSchema } from "@/lib/validation/settings-admin";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "settings.read",
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return jsonError("INVALID_ID", "Invalid setting id.", 400);
    }
    const setting = await getSystemSettingById(id);
    if (!setting) return jsonError("SETTING_NOT_FOUND", "System setting not found.", 404);
    return jsonOk({ setting });
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "settings.write",
    validate: { body: updateSettingSchema },
    audit: true,
    notification: {
      entityType: "setting",
      entityId: (ctx) => ctx.params?.id,
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return jsonError("INVALID_ID", "Invalid setting id.", 400);
    }
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateSystemSetting(id, {
      value: body.value,
      isActive: body.isActive,
      displayOrder: body.displayOrder,
      translations: body.translations,
    });
    return jsonOk({ updated: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "settings.manage",
    audit: true,
    notification: {
      entityType: "setting",
      entityId: (ctx) => ctx.params?.id,
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return jsonError("INVALID_ID", "Invalid setting id.", 400);
    }
    await deleteSystemSetting(id);
    return jsonOk({ deleted: true });
  },
);