import { jsonOk, withSecurity } from "@/lib/api/security";
import {
  bulkDeleteSettings,
  bulkUpdateSettings,
  findSettingIds,
} from "@/lib/settings/admin";
import { bulkSettingsSchema } from "@/lib/validation/settings-admin";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "settings.manage",
    validate: { body: bulkSettingsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const ids =
      body.scope === "filtered"
        ? await findSettingIds(body.filters ?? {})
        : [...new Set(body.ids ?? [])];
    if (body.action === "delete") {
      await bulkDeleteSettings(ids);
    } else {
      await bulkUpdateSettings(ids, body.action);
    }
    return jsonOk({ requested: ids.length, succeeded: ids.length, failures: [] });
  },
);