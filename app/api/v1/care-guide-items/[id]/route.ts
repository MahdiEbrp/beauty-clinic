import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteCareGuideItem,
  getCareGuideItem,
  updateCareGuideItem,
} from "@/lib/services/service";
import { updateCareGuideItemSchema } from "@/lib/validation/care-guides";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_CARE_GUIDE_ITEM_ID", "Invalid care guide item id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "care-guides.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const item = await getCareGuideItem(id);
    return jsonOk(item);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "care-guides.write",
    validate: { body: updateCareGuideItemSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateCareGuideItem(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "care-guides.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteCareGuideItem(id);
    return jsonOk({ ok: true });
  },
);
