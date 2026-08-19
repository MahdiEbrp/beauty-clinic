import { withSecurity } from "@/lib/api/security";
import { jsonError, jsonOk } from "@/lib/api/errors";
import {
  getLandingAdminOverview,
  getLandingSettings,
  updateSettings,
} from "@/lib/landing/admin";
import { updateSettingsSchema } from "@/lib/validation/landing";

export const runtime = "nodejs";

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async () => {
    const [overview, settings] = await Promise.all([
      getLandingAdminOverview(),
      getLandingSettings(),
    ]);
    if (!overview.hasPages) {
      return jsonError("LANDING_NOT_FOUND", "Landing page not found.", 404);
    }
    return jsonOk({ overview, settings });
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateSettingsSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateSettings(body);
    return jsonOk({ ok: true });
  },
);