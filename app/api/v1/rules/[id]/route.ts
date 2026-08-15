import { z } from "zod";

import { jsonError, jsonOk, withSecurity } from "@/lib/api/security";
import {
  deleteRule,
  getRule,
  updateRule,
} from "@/lib/services/service";
import { updateRuleSchema } from "@/lib/validation/rules";

export const runtime = "nodejs";

function invalidId() {
  return jsonError("INVALID_RULE_ID", "Invalid rule id.", 400);
}

export const GET = withSecurity(
  { auth: "required", permissions: "rules.read" },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const rule = await getRule(id);
    return jsonOk(rule);
  },
);

export const PATCH = withSecurity(
  {
    auth: "required",
    permissions: "rules.write",
    validate: { body: updateRuleSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    await updateRule(id, body);
    return jsonOk({ ok: true });
  },
);

export const DELETE = withSecurity(
  { auth: "required", permissions: "rules.manage", audit: true },
  async (_request, ctx) => {
    const id = ctx.params?.id;
    if (!id || !z.uuid().safeParse(id).success) return invalidId();
    await deleteRule(id);
    return jsonOk({ ok: true });
  },
);
