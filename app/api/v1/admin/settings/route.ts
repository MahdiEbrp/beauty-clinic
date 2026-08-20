import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  createSystemSetting,
  listSystemSettings,
} from "@/lib/settings/admin";
import {
  createSettingSchema,
  listSettingsQuerySchema,
} from "@/lib/validation/settings-admin";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "settings.read",
    validate: { query: listSettingsQuerySchema },
  },
  async (_request, ctx) => {
    const query = ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const result = await listSystemSettings({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      status: query.status,
    });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "settings.write",
    validate: { body: createSettingSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const result = await createSystemSetting({
      key: body.key,
      value: body.value,
      type: body.type,
      isActive: body.isActive,
      displayOrder: body.displayOrder,
      translations: body.translations,
    });
    return jsonOk(result, 201);
  },
);