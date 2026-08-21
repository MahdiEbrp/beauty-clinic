import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteCareGuide,
  getCareGuide,
  updateCareGuide,
} from "@/lib/services/service";
import { updateCareGuideSchema } from "@/lib/validation/care-guides";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_CARE_GUIDE_ID", "Invalid care guide id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "care-guides.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const guide = await getCareGuide(id);
    return jsonOk(guide);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.write",
    validate: { body: updateCareGuideSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateCareGuide(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "care-guides.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteCareGuide(id);
    return jsonOk({ ok: true });
  },
);
