import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/lib/services/service";
import { updateServiceCategorySchema } from "@/lib/validation/services";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_CATEGORY_ID", "Invalid service category id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "services.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const category = await getCategory(id);
    return jsonOk(category);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "services.write",
    validate: { body: updateServiceCategorySchema },
    audit: true,
    notification: {
      entityType: "service_category",
      entityId: (ctx) => ctx.params?.id,
      action: "updated",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateCategory(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  {
    auth: "required",
    permissions: "services.manage",
    audit: true,
    notification: {
      entityType: "service_category",
      entityId: (ctx) => ctx.params?.id,
      action: "deleted",
    },
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteCategory(id);
    return jsonOk({ ok: true });
  },
);
