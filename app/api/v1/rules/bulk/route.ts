import { withSecurity, jsonOk } from "@/lib/api/security";
import {
  deleteRule,
  findRuleIds,
  updateRule,
} from "@/lib/services/service";
import { bulkRulesSchema } from "@/lib/validation/rules";

export const runtime = "nodejs";

export const POST = withSecurity(
  {
    auth: "required",
    permissions: "rules.manage",
    validate: { body: bulkRulesSchema },
    audit: true,
  },
  async (_request, ctx) => {
    const body =
      ctx.body ?? (() => { throw new Error("Validation body is missing"); })();
    const input = body;
    const ids =
      input.scope === "filtered"
        ? await findRuleIds({
            search: input.filters?.search,
            status: input.filters?.status,
          })
        : [...new Set(input.ids ?? [])];
    const failures: Array<{ id: string; code: string }> = [];

    for (const id of ids) {
      try {
        if (input.action === "activate") await updateRule(id, { isActive: true });
        if (input.action === "deactivate") await updateRule(id, { isActive: false });
        if (input.action === "delete") await deleteRule(id);
      } catch (error) {
        failures.push({
          id,
          code: error instanceof Error ? error.message : "OPERATION_FAILED",
        });
      }
    }

    return jsonOk({
      requested: ids.length,
      succeeded: ids.length - failures.length,
      failures,
    });
  },
);
