import { withSecurity, jsonOk } from "@/lib/api/security";
import { createRule, listRulesAdmin } from "@/lib/services/service";
import { createRuleSchema } from "@/lib/validation/rules";
import { listRulesQuerySchema } from "@/lib/validation/rules";

export const runtime = "nodejs";

export const GET = withSecurity(
  {
    auth: "required",
    permissions: "rules.read",
    validate: { query: listRulesQuerySchema },
  },
  async (_request, ctx) => {
    const query =
      ctx.query ?? (() => { throw new Error("Query params are missing"); })();
    const { page, perPage, search, status } = query;
    const result = await listRulesAdmin({ page, perPage, search, status });
    return jsonOk(result);
  },
);

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "rules.write",
    validate: { body: createRuleSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body = ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const rule = await createRule(body);
    return jsonOk(rule, 201);
  },
);
